/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, Plus, Search, CheckCircle, Ban, Trash2, ShieldCheck, ToggleLeft, ToggleRight 
} from 'lucide-react';
import { PublicHoliday } from '../types';
import { setHolidays, logAuditEvent } from '../utils/db';

interface HolidaysModuleProps {
  holidays: PublicHoliday[];
  onRefresh: () => void;
}

export default function HolidaysModule({ holidays, onRefresh }: HolidaysModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    HOLIDAY_NAME: '',
    HOLIDAY_DATE: '',
    IS_COLLECTION_BLOCKED: 'Y' as 'Y' | 'N'
  });

  const [showAddForm, setShowAddForm] = useState(false);

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter(h => {
      const q = searchQuery.toLowerCase();
      return (
        h.HOLIDAY_NAME.toLowerCase().includes(q) ||
        h.HOLIDAY_DATE.includes(q)
      );
    });
  }, [holidays, searchQuery]);

  // Add Public Holiday
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.HOLIDAY_NAME.trim() || !formData.HOLIDAY_DATE.trim()) {
      alert('Holiday Name and Date are required.');
      return;
    }

    const exists = holidays.some(h => h.HOLIDAY_DATE === formData.HOLIDAY_DATE);
    if (exists) {
      alert('ORACLE SQL UNIQUE CONSTRAINT VIOLATION: A holiday is already registered on this date.');
      return;
    }

    const nextId = holidays.length > 0 ? Math.max(...holidays.map(h => h.HOLIDAY_ID)) + 1 : 901;
    const newHoliday: PublicHoliday = {
      ...formData,
      HOLIDAY_ID: nextId
    };

    const updated = [...holidays, newHoliday];
    setHolidays(updated);
    logAuditEvent('INSERT', 'PUBLIC_HOLIDAYS', null, newHoliday);
    onRefresh();

    // Reset Form
    setFormData({
      HOLIDAY_NAME: '',
      HOLIDAY_DATE: '',
      IS_COLLECTION_BLOCKED: 'Y'
    });
    setShowAddForm(false);
  };

  // Toggle Blocker trigger state
  const handleToggleBlock = (holidayId: number) => {
    const hObj = holidays.find(h => h.HOLIDAY_ID === holidayId);
    if (!hObj) return;

    const original = { ...hObj };
    const targetVal = hObj.IS_COLLECTION_BLOCKED === 'Y' ? 'N' : 'Y';
    
    const updated = holidays.map(h => {
      if (h.HOLIDAY_ID === holidayId) {
        const uObj = { ...h, IS_COLLECTION_BLOCKED: targetVal as 'Y' | 'N' };
        logAuditEvent('UPDATE', 'PUBLIC_HOLIDAYS', original, uObj);
        return uObj;
      }
      return h;
    });

    setHolidays(updated);
    onRefresh();
  };

  // Delete Holiday
  const handleDeleteHoliday = (holidayId: number) => {
    if (window.confirm('Delete this public holiday from Oracle scheduler?')) {
      const hObj = holidays.find(h => h.HOLIDAY_ID === holidayId);
      const remaining = holidays.filter(h => h.HOLIDAY_ID !== holidayId);
      setHolidays(remaining);
      if (hObj) {
        logAuditEvent('DELETE', 'PUBLIC_HOLIDAYS', hObj, null);
      }
      onRefresh();
    }
  };

  return (
    <div className="space-y-6" id="holidays_module_view">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="text-emerald-600 h-5 w-5" />
            Oracle National Holiday Scheduler
          </h2>
          <p className="text-xs text-slate-400 font-sans">Establish national holidays to automatically trigger warnings/blocks at crop intake weigh scales</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
          id="btn_toggle_holiday_form"
        >
          <Plus className="h-4 w-4" /> Add Public Holiday
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table list */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="holidays_grid_box">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search holiday name or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="search_holiday_input"
              />
            </div>
            <span className="text-xs text-slate-400 font-bold font-mono uppercase">
              Table: PUBLIC_HOLIDAYS
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="holidays_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Holiday ID</th>
                  <th className="py-3 px-4">Holiday Title</th>
                  <th className="py-3 px-4">Calender Date</th>
                  <th className="py-3 px-4 text-center">Collection Blocker</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredHolidays.map((h) => (
                  <tr key={h.HOLIDAY_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#HOL-{h.HOLIDAY_ID}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{h.HOLIDAY_NAME}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">{h.HOLIDAY_DATE}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleBlock(h.HOLIDAY_ID)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          h.IS_COLLECTION_BLOCKED === 'Y'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                        id={`btn_toggle_block_${h.HOLIDAY_ID}`}
                      >
                        {h.IS_COLLECTION_BLOCKED === 'Y' ? (
                          <>
                            <Ban className="h-3 w-3" /> BLOCKED (ACTIVE RULE)
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3" /> PERMITTED (NO BLOCK)
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteHoliday(h.HOLIDAY_ID)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition"
                        title="Delete Holiday"
                        id={`btn_delete_holiday_${h.HOLIDAY_ID}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Right side form block */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4" id="holiday_form_panel">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Add Holiday Scheduler</h3>
            <p className="text-xs text-slate-400">Inserts calendar exceptions that are cross-referenced by PL/SQL constraints</p>
          </div>

          <form onSubmit={handleAddHoliday} className="space-y-4" id="holiday_add_form">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Holiday Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Independence Day"
                value={formData.HOLIDAY_NAME}
                onChange={(e) => setFormData({ ...formData, HOLIDAY_NAME: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="hol_name_input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Calendar Date *</label>
              <input
                type="date"
                required
                value={formData.HOLIDAY_DATE}
                onChange={(e) => setFormData({ ...formData, HOLIDAY_DATE: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                id="hol_date_input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Block crop Intakes? *</label>
              <select
                value={formData.IS_COLLECTION_BLOCKED}
                onChange={(e) => setFormData({ ...formData, IS_COLLECTION_BLOCKED: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                id="hol_block_select"
              >
                <option value="Y">YES (Block collection attempts on this date)</option>
                <option value="N">NO (Permit collections on this date)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition shadow-sm cursor-pointer"
              id="btn_submit_holiday_form"
            >
              Insert Schedule Row
            </button>
          </form>

          <div className="bg-slate-50 border p-4 rounded-2xl">
            <span className="text-[10px] text-slate-400 font-bold block uppercase font-mono mb-1">PL/SQL Trigger context</span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              The trigger <code className="bg-white px-1 py-0.5 border text-emerald-800 rounded">BI_PRODUCE_COLLECTIONS_CALC</code> runs queries on <code className="bg-white px-1 py-0.5 border text-emerald-800 rounded">PUBLIC_HOLIDAYS</code> dynamically before completing weighs.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
