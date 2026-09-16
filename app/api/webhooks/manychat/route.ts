import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createLead,
  findLeadByManyChatSubscriberId,
  updateLeadStage,
} from "@/lib/airtable/leads";
import { logInteraction } from "@/lib/airtable/interactions";

const bodySchema = z.object({
  subscriber_id: z.string().min(1),
  platform: z.enum(["instagram", "whatsapp"]),
  handle: z.string().min(1),
  name: z.string().optional(),
  direction: z.enum(["inbound", "outbound"]),
  message: z.string().default(""),
  vertical: z.string().default("Unassigned"),
});

export async function POST(request: NextRequest) {
  const secret = process.env.MANYCHAT_WEBHOOK_SECRET;
  if (secret && request.headers.get("x-manychat-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const platformField = data.platform === "instagram" ? "Instagram" : "WhatsApp";
  const handleField =
    data.platform === "instagram" ? "Instagram Handle" : "WhatsApp Number";

  let lead = await findLeadByManyChatSubscriberId(data.subscriber_id);

  if (!lead) {
    lead = await createLead({
      "Business Name": data.name,
      Platform: platformField,
      Vertical: data.vertical,
      [handleField]: data.handle,
      "ManyChat Subscriber ID": data.subscriber_id,
      Stage: "Cold",
    } as Parameters<typeof createLead>[0]);
  }

  await logInteraction({
    Lead: [lead.id],
    Direction: data.direction === "inbound" ? "Inbound" : "Outbound",
    Channel: platformField,
    Content: data.message,
  });

  if (data.direction === "inbound" && (lead.fields.Stage === "Cold" || lead.fields.Stage === "Contacted")) {
    await updateLeadStage(lead.id, "Warm");
  } else if (data.direction === "outbound" && lead.fields.Stage === "Cold") {
    await updateLeadStage(lead.id, "Contacted");
  }

  return NextResponse.json({ ok: true, leadId: lead.id });
}
