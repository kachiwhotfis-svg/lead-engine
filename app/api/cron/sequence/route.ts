import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cronAuth";
import { runColdEmailSequencer } from "@/lib/outreach/sequencer";
import { checkForReplies } from "@/lib/outreach/email/imapWatch";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(request: NextRequest) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const replies = await checkForReplies().catch((err) => ({
    checked: 0,
    matched: 0,
    errors: [err instanceof Error ? err.message : String(err)],
  }));

  const sequence = await runColdEmailSequencer().catch((err) => ({
    initialTouchesSent: 0,
    followUpsSent: 0,
    errors: [err instanceof Error ? err.message : String(err)],
  }));

  return NextResponse.json({ replies, sequence });
}
