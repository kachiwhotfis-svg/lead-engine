import { differenceInDays } from "date-fns";
import { listLeadsByStage, updateLeadStage } from "../airtable/leads";
import { getBase } from "../airtable/client";
import { TABLES, type LeadFields } from "../airtable/schema";
import { getSequenceSteps } from "../airtable/sequences";
import { logInteraction, listInteractionsForLead } from "../airtable/interactions";
import { sendColdEmail } from "./email/send";
import { renderTemplate } from "./template";

function leadsTable() {
  return getBase()(TABLES.Leads);
}

function templateVars(lead: { fields: LeadFields }): Record<string, string> {
  return {
    business_name: lead.fields["Business Name"] ?? "there",
    sender_name: process.env.FROM_NAME ?? "",
  };
}

export interface SequenceRunResult {
  initialTouchesSent: number;
  followUpsSent: number;
  errors: string[];
}

export async function runColdEmailSequencer(): Promise<SequenceRunResult> {
  const result: SequenceRunResult = {
    initialTouchesSent: 0,
    followUpsSent: 0,
    errors: [],
  };

  const coldLeads = (await listLeadsByStage("Cold")).filter(
    (lead) => lead.fields.Platform === "Cold Email" && lead.fields.Email
  );

  for (const lead of coldLeads) {
    try {
      const steps = await getSequenceSteps("Cold Email", lead.fields.Vertical);
      const firstStep = steps.find((s) => s.fields.Step === 1);
      if (!firstStep || !lead.fields.Email) continue;

      const vars = templateVars(lead);
      const subject = renderTemplate(firstStep.fields.Subject ?? "", vars);
      const body = renderTemplate(firstStep.fields.Body, vars);

      await sendColdEmail({ to: lead.fields.Email, subject, body });

      await logInteraction({
        Lead: [lead.id],
        Direction: "Outbound",
        Channel: "Email",
        Step: 1,
        Content: body,
      });

      await leadsTable().update(lead.id, { "Sequence Step": 1 } satisfies Partial<LeadFields>);
      await updateLeadStage(lead.id, "Contacted");

      result.initialTouchesSent++;
    } catch (err) {
      result.errors.push(
        `Lead ${lead.id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const contactedLeads = (await listLeadsByStage("Contacted")).filter(
    (lead) => lead.fields.Platform === "Cold Email" && lead.fields.Email
  );

  for (const lead of contactedLeads) {
    try {
      const steps = await getSequenceSteps("Cold Email", lead.fields.Vertical);
      const currentStep = lead.fields["Sequence Step"] ?? 1;
      const nextStep = steps.find((s) => s.fields.Step === currentStep + 1);
      if (!nextStep || !lead.fields.Email) continue;

      const interactions = await listInteractionsForLead(lead.id);
      const lastOutbound = interactions.find(
        (i) => i.fields.Direction === "Outbound" && i.fields.Channel === "Email"
      );
      if (!lastOutbound) continue;

      const daysSince = differenceInDays(
        new Date(),
        new Date(lastOutbound.fields["Occurred At"])
      );
      if (daysSince < nextStep.fields["Delay Days"]) continue;

      const vars = templateVars(lead);
      const subject = renderTemplate(nextStep.fields.Subject ?? "", vars);
      const body = renderTemplate(nextStep.fields.Body, vars);

      await sendColdEmail({ to: lead.fields.Email, subject, body });

      await logInteraction({
        Lead: [lead.id],
        Direction: "Outbound",
        Channel: "Email",
        Step: nextStep.fields.Step,
        Content: body,
      });

      await leadsTable().update(lead.id, {
        "Sequence Step": nextStep.fields.Step,
      } satisfies Partial<LeadFields>);

      result.followUpsSent++;
    } catch (err) {
      result.errors.push(
        `Lead ${lead.id}: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return result;
}
