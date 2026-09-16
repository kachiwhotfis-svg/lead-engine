import { getBase } from "./client";
import { TABLES, type InteractionFields } from "./schema";

function table() {
  return getBase()(TABLES.Interactions);
}

export async function logInteraction(fields: Omit<InteractionFields, "Occurred At"> & {
  "Occurred At"?: string;
}) {
  const record = await table().create({
    ...fields,
    "Occurred At": fields["Occurred At"] ?? new Date().toISOString(),
  });
  return { id: record.id, fields: record.fields as InteractionFields };
}

export async function listInteractionsForLead(leadId: string) {
  const records = await table()
    .select({
      filterByFormula: `FIND('${leadId}', ARRAYJOIN({Lead}))`,
      sort: [{ field: "Occurred At", direction: "desc" }],
    })
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields as InteractionFields }));
}

export async function listRecentInteractions(limit = 25) {
  const records = await table()
    .select({
      sort: [{ field: "Occurred At", direction: "desc" }],
      maxRecords: limit,
    })
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields as InteractionFields }));
}
