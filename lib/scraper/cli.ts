import "dotenv/config";
import { runScrapeJob } from "./run";
import type { ScrapeJobInput } from "./types";

function parseArgs(): ScrapeJobInput {
  const vertical = process.argv[2];
  const query = process.argv[3];
  const location = process.argv[4];

  if (!vertical || !query || !location) {
    console.error(
      "Usage: npm run scrape -- \"<vertical>\" \"<search query>\" \"<location>\"\n" +
        'Example: npm run scrape -- "Physical Clothing Stores" "clothing store" "Austin, TX"'
    );
    process.exit(1);
  }

  return {
    vertical,
    sources: [{ type: "directory", query, location, maxResults: 20 }],
  };
}

runScrapeJob(parseArgs())
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
