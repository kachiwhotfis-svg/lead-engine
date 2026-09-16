import { ImapFlow } from "imapflow";
import { findLeadByEmail, updateLeadStage } from "../../airtable/leads";
import { logInteraction } from "../../airtable/interactions";

export interface ReplyCheckResult {
  checked: number;
  matched: number;
  errors: string[];
}

export async function checkForReplies(): Promise<ReplyCheckResult> {
  const host = process.env.IMAP_HOST;
  const port = process.env.IMAP_PORT;
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Missing IMAP_HOST, IMAP_PORT, IMAP_USER, or IMAP_PASS.");
  }

  const client = new ImapFlow({
    host,
    port: Number(port),
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  const result: ReplyCheckResult = { checked: 0, matched: 0, errors: [] };

  await client.connect();
  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const uids = await client.search({ seen: false });
      for (const uid of uids || []) {
        result.checked++;
        try {
          const message = await client.fetchOne(uid, { envelope: true, source: true });
          if (!message) continue;

          const fromAddress = message.envelope?.from?.[0]?.address;
          if (!fromAddress) continue;

          const lead = await findLeadByEmail(fromAddress);
          if (!lead) continue;

          if (lead.fields.Stage === "Cold" || lead.fields.Stage === "Contacted") {
            await updateLeadStage(lead.id, "Warm");
          }

          await logInteraction({
            Lead: [lead.id],
            Direction: "Inbound",
            Channel: "Email",
            Content: message.envelope?.subject ?? "(no subject)",
            "Occurred At": (message.envelope?.date ?? new Date()).toISOString(),
          });

          result.matched++;
          await client.messageFlagsAdd(uid, ["\\Seen"]);
        } catch (err) {
          result.errors.push(err instanceof Error ? err.message : String(err));
        }
      }
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }

  return result;
}
