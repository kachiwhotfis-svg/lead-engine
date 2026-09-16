import Airtable from "airtable";

let base: ReturnType<Airtable["base"]> | null = null;

export function getBase() {
  if (base) return base;

  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error(
      "Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID. Set both in your environment before hitting any route that touches Airtable."
    );
  }

  Airtable.configure({ apiKey });
  base = Airtable.base(baseId);
  return base;
}

export function escapeFormulaValue(value: string): string {
  return value.replace(/'/g, "\\'");
}
