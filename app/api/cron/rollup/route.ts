import { NextRequest, NextResponse } from "next/server";
import { requireCronSecret } from "@/lib/cronAuth";
import { runNightlyRollup } from "@/lib/reporting/rollup";

export async function GET(request: NextRequest) {
  const unauthorized = requireCronSecret(request);
  if (unauthorized) return unauthorized;

  const snapshot = await runNightlyRollup();
  return NextResponse.json(snapshot);
}
