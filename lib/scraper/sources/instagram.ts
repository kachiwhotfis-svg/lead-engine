import { chromium } from "playwright";
import type { InstagramSourceConfig, ScrapedLead } from "../types";
import { extractEmails, pickBestEmail } from "../extract";

export async function scrapeInstagram(
  config: InstagramSourceConfig
): Promise<ScrapedLead[]> {
  const browser = await chromium.launch({ headless: true });
  const leads: ScrapedLead[] = [];

  try {
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    });

    for (const rawHandle of config.handles) {
      const handle = rawHandle.replace(/^@/, "").trim();
      if (!handle) continue;

      try {
        await page.goto(`https://www.instagram.com/${handle}/`, {
          waitUntil: "domcontentloaded",
          timeout: 20000,
        });

        const description = await page
          .locator('meta[property="og:description"]')
          .getAttribute("content")
          .catch(() => null);

        const title = await page.title().catch(() => "");
        const businessName = title.split("(")[0]?.trim() || handle;

        const bioText = description ?? "";
        const emails = extractEmails(bioText);

        leads.push({
          businessName,
          instagramHandle: handle,
          email: pickBestEmail(emails),
          source: `Instagram: @${handle}`,
        });
      } catch {
        leads.push({
          instagramHandle: handle,
          source: `Instagram: @${handle} (profile unreachable)`,
        });
      }

      await page.waitForTimeout(1500);
    }
  } finally {
    await browser.close();
  }

  return leads;
}
