import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runScrapeJob } from "@/lib/scraper/run";

export const maxDuration = 300;

const sourceSchema = z.union([
  z.object({
    type: z.literal("directory"),
    query: z.string().min(1),
    location: z.string().min(1),
    maxResults: z.number().int().positive().max(50).optional(),
    enrichEmailFromWebsite: z.boolean().optional(),
  }),
  z.object({
    type: z.literal("instagram"),
    handles: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("custom"),
    urls: z.array(z.string().url()).min(1),
  }),
]);

const bodySchema = z.object({
  vertical: z.string().min(1),
  sources: z.array(sourceSchema).min(1),
});

export async function POST(request: NextRequest) {
  const secret = process.env.APP_ACTION_SECRET;
  if (secret && request.headers.get("x-app-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = await runScrapeJob(parsed.data);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Scrape job failed" },
      { status: 500 }
    );
  }
}
