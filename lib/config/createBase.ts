import "dotenv/config";

const API_URL = "https://api.airtable.com/v0/meta/bases";

interface AirtableField {
  name: string;
  type: string;
  options?: Record<string, unknown>;
}

interface AirtableTableDef {
  name: string;
  description?: string;
  fields: AirtableField[];
}

function selectField(name: string, choices: string[]): AirtableField {
  return {
    name,
    type: "singleSelect",
    options: { choices: choices.map((c) => ({ name: c })) },
  };
}

function textField(name: string): AirtableField {
  return { name, type: "singleLineText" };
}

function longTextField(name: string): AirtableField {
  return { name, type: "multilineText" };
}

function numberField(name: string, precision = 0): AirtableField {
  return { name, type: "number", options: { precision } };
}

function dateTimeField(name: string): AirtableField {
  return {
    name,
    type: "dateTime",
    options: {
      dateFormat: { name: "iso" },
      timeFormat: { name: "24hour" },
      timeZone: "utc",
    },
  };
}

function dateField(name: string): AirtableField {
  return { name, type: "date", options: { dateFormat: { name: "iso" } } };
}

function checkboxField(name: string): AirtableField {
  return { name, type: "checkbox", options: { icon: "check", color: "greenBright" } };
}

const STAGES = ["Cold", "Contacted", "Warm", "Booked", "Client", "Dead"];
const PLATFORMS = ["Cold Email", "Instagram", "WhatsApp"];

const tables: AirtableTableDef[] = [
  {
    name: "Leads",
    description: "Every prospect, tagged by platform/vertical, moving through the funnel.",
    fields: [
      textField("Business Name"),
      textField("Email"),
      textField("Phone"),
      selectField("Platform", PLATFORMS),
      textField("Vertical"),
      textField("Source"),
      selectField("Stage", STAGES),
      dateTimeField("Stage Updated At"),
      dateTimeField("Contacted At"),
      dateTimeField("Warm At"),
      dateTimeField("Booked At"),
      dateTimeField("Client At"),
      dateTimeField("Dead At"),
      textField("Instagram Handle"),
      textField("WhatsApp Number"),
      textField("ManyChat Subscriber ID"),
      numberField("Sequence Step"),
      longTextField("Notes"),
    ],
  },
  {
    name: "Interactions",
    description: "Every touchpoint sent or received. The raw log everything else is computed from.",
    fields: [
      selectField("Direction", ["Outbound", "Inbound"]),
      selectField("Channel", ["Email", "Instagram", "WhatsApp"]),
      numberField("Step"),
      longTextField("Content"),
      dateTimeField("Occurred At"),
    ],
  },
  {
    name: "Sequences",
    description: "Outreach scripts per platform/step, editable without touching automation.",
    fields: [
      selectField("Platform", PLATFORMS),
      textField("Vertical"),
      numberField("Step"),
      numberField("Delay Days"),
      textField("Subject"),
      longTextField("Body"),
      checkboxField("Active"),
    ],
  },
  {
    name: "Bookings",
    description: "Confirmed calls, linked to a lead.",
    fields: [
      textField("Calendly Event URI"),
      dateTimeField("Scheduled At"),
      selectField("Status", ["Scheduled", "Canceled", "Completed"]),
    ],
  },
  {
    name: "Stats Snapshots",
    description: "Nightly rollup of funnel counts and rates, for dashboard trend charts.",
    fields: [
      dateField("Date"),
      numberField("Total Leads"),
      numberField("Cold"),
      numberField("Contacted"),
      numberField("Warm"),
      numberField("Booked"),
      numberField("Client"),
      numberField("Dead"),
      numberField("Cold to Warm Rate", 1),
      numberField("Warm to Booked Rate", 1),
      numberField("Booked to Client Rate", 1),
      longTextField("Platform Breakdown"),
    ],
  },
];

async function main() {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const workspaceId = process.env.AIRTABLE_WORKSPACE_ID;

  if (!apiKey || !workspaceId) {
    console.error(
      "Set AIRTABLE_API_KEY (a Personal Access Token with schema.bases:write) and\n" +
        "AIRTABLE_WORKSPACE_ID in your environment before running this script."
    );
    process.exit(1);
  }

  const createRes = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ workspaceId, name: "Lead Engine", tables }),
  });

  if (!createRes.ok) {
    console.error(`Failed to create base: ${createRes.status} ${await createRes.text()}`);
    process.exit(1);
  }

  const created = (await createRes.json()) as {
    id: string;
    tables: Array<{ id: string; name: string }>;
  };

  const leadsTable = created.tables.find((t) => t.name === "Leads");
  const interactionsTable = created.tables.find((t) => t.name === "Interactions");
  const bookingsTable = created.tables.find((t) => t.name === "Bookings");

  if (!leadsTable || !interactionsTable || !bookingsTable) {
    console.error("Base created, but could not find expected tables to link. Check manually.");
    process.exit(1);
  }

  for (const table of [interactionsTable, bookingsTable]) {
    const fieldRes = await fetch(
      `${API_URL}/${created.id}/tables/${table.id}/fields`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Lead",
          type: "multipleRecordLinks",
          options: { linkedTableId: leadsTable.id },
        }),
      }
    );

    if (!fieldRes.ok) {
      console.error(
        `Failed to add Lead link field to ${table.name}: ${fieldRes.status} ${await fieldRes.text()}`
      );
    }
  }

  console.log(`Base created: ${created.id}`);
  console.log(`Set AIRTABLE_BASE_ID=${created.id} in your environment.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
