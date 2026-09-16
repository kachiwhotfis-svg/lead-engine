import { chromium } from "playwright";
import type { CustomUrlSourceConfig, ScrapedLead } from "../types";
import { extractEmails, pickBestEmail } from "../extract";

export async function scrapeCustomUrls(
  config: CustomUrlSourceConfig
): Promise<ScrapedLead[]> {
  const browser = await chromium.launch({ headless: true });
  const leads: ScrapedLead[] = [];

  try {
    const page = await browser.newPage();

    for (const url of config.urls) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
        const bodyText = await page.locator("body").innerText();
        const title = await page.title().catch(() => "");

        const emails = extractEmails(bodyText);

        leads.push({
          businessName: title || undefined,
          email: pickBestEmail(emails),
          website: url,
          source: `Custom URL: ${url}`,
        });
      } catch {
        leads.push({
          website: url,
          source: `Custom URL: ${url} (unreachable)`,
        });
      }
    }
  } finally {
    await browser.close();
  }

  return leads;
}
