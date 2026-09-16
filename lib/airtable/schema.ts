import type Airtable from "airtable";

export const TABLES = {
  Leads: "Leads",
  Interactions: "Interactions",
  Sequences: "Sequences",
  Bookings: "Bookings",
  StatsSnapshots: "Stats Snapshots",
} as const;

export type Stage = "Cold" | "Contacted" | "Warm" | "Booked" | "Client" | "Dead";

export const STAGES: Stage[] = ["Cold", "Contacted", "Warm", "Booked", "Client", "Dead"];

export type Platform = "Cold Email" | "Instagram" | "WhatsApp";

export const PLATFORMS: Platform[] = ["Cold Email", "Instagram", "WhatsApp"];

export interface LeadFields extends Airtable.FieldSet {
  Name?: string;
  "Business Name"?: string;
  Email?: string;
  Phone?: string;
  Platform: Platform;
  Vertical: string;
  Source?: string;
  Stage: Stage;
  "Stage Updated At"?: string;
  "Contacted At"?: string;
  "Warm At"?: string;
  "Booked At"?: string;
  "Client At"?: string;
  "Dead At"?: string;
  "Instagram Handle"?: string;
  "WhatsApp Number"?: string;
  "ManyChat Subscriber ID"?: string;
  "Sequence Step"?: number;
  Notes?: string;
}

export type InteractionDirection = "Outbound" | "Inbound";
export type InteractionChannel = "Email" | "Instagram" | "WhatsApp";

export interface InteractionFields extends Airtable.FieldSet {
  Lead: string[];
  Direction: InteractionDirection;
  Channel: InteractionChannel;
  Step?: number;
  Content?: string;
  "Occurred At": string;
}

export interface SequenceFields extends Airtable.FieldSet {
  Platform: Platform;
  Vertical: string;
  Step: number;
  "Delay Days": number;
  Subject?: string;
  Body: string;
  Active: boolean;
}

export type BookingStatus = "Scheduled" | "Canceled" | "Completed";

export interface BookingFields extends Airtable.FieldSet {
  Lead: string[];
  "Calendly Event URI": string;
  "Scheduled At": string;
  Status: BookingStatus;
}

export interface StatsSnapshotFields extends Airtable.FieldSet {
  Date: string;
  "Total Leads": number;
  Cold: number;
  Contacted: number;
  Warm: number;
  Booked: number;
  Client: number;
  Dead: number;
  "Cold to Warm Rate": number;
  "Warm to Booked Rate": number;
  "Booked to Client Rate": number;
  "Platform Breakdown": string;
}
