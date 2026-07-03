export type EntryType = 'house-to-house' | 'bible-study' | 'return-visit';

export interface ReportEntry {
  id: string;
  entryType: EntryType;
  date: string;
  minutes: number;
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  nextVisitDate: string;
  nextVisitTime: string;
  pastInteractionData: string;
  territory: string;
}
