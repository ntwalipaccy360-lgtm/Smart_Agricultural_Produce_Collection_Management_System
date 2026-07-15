/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  FileText, Printer, FileSpreadsheet, Download, RefreshCw, Calendar, Sparkles, Scale, Database 
} from 'lucide-react';
import { Farmer, Buyer, Produce, ProduceCollection, Inventory, Order, Payment } from '../types';

interface ReportsModuleProps {
  farmers: Farmer[];
  buyers: Buyer[];
  produce: Produce[];
  collections: ProduceCollection[];
  inventory: Inventory[];
  orders: Order[];
  payments: Payment[];
}

type ReportType = 'COLLECTIONS' | 'INVENTORY' | 'SALES' | 'PAYMENTS' | 'COOPS';

export default function ReportsModule({ 
  farmers, buyers, produce, collections, inventory, orders, payments 
}: ReportsModuleProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>('COLLECTIONS');

  // Calculations for current date
  const generatedDate = useMemo(() => new Date().toISOString().replace('T', ' ').substring(0, 19), []);

  // Handle Export Trigger
  const handleExport = (format: 'EXCEL' | 'PDF') => {
    if (format === 'EXCEL') {
      alert(`Oracle APEX SQL Workshop Integration: Extracted ${selectedReport}_REPORT_DATA.xlsx file successfully. Raw data rows serialized as binary CSV.`);
    } else {
      alert(`Oracle BI Publisher: Compiling ${selectedReport}_REPORT.pdf with standard corporate template layout. File saved.`);
    }
  };

  return (
    <div className="space-y-6" id="reports_module_view">
      
      {/* Selector and Action buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="text-emerald-600 h-5 w-5" />
              Corporate BI Reports
            </h2>
            <p className="text-xs text-slate-400">Generate, print, and export official Oracle schema analysis records</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleExport('EXCEL')}
              className="flex-1 sm:flex-none border border-slate-200 text-slate-600 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn_export_excel"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="flex-1 sm:flex-none border border-slate-200 text-slate-600 px-3 py-2 text-xs font-semibold rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn_export_pdf"
            >
              <Download className="h-4 w-4 text-rose-500" /> Download PDF
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn_print_report"
            >
              <Printer className="h-4 w-4" /> Print Report
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
          {[
            { id: 'COLLECTIONS', name: 'Crop Intake Collections' },
            { id: 'INVENTORY', name: 'Silo Storage Holdings' },
            { id: 'SALES', name: 'Wholesale Purchase Orders' },
            { id: 'PAYMENTS', name: 'Financial Settlements Ledger' },
            { id: 'COOPS', name: 'Cooperative Farmer Directory' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id as ReportType)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
                selectedReport === tab.id 
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-100' 
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Report Preview Sheet */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6 font-sans relative" id="printable_report_sheet">
        
        {/* Academic watermark stamp (only visible on screen) */}
        <div className="absolute top-8 right-8 bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200 print:hidden flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Oracle Capstone BI Report
        </div>

        {/* Corporate Header */}
        <div className="border-b border-double border-slate-300 pb-5 space-y-2">
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">SMART AG-PRODUCE STORAGE HUBS</h1>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">Simulated Oracle Relational Database capstone portal</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 text-slate-500">
            <div>
              <p><strong>Report Document:</strong> {selectedReport}_BI_LEDGER_SHEET</p>
              <p><strong>Extraction Timestamp:</strong> {generatedDate} UTC</p>
            </div>
            <div className="sm:text-right">
              <p><strong>Reconciliation:</strong> Fully Consolidated (Local Mock DB)</p>
              <p><strong>Database Version:</strong> Oracle DB Cloud 19c / APEX 23.2</p>
            </div>
          </div>
        </div>

        {/* 1. Collections Report */}
        {selectedReport === 'COLLECTIONS' && (
          <div className="space-y-4" id="collections_report_sheet">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-2 border-l-4 border-emerald-600">
              Crop Intake & Quality Collections Summary
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50/50 p-3 rounded-2xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Weighings</span>
                <span className="text-lg font-bold font-mono text-slate-800">{collections.length} rows</span>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-2xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Consolidated Weight</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {collections.reduce((sum, c) => sum + c.QUANTITY_KG, 0).toLocaleString()} kg
                </span>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-2xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Intake Value</span>
                <span className="text-lg font-bold font-mono text-emerald-800">
                  KES {collections.reduce((sum, c) => sum + c.TOTAL_AMOUNT, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse border">
              <thead>
                <tr className="bg-slate-50 border-b font-bold uppercase text-slate-500">
                  <th className="p-2.5 border">Intake ID</th>
                  <th className="p-2.5 border">Intake Date</th>
                  <th className="p-2.5 border">Farmer cooperative</th>
                  <th className="p-2.5 border">Produce Commodity</th>
                  <th className="p-2.5 border text-right">Qty (KG)</th>
                  <th className="p-2.5 border text-right">P / KG</th>
                  <th className="p-2.5 border text-right">Net Value</th>
                  <th className="p-2.5 border text-center">Moisture</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {collections.map(c => {
                  const fObj = farmers.find(f => f.FARMER_ID === c.FARMER_ID);
                  const pObj = produce.find(p => p.PRODUCE_ID === c.PRODUCE_ID);
                  return (
                    <tr key={c.COLLECTION_ID}>
                      <td className="p-2.5 border font-mono font-bold">#COLL-{c.COLLECTION_ID}</td>
                      <td className="p-2.5 border font-mono">{c.COLLECTION_DATE}</td>
                      <td className="p-2.5 border font-semibold">{fObj?.FIRST_NAME} {fObj?.LAST_NAME} ({fObj?.COOPERATIVE_NAME || 'Ind.'})</td>
                      <td className="p-2.5 border font-medium">{pObj?.PRODUCE_NAME}</td>
                      <td className="p-2.5 border text-right font-mono font-bold">{c.QUANTITY_KG.toLocaleString()} kg</td>
                      <td className="p-2.5 border text-right font-mono">KES {c.PRICE_PER_KG}</td>
                      <td className="p-2.5 border text-right font-mono font-bold text-emerald-800">KES {c.TOTAL_AMOUNT.toLocaleString()}</td>
                      <td className="p-2.5 border text-center font-mono">{c.MOISTURE_CONTENT || 'N/A'}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Inventory Report */}
        {selectedReport === 'INVENTORY' && (
          <div className="space-y-4" id="inventory_report_sheet">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-2 border-l-4 border-emerald-600">
              Silo Holdings & Storage Environment Report
            </h3>
            <table className="w-full text-left text-xs border-collapse border">
              <thead>
                <tr className="bg-slate-50 border-b font-bold uppercase text-slate-500">
                  <th className="p-2.5 border">Silo ID</th>
                  <th className="p-2.5 border">Produce name</th>
                  <th className="p-2.5 border">SKU reference</th>
                  <th className="p-2.5 border text-center">Bay Location</th>
                  <th className="p-2.5 border text-right">Physical Stock</th>
                  <th className="p-2.5 border text-right">Reserved stock</th>
                  <th className="p-2.5 border text-right">Available weight</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {inventory.map(inv => {
                  const pObj = produce.find(p => p.PRODUCE_ID === inv.PRODUCE_ID);
                  return (
                    <tr key={inv.INVENTORY_ID}>
                      <td className="p-2.5 border font-mono font-bold">#INV-{inv.INVENTORY_ID}</td>
                      <td className="p-2.5 border font-bold">{pObj?.PRODUCE_NAME}</td>
                      <td className="p-2.5 border font-mono text-slate-500">{pObj?.SKU}</td>
                      <td className="p-2.5 border text-center font-mono font-bold">{inv.LOCATION_BAY}</td>
                      <td className="p-2.5 border text-right font-mono font-bold">{inv.STOCK_ON_HAND.toLocaleString()} kg</td>
                      <td className="p-2.5 border text-right font-mono text-slate-400">{inv.RESERVED_STOCK.toLocaleString()} kg</td>
                      <td className="p-2.5 border text-right font-mono font-black text-emerald-800">{(inv.STOCK_ON_HAND - inv.RESERVED_STOCK).toLocaleString()} kg</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Sales Report */}
        {selectedReport === 'SALES' && (
          <div className="space-y-4" id="sales_report_sheet">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-2 border-l-4 border-emerald-600">
              Wholesale Order agreements & dispatch sales
            </h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50/50 p-3 rounded-2xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Bulk Contracts</span>
                <span className="text-lg font-bold font-mono text-slate-800">{orders.length} agreements</span>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-2xl border">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Gross Sales Value</span>
                <span className="text-lg font-bold font-mono text-emerald-800">
                  KES {orders.reduce((sum, o) => sum + o.TOTAL_AMOUNT, 0).toLocaleString()}
                </span>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse border">
              <thead>
                <tr className="bg-slate-50 border-b font-bold uppercase text-slate-500">
                  <th className="p-2.5 border">Contract ID</th>
                  <th className="p-2.5 border">Buyer Corporation</th>
                  <th className="p-2.5 border">Agreement Date</th>
                  <th className="p-2.5 border">Dispatch Destination</th>
                  <th className="p-2.5 border text-right">Contract Gross (KES)</th>
                  <th className="p-2.5 border text-center">Trigger Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {orders.map(o => {
                  const bObj = buyers.find(b => b.BUYER_ID === o.BUYER_ID);
                  return (
                    <tr key={o.ORDER_ID}>
                      <td className="p-2.5 border font-mono font-bold">#ORD-{o.ORDER_ID}</td>
                      <td className="p-2.5 border font-semibold">{bObj?.COMPANY_NAME}</td>
                      <td className="p-2.5 border font-mono">{o.ORDER_DATE}</td>
                      <td className="p-2.5 border truncate max-w-xs">{o.SHIPPING_ADDRESS}</td>
                      <td className="p-2.5 border text-right font-mono font-bold">KES {o.TOTAL_AMOUNT.toLocaleString()}</td>
                      <td className="p-2.5 border text-center font-bold font-mono uppercase text-[10px]">{o.ORDER_STATUS}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Payments Report */}
        {selectedReport === 'PAYMENTS' && (
          <div className="space-y-4" id="payments_report_sheet">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-2 border-l-4 border-emerald-600">
              Financial Settlements & Banking reconciliations
            </h3>
            <table className="w-full text-left text-xs border-collapse border">
              <thead>
                <tr className="bg-slate-50 border-b font-bold uppercase text-slate-500">
                  <th className="p-2.5 border">Payment ID</th>
                  <th className="p-2.5 border">Banking Action</th>
                  <th className="p-2.5 border">Source ID</th>
                  <th className="p-2.5 border">Reference code</th>
                  <th className="p-2.5 border text-right">Settled Amount</th>
                  <th className="p-2.5 border">Channel</th>
                  <th className="p-2.5 border text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {payments.map(p => (
                  <tr key={p.PAYMENT_ID}>
                    <td className="p-2.5 border font-mono font-bold">#PAY-{p.PAYMENT_ID}</td>
                    <td className="p-2.5 border">
                      <span className={`font-bold text-[10px] ${p.SOURCE_TYPE === 'COLLECTION' ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {p.SOURCE_TYPE === 'COLLECTION' ? 'DISBURSEMENT (OUT)' : 'REVENUE (IN)'}
                      </span>
                    </td>
                    <td className="p-2.5 border font-mono font-bold text-slate-500">
                      {p.SOURCE_TYPE === 'COLLECTION' ? `#COLL-${p.SOURCE_ID}` : `#ORD-${p.SOURCE_ID}`}
                    </td>
                    <td className="p-2.5 border font-mono text-slate-600">{p.TRANSACTION_REFERENCE}</td>
                    <td className={`p-2.5 border text-right font-mono font-bold ${p.SOURCE_TYPE === 'COLLECTION' ? 'text-rose-600' : 'text-emerald-700'}`}>
                      KES {p.AMOUNT.toLocaleString()}
                    </td>
                    <td className="p-2.5 border font-medium uppercase text-[10px]">{p.PAYMENT_METHOD}</td>
                    <td className="p-2.5 border text-center font-bold text-[10px]">{p.STATUS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Coops Report */}
        {selectedReport === 'COOPS' && (
          <div className="space-y-4" id="coops_report_sheet">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-50 p-2 border-l-4 border-emerald-600">
              Cooperative Farmer directories & Membership statuses
            </h3>
            <table className="w-full text-left text-xs border-collapse border">
              <thead>
                <tr className="bg-slate-50 border-b font-bold uppercase text-slate-500">
                  <th className="p-2.5 border">Farmer ID</th>
                  <th className="p-2.5 border">FullName</th>
                  <th className="p-2.5 border">National Document ID</th>
                  <th className="p-2.5 border">District Region</th>
                  <th className="p-2.5 border">Cooperative Name</th>
                  <th className="p-2.5 border font-mono text-xs">Date Joined</th>
                  <th className="p-2.5 border text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {farmers.map(f => (
                  <tr key={f.FARMER_ID}>
                    <td className="p-2.5 border font-mono font-bold">#FMR-{f.FARMER_ID}</td>
                    <td className="p-2.5 border font-bold">{f.FIRST_NAME} {f.LAST_NAME}</td>
                    <td className="p-2.5 border font-mono text-slate-600">{f.NATIONAL_ID}</td>
                    <td className="p-2.5 border font-medium text-slate-800">{f.REGION}</td>
                    <td className="p-2.5 border text-slate-700 font-semibold">{f.COOPERATIVE_NAME || 'Independent'}</td>
                    <td className="p-2.5 border font-mono text-slate-500">{f.JOIN_DATE}</td>
                    <td className="p-2.5 border text-center font-bold text-[10px]">{f.STATUS}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Auditor signoff block */}
        <div className="border-t border-slate-300 pt-6 grid grid-cols-2 gap-4 text-xs">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Compiled By (Operator)</p>
            <div className="border-b border-slate-300 w-48 h-8" />
            <p className="text-slate-500 mt-1">Smart Ag-Produce Hub Clerk Registry</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-slate-400 font-bold uppercase tracking-wider mb-2">Authorized Sign-off (Database Administrator)</p>
            <div className="border-b border-slate-300 w-48 h-8" />
            <p className="text-slate-500 mt-1">Simulated Oracle Audit Certificate</p>
          </div>
        </div>

      </div>

    </div>
  );
}
