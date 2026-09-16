import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCalendlySignature } from "@/lib/calendlySignature";
import { createLead, findLeadByEmail, getLead, updateLeadStage } from "@/lib/airtable/leads";
import {
  createBooking,
  findBookingByEventUri,
  updateBookingStatus,
} from "@/lib/airtable/bookings";
import { logInteraction } from "@/lib/airtable/interactions";

const payloadSchema = z.object({
  event: z.string(),
  payload: z.object({
    uri: z.string(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    scheduled_event: z
      .object({
        start_time: z.string().optional(),
      })
      .optional(),
  }),
});

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signingKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;

  if (signingKey) {
    const signatureHeader = request.headers.get("calendly-webhook-signature");
    if (!verifyCalendlySignature(rawBody, signatureHeader, signingKey)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const json = JSON.parse(rawBody);
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { event, payload } = parsed.data;

  if (event === "invitee.created") {
    let lead = payload.email ? await findLeadByEmail(payload.email) : null;

    if (!lead && payload.email) {
      lead = await createLead({
        "Business Name": payload.name,
        Email: payload.email,
        Platform: "Cold Email",
        Vertical: "Unassigned",
        Stage: "Booked",
      });
    }

    if (!lead) {
      return NextResponse.json({ error: "No email on invitee payload" }, { status: 400 });
    }

    await createBooking({
      Lead: [lead.id],
      "Calendly Event URI": payload.uri,
      "Scheduled At": payload.scheduled_event?.start_time ?? new Date().toISOString(),
      Status: "Scheduled",
    });

    if (lead.fields.Stage !== "Client") {
      await updateLeadStage(lead.id, "Booked");
    }

    await logInteraction({
      Lead: [lead.id],
      Direction: "Inbound",
      Channel: "Email",
      Content: "Booked a call via Calendly",
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  }

  if (event === "invitee.canceled") {
    const booking = await findBookingByEventUri(payload.uri);
    if (!booking) {
      return NextResponse.json({ ok: true, note: "No matching booking found" });
    }

    await updateBookingStatus(booking.id, "Canceled");

    const leadId = booking.fields.Lead[0];
    if (leadId) {
      const lead = await getLead(leadId);
      if (lead.fields.Stage === "Booked") {
        await updateLeadStage(lead.id, "Warm");
      }
    }

    return NextResponse.json({ ok: true, bookingId: booking.id });
  }

  return NextResponse.json({ ok: true, note: "Event type ignored" });
}
