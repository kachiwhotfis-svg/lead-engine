import { createLead, findLeadByEmail, findLeadByHandle } from "../airtable/leads";
import type { ScrapeJobInput, ScrapeJobResult, ScrapedLead } from "./types";
import { scrapeDirectory } from "./sources/directory";
import { scrapeInstagram } from "./sources/instagram";
import { scrapeCustomUrls } from "./sources/customUrl";

async function runSource(config: ScrapeJobInput["sources"][number]): Promise<ScrapedLead[]> {
  switch (config.type) {
    case "directory":
      return scrapeDirectory(config);
    case "instagram":
      return scrapeInstagram(config);
    case "custom":
      return scrapeCustomUrls(config);
  }
}

export async function runScrapeJob(input: ScrapeJobInput): Promise<ScrapeJobResult> {
  const result: ScrapeJobResult = {
    vertical: input.vertical,
    found: 0,
    created: 0,
    duplicates: 0,
    skippedNoContact: 0,
    errors: [],
  };

  for (const sourceConfig of input.sources) {
    let scraped: ScrapedLead[] = [];
    try {
      scraped = await runSource(sourceConfig);
    } catch (err) {
      result.errors.push(
        `${sourceConfig.type} source failed: ${err instanceof Error ? err.message : String(err)}`
      );
      continue;
    }

    result.found += scraped.length;

    for (const lead of scraped) {
      if (!lead.email && !lead.instagramHandle) {
        result.skippedNoContact++;
        continue;
      }

      const existing = lead.email
        ? await findLeadByEmail(lead.email)
        : lead.instagramHandle
          ? await findLeadByHandle("Instagram Handle", lead.instagramHandle)
          : null;

      if (existing) {
        result.duplicates++;
        continue;
      }

      const platform = lead.email ? "Cold Email" : "Instagram";

      await createLead({
        "Business Name": lead.businessName,
        Email: lead.email,
        Phone: lead.phone,
        "Instagram Handle": lead.instagramHandle,
        Platform: platform,
        Vertical: input.vertical,
        Source: lead.source,
        Stage: "Cold",
      });

      result.created++;
    }
  }

  return result;
}
