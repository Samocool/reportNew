'use client';

import { useState, useEffect } from 'react';
import { ReportEntryForm } from '@/components/report-entry-form';
import { type ReportEntry, type EntryType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Phone, User, BookOpen, Home, RefreshCw, Trash2, Edit3, Plus, Filter } from 'lucide-react';
import { getAllEntries, addEntry, updateEntry, deleteEntry } from '@/lib/storage';

export default function MobilePage() {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ReportEntry | null>(null);
  const [defaultEntryType, setDefaultEntryType] = useState<EntryType | undefined>();
  const [filter, setFilter] = useState<EntryType | 'all'>('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEntries(getAllEntries());
  }, []);

  function refresh() {
    setEntries(getAllEntries());
  }

  function handleSubmit(entry: ReportEntry) {
    const exists = entries.some((e) => e.id === entry.id);
    if (exists) {
      updateEntry(entry);
    } else {
      addEntry(entry);
    }
    setShowForm(false);
    setEditingEntry(null);
    refresh();
  }

  function handleDelete(id: string) {
    if (typeof window !== 'undefined' && window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id);
      refresh();
    }
  }

  function handleEdit(entry: ReportEntry) {
    setEditingEntry(entry);
    setShowForm(true);
  }

  function handleAddNew(type?: EntryType) {
    setEditingEntry(null);
    setDefaultEntryType(type);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEntry(null);
    setDefaultEntryType(undefined);
  }

  const filteredEntries = filter === 'all' ? entries : entries.filter((e) => e.entryType === filter);

  const totalMinutes = entries.reduce((sum, e) => sum + e.minutes, 0);
  const houseToHouseCount = entries.filter((e) => e.entryType === 'house-to-house').length;
  const returnVisitCount = entries.filter((e) => e.entryType === 'return-visit').length;
  const bibleStudyCount = entries.filter((e) => e.entryType === 'bible-study').length;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const getEntryIcon = (type: EntryType) => {
    switch (type) {
      case 'house-to-house': return <Home className="w-4 h-4" />;
      case 'return-visit': return <RefreshCw className="w-4 h-4" />;
      case 'bible-study': return <BookOpen className="w-4 h-4" />;
    }
  };

  const getEntryLabel = (type: EntryType) => {
    switch (type) {
      case 'house-to-house': return 'House to House';
      case 'return-visit': return 'Return Visit';
      case 'bible-study': return 'Bible Study';
    }
  };

  const getEntryColor = (type: EntryType) => {
    switch (type) {
      case 'house-to-house': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'return-visit': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'bible-study': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ministry Tracker</h1>
          <p className="text-sm text-slate-500">Track visits & studies</p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Total Time</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{formatTime(totalMinutes)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Entries</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{entries.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">H2H</p>
            <p className="text-xl font-bold text-blue-700 mt-0.5">{houseToHouseCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">RV / BS</p>
            <p className="text-xl font-bold text-emerald-700 mt-0.5">{returnVisitCount + bibleStudyCount}</p>
          </div>
        </div>

        {showForm ? (
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-6">
            <h2 className="text-base font-semibold text-slate-900 mb-3">
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </h2>
            <ReportEntryForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              entry={editingEntry}
              defaultEntryType={defaultEntryType}
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => handleAddNew('house-to-house')} size="sm" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> H2H
            </Button>
            <Button onClick={() => handleAddNew('return-visit')} size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> RV
            </Button>
            <Button onClick={() => handleAddNew('bible-study')} size="sm" variant="outline" className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" /> BS
            </Button>
          </div>
        )}

        {!showForm && (
          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
            {(['all', 'house-to-house', 'return-visit', 'bible-study'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {f === 'all' ? 'All' : getEntryLabel(f)}
              </button>
            ))}
          </div>
        )}

        {!showForm && (
          <div className="space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">No entries yet.</p>
                <p className="text-xs text-slate-400 mt-1">Tap a button above to add one.</p>
              </div>
            ) : (
              filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getEntryColor(entry.entryType)}`}>
                          {getEntryIcon(entry.entryType)}
                          {getEntryLabel(entry.entryType)}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.date}
                        </span>
                        {(entry.entryType === 'house-to-house' || entry.entryType === 'bible-study') && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(entry.minutes)}
                          </span>
                        )}
                      </div>

                      {entry.territory && (
                        <p className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {entry.territory}
                        </p>
                      )}

                      {(entry.entryType === 'bible-study' || entry.entryType === 'return-visit') && (
                        <div className="mt-2 space-y-1">
                          {entry.contactName && (
                            <p className="text-xs text-slate-700 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span className="font-medium">{entry.contactName}</span>
                            </p>
                          )}
                          {entry.contactPhone && (
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {entry.contactPhone}
                            </p>
                          )}
                          {entry.contactAddress && (
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {entry.contactAddress}
                            </p>
                          )}
                          {(entry.nextVisitDate || entry.nextVisitTime) && (
                            <p className="text-xs text-slate-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Next: {entry.nextVisitDate} {entry.nextVisitTime}
                            </p>
                          )}
                          {entry.pastInteractionData && (
                            <div className="bg-slate-50 rounded-lg p-2 mt-1.5">
                              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">Notes</p>
                              <p className="text-xs text-slate-700 whitespace-pre-wrap">{entry.pastInteractionData}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(entry)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
