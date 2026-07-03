import { type ReportEntry, type EntryType } from "./types";

const STORAGE_KEY = "ministry-report-entries";

function getEntries(): ReportEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ReportEntry[];
  } catch {
    return [];
  }
}

function saveEntries(entries: ReportEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getAllEntries(): ReportEntry[] {
  return getEntries().sort((a, b) => b.date.localeCompare(a.date));
}

export function addEntry(entry: ReportEntry): ReportEntry {
  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);
  return entry;
}

export function updateEntry(updated: ReportEntry): ReportEntry {
  const entries = getEntries();
  const idx = entries.findIndex((e) => e.id === updated.id);
  if (idx >= 0) {
    entries[idx] = updated;
    saveEntries(entries);
  }
  return updated;
}

export function deleteEntry(id: string): boolean {
  const entries = getEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length !== entries.length) {
    saveEntries(filtered);
    return true;
  }
  return false;
}

export function getStats() {
  const entries = getEntries();
  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  return {
    totalMinutes,
    houseToHouseCount: entries.filter((e) => e.entryType === "house-to-house").length,
    returnVisitCount: entries.filter((e) => e.entryType === "return-visit").length,
    bibleStudyCount: entries.filter((e) => e.entryType === "bible-study").length,
  };
}
