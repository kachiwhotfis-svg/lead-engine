import { getBase, escapeFormulaValue } from "./client";
import { TABLES, type BookingFields } from "./schema";

function table() {
  return getBase()(TABLES.Bookings);
}

export async function createBooking(fields: BookingFields) {
  const record = await table().create(fields);
  return { id: record.id, fields: record.fields as BookingFields };
}

export async function findBookingByEventUri(eventUri: string) {
  const records = await table()
    .select({
      filterByFormula: `{Calendly Event URI} = '${escapeFormulaValue(eventUri)}'`,
      maxRecords: 1,
    })
    .firstPage();

  const record = records[0];
  if (!record) return null;
  return { id: record.id, fields: record.fields as BookingFields };
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingFields["Status"]
) {
  const record = await table().update(bookingId, { Status: status });
  return { id: record.id, fields: record.fields as BookingFields };
}
