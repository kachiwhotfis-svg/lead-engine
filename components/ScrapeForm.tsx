"use client";

import { useState, useTransition } from "react";
import { triggerScrape } from "@/app/actions";
import type { ScrapeJobResult } from "@/lib/scraper/types";

export function ScrapeForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ScrapeJobResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setResult(null);
    startTransition(async () => {
      try {
        const res = await triggerScrape(formData);
        setResult(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Scrape failed");
      }
    });
  }

  return (
    <div className="card">
      <h2 className="mb-1 text-sm font-medium text-ink-muted">Run a scrape</h2>
      <p className="mb-4 text-xs text-ink-muted">
        Needs full Node/Playwright to actually launch a browser. On Vercel&apos;s
        default runtime this can time out, run{" "}
        <code className="rounded bg-surface-raised px-1 py-0.5">npm run scrape</code>{" "}
        locally instead until this app is hosted somewhere with full browser support.
      </p>
      <form action={handleSubmit} className="flex flex-col gap-3">
        <input
          name="vertical"
          placeholder="Vertical, e.g. Physical Clothing Stores (US)"
          defaultValue="Physical Clothing Stores (US)"
          className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent"
          required
        />
        <div className="flex gap-3">
          <input
            name="query"
            placeholder="Search query, e.g. clothing store"
            defaultValue="clothing store"
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
          <input
            name="location"
            placeholder="Location, e.g. Austin, TX"
            className="flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="self-start rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition-opacity disabled:opacity-50"
        >
          {isPending ? "Scraping..." : "Run scrape"}
        </button>
      </form>
      {error ? <p className="mt-3 text-sm text-stage-dead">{error}</p> : null}
      {result ? (
        <p className="mt-3 text-sm text-ink-muted">
          Found {result.found}, created {result.created}, {result.duplicates} duplicates
          skipped.
          {result.errors.length > 0 ? ` ${result.errors.length} errors.` : ""}
        </p>
      ) : null}
    </div>
  );
}
