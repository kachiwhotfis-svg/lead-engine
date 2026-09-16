"use server";

import { revalidatePath } from "next/cache";
import { runScrapeJob } from "@/lib/scraper/run";
import type { ScrapeJobResult } from "@/lib/scraper/types";

export async function triggerScrape(formData: FormData): Promise<ScrapeJobResult> {
  const vertical = String(formData.get("vertical") ?? "").trim();
  const query = String(formData.get("query") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();

  if (!vertical || !query || !location) {
    throw new Error("Vertical, search query, and location are all required.");
  }

  const result = await runScrapeJob({
    vertical,
    sources: [{ type: "directory", query, location, maxResults: 20 }],
  });

  revalidatePath("/");
  return result;
}
