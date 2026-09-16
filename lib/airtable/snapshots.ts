import { getBase } from "./client";
import { TABLES, type StatsSnapshotFields } from "./schema";

function table() {
  return getBase()(TABLES.StatsSnapshots);
}

export async function createSnapshot(fields: StatsSnapshotFields) {
  const record = await table().create(fields);
  return { id: record.id, fields: record.fields as StatsSnapshotFields };
}

export async function listSnapshots(limit = 90) {
  const records = await table()
    .select({
      sort: [{ field: "Date", direction: "asc" }],
      maxRecords: limit,
    })
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields as StatsSnapshotFields }));
}
