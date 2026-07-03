'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReportEntryForm } from './report-entry-form';
import { type ReportEntry, type EntryType } from '@/lib/types';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, Phone, User, BookOpen, Home, RefreshCw, Trash2, Edit3, Plus } from 'lucide-react';
import { getAllEntries, addEntry, updateEntry, deleteEntry } from '@/lib/storage';

export function ReportDashboard() {
  const [entries, setEntries] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ReportEntry | null>(null);
  const [defaultEntryType, setDefaultEntryType] = useState<EntryType | undefined>();
  const [filter, setFilter] = useState<EntryType | 'all'>('all');

  const fetchEntries = useCallback(() => {
    setLoading(true);
    try {
      const data = getAllEntries();
      setEntries(data);
    } catch (e) {
      console.error('Failed to fetch entries', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  function handleSubmit(entry: ReportEntry) {
    const exists = entries.some((e) => e.id === entry.id);
    try {
      if (exists) {
        updateEntry(entry);
      } else {
        addEntry(entry);
      }
      setShowForm(false);
      setEditingEntry(null);
      fetchEntries();
    } catch (e) {
      console.error('Failed to save entry', e);
    }
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      deleteEntry(id);
      fetchEntries();
    } catch (e) {
      console.error('Failed to delete entry', e);
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Ministry Report Tracker</h1>
        <p className="text-slate-600">Track your house-to-house visits, return visits, and Bible studies.</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Time</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatTime(totalMinutes)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">House to House</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{houseToHouseCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Return Visits</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{returnVisitCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Bible Studies</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{bibleStudyCount}</p>
        </div>
      </div>

      {showForm ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
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
        <div className="flex flex-wrap gap-2 mb-6">
          <Button onClick={() => handleAddNew('house-to-house')} className="gap-2">
            <Plus className="w-4 h-4" /> House to House
          </Button>
          <Button onClick={() => handleAddNew('return-visit')} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Return Visit
          </Button>
          <Button onClick={() => handleAddNew('bible-study')} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" /> Bible Study
          </Button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(['all', 'house-to-house', 'return-visit', 'bible-study'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? 'All' : getEntryLabel(f)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading entries...</div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-500">No entries found. Add your first entry above!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEntryColor(entry.entryType)}`}>
                      {getEntryIcon(entry.entryType)}
                      {getEntryLabel(entry.entryType)}
                    </span>
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {entry.date}
                    </span>
                    {(entry.entryType === 'house-to-house' || entry.entryType === 'bible-study') && (
                      <span className="text-sm text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(entry.minutes)}
                      </span>
                    )}
                  </div>

                  {entry.territory && (
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {entry.territory}
                    </p>
                  )}

                  {(entry.entryType === 'bible-study' || entry.entryType === 'return-visit') && (
                    <div className="mt-3 space-y-2">
                      {entry.contactName && (
                        <p className="text-sm text-slate-700 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-medium">{entry.contactName}</span>
                        </p>
                      )}
                      {entry.contactPhone && (
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {entry.contactPhone}
                        </p>
                      )}
                      {entry.contactAddress && (
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {entry.contactAddress}
                        </p>
                      )}
                      {(entry.nextVisitDate || entry.nextVisitTime) && (
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Next visit: {entry.nextVisitDate} {entry.nextVisitTime}
                        </p>
                      )}
                      {entry.pastInteractionData && (
                        <div className="bg-slate-50 rounded-lg p-3 mt-2">
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">{entry.pastInteractionData}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(entry)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
