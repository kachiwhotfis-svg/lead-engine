import { getBase, escapeFormulaValue } from "./client";
import { TABLES, type LeadFields, type Stage } from "./schema";

export interface LeadRecord {
  id: string;
  fields: LeadFields;
}

const STAGE_TIMESTAMP_FIELD: Partial<Record<Stage, keyof LeadFields>> = {
  Contacted: "Contacted At",
  Warm: "Warm At",
  Booked: "Booked At",
  Client: "Client At",
  Dead: "Dead At",
};

function table() {
  return getBase()(TABLES.Leads);
}

export async function findLeadByEmail(email: string): Promise<LeadRecord | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const records = await table()
    .select({
      filterByFormula: `LOWER({Email}) = '${escapeFormulaValue(normalized)}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;
  return { id: record.id, fields: record.fields as LeadFields };
}

export async function findLeadByHandle(
  field: "Instagram Handle" | "WhatsApp Number",
  value: string
): Promise<LeadRecord | null> {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;

  const records = await table()
    .select({
      filterByFormula: `LOWER({${field}}) = '${escapeFormulaValue(normalized)}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;
  return { id: record.id, fields: record.fields as LeadFields };
}

export async function findLeadByManyChatSubscriberId(
  subscriberId: string
): Promise<LeadRecord | null> {
  const records = await table()
    .select({
      filterByFormula: `{ManyChat Subscriber ID} = '${escapeFormulaValue(subscriberId)}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;
  return { id: record.id, fields: record.fields as LeadFields };
}

export async function createLead(fields: LeadFields): Promise<LeadRecord> {
  const now = new Date().toISOString();
  const record = await table().create({
    ...fields,
    "Stage Updated At": now,
  });
  return { id: record.id, fields: record.fields as LeadFields };
}

export async function updateLeadStage(leadId: string, stage: Stage): Promise<LeadRecord> {
  const now = new Date().toISOString();
  const timestampField = STAGE_TIMESTAMP_FIELD[stage];

  const patch: Partial<LeadFields> = {
    Stage: stage,
    "Stage Updated At": now,
  };
  if (timestampField) {
    (patch as Record<string, string>)[timestampField] = now;
  }

  const record = await table().update(leadId, patch);
  return { id: record.id, fields: record.fields as LeadFields };
}

export async function listLeadsByStage(stage: Stage): Promise<LeadRecord[]> {
  const records = await table()
    .select({ filterByFormula: `{Stage} = '${stage}'` })
    .all();
  return records.map((r) => ({ id: r.id, fields: r.fields as LeadFields }));
}

export async function listAllLeads(): Promise<LeadRecord[]> {
  const records = await table().select({}).all();
  return records.map((r) => ({ id: r.id, fields: r.fields as LeadFields }));
}

export async function getLead(leadId: string): Promise<LeadRecord> {
  const record = await table().find(leadId);
  return { id: record.id, fields: record.fields as LeadFields };
}
