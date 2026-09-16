import { getBase } from "./client";
import { TABLES, type SequenceFields, type Platform } from "./schema";

function table() {
  return getBase()(TABLES.Sequences);
}

export async function getSequenceSteps(
  platform: Platform,
  vertical: string
): Promise<Array<{ id: string; fields: SequenceFields }>> {
  const records = await table()
    .select({
      filterByFormula: `AND({Platform} = '${platform}', {Vertical} = '${vertical}', {Active} = TRUE())`,
      sort: [{ field: "Step", direction: "asc" }],
    })
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields as SequenceFields }));
}

export async function createSequenceStep(fields: SequenceFields) {
  const record = await table().create(fields);
  return { id: record.id, fields: record.fields as SequenceFields };
}
