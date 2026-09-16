import { chromium } from "playwright";
import type { DirectorySourceConfig, ScrapedLead } from "../types";
import { extractEmails, extractPhones, pickBestEmail } from "../extract";

interface RawListing {
  businessName: string;
  phone?: string;
  website?: string;
}

async function collectListings(
  query: string,
  location: string,
  maxResults: number
): Promise<RawListing[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  });

  const listings: RawListing[] = [];

  try {
    const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      `${query} ${location}`
    )}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    const feed = page.getByRole("feed");
    await feed.waitFor({ timeout: 15000 }).catch(() => null);

    let previousCount = 0;
    for (let i = 0; i < 8 && listings.length < maxResults; i++) {
      const cards = await feed.locator("> div[role='article'], > div").all();
      if (cards.length === previousCount) break;
      previousCount = cards.length;
      await feed.evaluate((el) => el.scrollBy(0, el.scrollHeight));
      await page.waitForTimeout(1200);
    }

    const cards = await feed.locator("a[aria-label]").all();
    for (const card of cards) {
      if (listings.length >= maxResults) break;
      const name = await card.getAttribute("aria-label");
      if (!name) continue;
      listings.push({ businessName: name });
    }

    for (const listing of listings) {
      const link = feed.locator(`a[aria-label="${listing.businessName}"]`).first();
      await link.click({ timeout: 5000 }).catch(() => null);
      await page.waitForTimeout(1000);

      const websiteLink = page.locator("a[data-item-id='authority']").first();
      const website = await websiteLink.getAttribute("href").catch(() => null);
      if (website) listing.website = website;

      const phoneButton = page.locator("button[data-item-id^='phone']").first();
      const phoneLabel = await phoneButton.getAttribute("aria-label").catch(() => null);
      if (phoneLabel) {
        const phones = extractPhones(phoneLabel);
        if (phones[0]) listing.phone = phones[0];
      }
    }
  } finally {
    await browser.close();
  }

  return listings;
}

async function enrichEmail(website: string): Promise<string | undefined> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const candidates = [website, new URL("/contact", website).toString()].filter(
      (v, i, arr) => arr.indexOf(v) === i
    );

    for (const url of candidates) {
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        const bodyText = await page.locator("body").innerText();
        const emails = extractEmails(bodyText);
        const best = pickBestEmail(emails);
        if (best) return best;
      } catch {
        continue;
      }
    }
  } finally {
    await browser.close();
  }
  return undefined;
}

export async function scrapeDirectory(
  config: DirectorySourceConfig
): Promise<ScrapedLead[]> {
  const maxResults = config.maxResults ?? 20;
  const listings = await collectListings(config.query, config.location, maxResults);

  const leads: ScrapedLead[] = [];
  for (const listing of listings) {
    let email: string | undefined;
    if (config.enrichEmailFromWebsite !== false && listing.website) {
      email = await enrichEmail(listing.website).catch(() => undefined);
    }

    leads.push({
      businessName: listing.businessName,
      phone: listing.phone,
      website: listing.website,
      email,
      source: `Directory: ${config.query} in ${config.location}`,
    });
  }

  return leads;
}
