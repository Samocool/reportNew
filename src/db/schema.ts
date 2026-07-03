import { pgTable, uuid, varchar, text, integer, date, time } from "drizzle-orm/pg-core";

export const reportEntries = pgTable("report_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  entryType: varchar("entry_type", { length: 32 }).notNull(),
  date: date("date").notNull(),
  minutes: integer("minutes").notNull().default(0),
  contactName: varchar("contact_name", { length: 255 }).default(""),
  contactAddress: text("contact_address").default(""),
  contactPhone: varchar("contact_phone", { length: 50 }).default(""),
  nextVisitDate: date("next_visit_date"),
  nextVisitTime: time("next_visit_time"),
  pastInteractionData: text("past_interaction_data").default(""),
  territory: varchar("territory", { length: 255 }).default(""),
});

export type ReportEntryRow = typeof reportEntries.$inferSelect;
export type NewReportEntry = typeof reportEntries.$inferInsert;
