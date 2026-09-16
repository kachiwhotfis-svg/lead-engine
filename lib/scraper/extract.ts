const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;

const GENERIC_EMAIL_PREFIXES = ["noreply", "no-reply", "donotreply", "example@"];

export function extractEmails(text: string): string[] {
  const matches = text.match(EMAIL_RE) ?? [];
  const seen = new Set<string>();
  for (const match of matches) {
    const lower = match.toLowerCase();
    if (GENERIC_EMAIL_PREFIXES.some((p) => lower.startsWith(p))) continue;
    seen.add(lower);
  }
  return Array.from(seen);
}

export function extractPhones(text: string): string[] {
  const matches = text.match(PHONE_RE) ?? [];
  return Array.from(new Set(matches.map((m) => m.trim())));
}

export function pickBestEmail(emails: string[]): string | undefined {
  if (emails.length === 0) return undefined;
  const preferred = emails.find((e) => /^(info|contact|hello|sales|owner)@/.test(e));
  return preferred ?? emails[0];
}
