/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Scale, Plus, Search, Calendar, User, Sprout, AlertTriangle, ShieldCheck, CheckCircle, Landmark, Clock 
} from 'lucide-react';
import { Farmer, Produce, ProduceCollection } from '../types';
import { insertProduceCollection } from '../utils/db';

interface CollectionsModuleProps {
  farmers: Farmer[];
  produce: Produce[];
  collections: ProduceCollection[];
  onRefresh: () => void;
}

export default function CollectionsModule({ farmers, produce, collections, onRefresh }: CollectionsModuleProps) {
  const [activeTab, setActiveTab] = useState<'LIST' | 'RECORD'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Collection Form State
  const [formData, setFormData] = useState({
    FARMER_ID: 1001,
    PRODUCE_ID: 301,
    COLLECTION_DATE: new Date().toISOString().split('T')[0], // Defaults to today
    QUANTITY_KG: 1000,
    PRICE_PER_KG: 45,
    GRADE: 'A' as 'A' | 'B' | 'C',
    MOISTURE_CONTENT: 13.5
  });

  const [triggerAlert, setTriggerAlert] = useState<{
    show: boolean;
    type: 'WARNING' | 'PASSED';
    message: string;
    details?: string;
  } | null>(null);

  // Auto-set standard price when produce changes
  const handleProduceChange = (produceId: number) => {
    const p = produce.find(pr => pr.PRODUCE_ID === produceId);
    if (p) {
      setFormData(prev => ({
        ...prev,
        PRODUCE_ID: produceId,
        PRICE_PER_KG: p.BASE_PRICE_PER_KG
      }));
    }
  };

  // Filter collections
  const filteredCollections = useMemo(() => {
    return collections.filter(c => {
      const q = searchQuery.toLowerCase();
      const farmer = farmers.find(f => f.FARMER_ID === c.FARMER_ID);
      const prod = produce.find(p => p.PRODUCE_ID === c.PRODUCE_ID);
      return (
        c.COLLECTION_ID.toString().includes(q) ||
        (farmer && (farmer.FIRST_NAME + ' ' + farmer.LAST_NAME).toLowerCase().includes(q)) ||
        (prod && prod.PRODUCE_NAME.toLowerCase().includes(q)) ||
        c.GRADE.toLowerCase() === q
      );
    });
  }, [collections, farmers, produce, searchQuery]);

  // Submit Collection
  const handleRecordCollection = (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerAlert(null);

    const fObj = farmers.find(f => f.FARMER_ID === Number(formData.FARMER_ID));
    if (!fObj) {
      alert('Selected Farmer ID is invalid.');
      return;
    }
    if (fObj.STATUS !== 'ACTIVE') {
      alert(`ORACLE REFUSAL CONSTRAINT: Farmer #${formData.FARMER_ID} is currently ${fObj.STATUS}. Collections can only be recorded from ACTIVE farmers.`);
      return;
    }

    if (formData.QUANTITY_KG <= 0 || formData.PRICE_PER_KG <= 0) {
      alert('Moisture weigh, quantity, and unit price must be positive numbers.');
      return;
    }

    // Call simulated trigger insert
    const result = insertProduceCollection({
      FARMER_ID: Number(formData.FARMER_ID),
      PRODUCE_ID: Number(formData.PRODUCE_ID),
      COLLECTION_DATE: formData.COLLECTION_DATE,
      QUANTITY_KG: Number(formData.QUANTITY_KG),
      PRICE_PER_KG: Number(formData.PRICE_PER_KG),
      GRADE: formData.GRADE,
      MOISTURE_CONTENT: Number(formData.MOISTURE_CONTENT)
    });

    if (result.success && result.collection) {
      onRefresh();

      // Check if Oracle Public Holiday Check Trigger flagged a warning
      if (result.collection.HOLIDAY_CHECK === 'WARNING') {
        setTriggerAlert({
          show: true,
          type: 'WARNING',
          message: `ORACLE DATABASE BUSINESS CONSTRAINT TRIGGER FLAGGED: Holiday Conflict!`,
          details: `The BI_PRODUCE_COLLECTIONS_CALC trigger detected that ${formData.COLLECTION_DATE} is registered on a BLOCKED public holiday (National Ag-Harvest Festival). The transaction has completed but is flagged as WARNING in audit tables.`
        });
      } else {
        setTriggerAlert({
          show: true,
          type: 'PASSED',
          message: `ORACLE TRIGGER EXECUTION SUCCESSFUL`,
          details: `Collection #COLL-${result.collection.COLLECTION_ID} compiled successfully. Total KES ${(result.collection.TOTAL_AMOUNT).toLocaleString()} has been credited. Auto-triggers updated Silo INVENTORY levels and issued farmer PAYMENTS record.`
        });
      }

      // Keep form intact but allow scrolling up or viewing the success alerts
      // Reset form variables (keep farmer and dates for speed)
      setFormData(f => ({
        ...f,
        QUANTITY_KG: 1000,
        MOISTURE_CONTENT: 13.5
      }));
    } else {
      alert(`Error inserting collection: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6" id="collections_module_view">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="text-emerald-600 h-5 w-5" />
            Produce Intake Weigh Station
          </h2>
          <p className="text-xs text-slate-400 font-sans">Weigh crop shipments, perform moisture analysis, and record farmer receipts</p>
        </div>
        <button
          onClick={() => {
            setTriggerAlert(null);
            // set defaults
            if (farmers.length > 0) {
              setFormData(f => ({
                ...f,
                FARMER_ID: farmers[0].FARMER_ID,
                PRODUCE_ID: produce[0]?.PRODUCE_ID || 301,
                PRICE_PER_KG: produce[0]?.BASE_PRICE_PER_KG || 45
              }));
            }
            setActiveTab(activeTab === 'LIST' ? 'RECORD' : 'LIST');
          }}
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
          id="btn_toggle_col_tab"
        >
          {activeTab === 'LIST' ? (
            <>
              <Plus className="h-4 w-4" /> Record New Intake
            </>
          ) : (
            'View Intake History'
          )}
        </button>
      </div>

      {activeTab === 'RECORD' ? (
        <div className="space-y-6" id="record_collection_form_tab">
          
          {/* Dynamic Oracle Trigger Alert Container */}
          {triggerAlert && (
            <div 
              className={`p-5 rounded-3xl border ${
                triggerAlert.type === 'WARNING' 
                  ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm'
              } flex flex-col md:flex-row items-start gap-4 animate-fade-in`}
              id="oracle_trigger_alert_box"
            >
              {triggerAlert.type === 'WARNING' ? (
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm uppercase tracking-wide font-mono">
                  {triggerAlert.message}
                </p>
                <p className="text-xs leading-relaxed opacity-90">{triggerAlert.details}</p>
                <div className="flex gap-2 pt-2">
                  <span className="text-[10px] bg-white/50 border px-2 py-0.5 rounded font-bold uppercase font-mono">
                    TRIGGER: BI_PRODUCE_COLLECTIONS_CALC
                  </span>
                  <span className="text-[10px] bg-white/50 border px-2 py-0.5 rounded font-bold uppercase font-mono">
                    STATUS: {triggerAlert.type}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setTriggerAlert(null)}
                className="md:ml-auto text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-base">Record Intake Shipment</h3>
              <p className="text-xs text-slate-400 font-sans">Simulates relational insertions with automated calculated column attributes</p>
            </div>

            <form onSubmit={handleRecordCollection} className="space-y-4" id="collection_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Farmer Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Farmer Entity *</label>
                  <select
                    value={formData.FARMER_ID}
                    onChange={(e) => setFormData({ ...formData, FARMER_ID: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    id="col_farmer_select"
                  >
                    {farmers.map(f => (
                      <option key={f.FARMER_ID} value={f.FARMER_ID}>
                        #FMR-{f.FARMER_ID} - {f.FIRST_NAME} {f.LAST_NAME} ({f.COOPERATIVE_NAME || 'Independent'}) - [{f.STATUS}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Produce Item Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Select Crop/Produce Item *</label>
                  <select
                    value={formData.PRODUCE_ID}
                    onChange={(e) => handleProduceChange(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    id="col_produce_select"
                  >
                    {produce.map(p => (
                      <option key={p.PRODUCE_ID} value={p.PRODUCE_ID}>
                        #PRD-{p.PRODUCE_ID} - {p.PRODUCE_NAME} (Base: KES {p.BASE_PRICE_PER_KG}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Intake Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Weighing Intake Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={formData.COLLECTION_DATE}
                      onChange={(e) => setFormData({ ...formData, COLLECTION_DATE: e.target.value })}
                      className="pl-10 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      id="col_date_input"
                    />
                  </div>
                </div>

                {/* Weight in KG */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Measured Quantity Weight (KG) *</label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 1500"
                      value={formData.QUANTITY_KG}
                      onChange={(e) => setFormData({ ...formData, QUANTITY_KG: Number(e.target.value) })}
                      className="pl-10 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      id="col_qty_input"
                    />
                  </div>
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Calculated Buying Unit Price (KES/KG) *</label>
                  <input
                    type="number"
                    required
                    placeholder="45"
                    value={formData.PRICE_PER_KG}
                    onChange={(e) => setFormData({ ...formData, PRICE_PER_KG: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    id="col_price_input"
                  />
                </div>

                {/* Moisture analysis */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Laboratory Moisture Content (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 13.5"
                    value={formData.MOISTURE_CONTENT}
                    onChange={(e) => setFormData({ ...formData, MOISTURE_CONTENT: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    id="col_moisture_input"
                  />
                </div>

                {/* Quality Grade */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Chemical/Physical Quality Grade *</label>
                  <select
                    value={formData.GRADE}
                    onChange={(e) => setFormData({ ...formData, GRADE: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    id="col_grade_select"
                  >
                    <option value="A">GRADE A (Premium - Dried, Sorted, High density)</option>
                    <option value="B">GRADE B (Standard - Minor sorted, Normal moisture)</option>
                    <option value="C">GRADE C (Industrial - Wet or damaged, low density)</option>
                  </select>
                </div>

                {/* Total Calculated estimate */}
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Simulated Total Amount Payout</span>
                  <span className="text-xl font-bold font-mono text-slate-900">
                    KES {(formData.QUANTITY_KG * formData.PRICE_PER_KG).toLocaleString()}
                  </span>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_cancel_col_form"
                >
                  Cancel & Exit
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_submit_col_form"
                >
                  Execute Weigh Station Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="collections_list_tab">
          
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search collection ID, farmer, produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="search_collections_input"
              />
            </div>
            <div className="text-xs text-slate-400 sm:ml-auto font-medium">
              Showing {filteredCollections.length} of {collections.length} relational rows
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="collections_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Collection ID</th>
                  <th className="py-3 px-4">Farmer Entity</th>
                  <th className="py-3 px-4">Intake Crop</th>
                  <th className="py-3 px-4">Date Registered</th>
                  <th className="py-3 px-4 text-right">Weight (KG)</th>
                  <th className="py-3 px-4 text-right">Price/KG</th>
                  <th className="py-3 px-4 text-right">Gross Total Payout</th>
                  <th className="py-3 px-4 text-center">Quality Grade</th>
                  <th className="py-3 px-4 text-center">Holiday Constraint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredCollections.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                      No weighing intake records found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredCollections.map((c) => {
                    const farmer = farmers.find(f => f.FARMER_ID === c.FARMER_ID);
                    const prod = produce.find(p => p.PRODUCE_ID === c.PRODUCE_ID);
                    return (
                      <tr key={c.COLLECTION_ID} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#COLL-{c.COLLECTION_ID}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{farmer ? `${farmer.FIRST_NAME} ${farmer.LAST_NAME}` : `ID: ${c.FARMER_ID}`}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Coop: {farmer?.COOPERATIVE_NAME || 'Independent'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {prod?.PRODUCE_NAME || `Produce ID: ${c.PRODUCE_ID}`}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{c.COLLECTION_DATE}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-950 font-mono">
                          {c.QUANTITY_KG.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kg</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs">KES {c.PRICE_PER_KG}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-emerald-700 font-mono">
                          KES {c.TOTAL_AMOUNT.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block font-bold px-2 py-0.5 rounded text-xs ${
                            c.GRADE === 'A' 
                              ? 'bg-emerald-50 text-emerald-800'
                              : c.GRADE === 'B'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}>
                            Grade {c.GRADE} ({c.MOISTURE_CONTENT || 'N/A'}% H2O)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.HOLIDAY_CHECK === 'PASSED' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {c.HOLIDAY_CHECK === 'PASSED' ? 'PASSED' : 'HOLIDAY WARNING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
