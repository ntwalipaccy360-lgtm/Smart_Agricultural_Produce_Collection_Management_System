/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Database, AlertTriangle, ArrowDown, ArrowUp, Clock, MoveRight, MapPin, Landmark 
} from 'lucide-react';
import { Inventory, Produce, ProduceCollection, Order } from '../types';

interface InventoryModuleProps {
  inventory: Inventory[];
  produce: Produce[];
  collections: ProduceCollection[];
  orders: Order[];
}

export default function InventoryModule({ inventory, produce, collections, orders }: InventoryModuleProps) {
  
  // 1. Calculations for stock summaries
  const totals = useMemo(() => {
    const totalStock = inventory.reduce((sum, i) => sum + i.STOCK_ON_HAND, 0);
    const totalAvailable = inventory.reduce((sum, i) => sum + (i.STOCK_ON_HAND - i.RESERVED_STOCK), 0);
    const lowStockItems = inventory.filter(i => i.STOCK_ON_HAND < 1500);
    return {
      totalStock,
      totalAvailable,
      lowStockCount: lowStockItems.length,
      lowStockItems
    };
  }, [inventory]);

  // 2. Simulated Stock Movement Ledger (Inflows & Outflows)
  const ledgerEntries = useMemo(() => {
    const movements: {
      id: string;
      date: string;
      type: 'INFLOW' | 'OUTFLOW';
      produceName: string;
      qty: number;
      refId: string;
      desc: string;
    }[] = [];

    // Collections add to stock (Inflows)
    collections.forEach(c => {
      const p = produce.find(pr => pr.PRODUCE_ID === c.PRODUCE_ID);
      movements.push({
        id: `MOV-IN-${c.COLLECTION_ID}`,
        date: c.COLLECTION_DATE,
        type: 'INFLOW',
        produceName: p?.PRODUCE_NAME || `Crop ID: ${c.PRODUCE_ID}`,
        qty: c.QUANTITY_KG,
        refId: `#COLL-${c.COLLECTION_ID}`,
        desc: `Farmer Weigh intake`
      });
    });

    // Orders deduct stock (Outflows)
    orders.forEach(o => {
      // For simplicity, lets derive a dummy outflow representing bulk order delivery
      // White Maize order #ORD-7001 is 4000kg
      let qty = 2000;
      let pName = "White Maize Grade 1";
      if (o.ORDER_ID === 7001) { qty = 4000; pName = "White Maize Grade 1"; }
      else if (o.ORDER_ID === 7002) { qty = 800; pName = "Hass Avocado Premium"; }
      else if (o.ORDER_ID === 7003) { qty = 2000; pName = "Premium Basmati Rice"; }

      movements.push({
        id: `MOV-OUT-${o.ORDER_ID}`,
        date: o.ORDER_DATE,
        type: 'OUTFLOW',
        produceName: pName,
        qty: qty,
        refId: `#ORD-${o.ORDER_ID}`,
        desc: `Buyer Wholesale Dispatch`
      });
    });

    // Sort by date newest
    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [collections, orders, produce]);

  return (
    <div className="space-y-6" id="inventory_module_view">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Database className="text-emerald-600 h-5 w-5" />
            Silo & Cold Storage Inventory
          </h2>
          <p className="text-xs text-slate-400 font-sans">Track commodity stock levels, bay locations, physical reservations, and real-time ledger flows</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 border rounded-xl p-2 text-xs">
          <span className="font-semibold text-slate-500">Warehouse Capacity:</span>
          <span className="font-bold text-emerald-700 font-mono">150,000 KG Max</span>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {totals.lowStockCount > 0 && (
        <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl flex items-start gap-3 text-rose-800 animate-pulse" id="inventory_critical_alert">
          <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold uppercase tracking-wide">Critical Low Storage Alert ({totals.lowStockCount} Items)</p>
            <p>The following silos have dropped below critical thresholds (1,500 KG). Arrange fresh farmer intakes immediately to prevent processing blockages:</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {totals.lowStockItems.map(i => {
                const prod = produce.find(p => p.PRODUCE_ID === i.PRODUCE_ID);
                return (
                  <span key={i.INVENTORY_ID} className="bg-white border border-rose-200 text-rose-700 px-2 py-0.5 rounded font-bold font-mono uppercase text-[10px]">
                    {prod?.PRODUCE_NAME || `ID: ${i.PRODUCE_ID}`} ({i.STOCK_ON_HAND.toLocaleString()} kg)
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Stock Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="inventory_table_container">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Real-time Silo Registry</h3>
          <span className="text-xs text-slate-400 font-semibold uppercase">Table: INVENTORY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="inventory_table">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Inventory ID</th>
                <th className="py-3 px-4">Produce Commodity</th>
                <th className="py-3 px-4 text-center">Warehouse Storage Bay</th>
                <th className="py-3 px-4 text-right">Physical Stock on Hand</th>
                <th className="py-3 px-4 text-right">Reserved (Committed)</th>
                <th className="py-3 px-4 text-right">Available for Dispatch</th>
                <th className="py-3 px-4 text-right">Last Trigger Update</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {inventory.map((inv) => {
                const prod = produce.find(p => p.PRODUCE_ID === inv.PRODUCE_ID);
                const isLow = inv.STOCK_ON_HAND < 1500;
                return (
                  <tr key={inv.INVENTORY_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#INV-{inv.INVENTORY_ID}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {prod?.PRODUCE_NAME || `Produce ID: ${inv.PRODUCE_ID}`}
                      <span className="block text-[10px] text-slate-400 font-semibold font-mono">SKU: {prod?.SKU}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-mono font-bold">
                        <MapPin className="h-3 w-3 text-emerald-600" /> {inv.LOCATION_BAY}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {inv.STOCK_ON_HAND.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {inv.RESERVED_STOCK.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-950 font-mono">
                      {(inv.STOCK_ON_HAND - inv.RESERVED_STOCK).toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 text-xs font-mono">
                      {inv.LAST_UPDATED.replace('T', ' ').substring(0, 19)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {isLow ? 'REFILL CRITICAL' : 'OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Ledger flow Logs */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Clock className="text-emerald-600 h-5 w-5" />
            Stock Inflow & Outflow Ledger
          </h3>
          <p className="text-xs text-slate-400">Chronological list of physical crop dispatches and intake receipts impacting inventory</p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100" id="inventory_flow_ledger">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase font-bold">
                <th className="p-3">Ledger ID</th>
                <th className="p-3">Transaction Date</th>
                <th className="p-3">Intake/Dispatch</th>
                <th className="p-3">Produce Commodity</th>
                <th className="p-3 text-right">Volume (KG)</th>
                <th className="p-3">Database Reference</th>
                <th className="p-3">Activity Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ledgerEntries.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-slate-700">{log.id}</td>
                  <td className="p-3 font-mono">{log.date}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      log.type === 'INFLOW' 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {log.type === 'INFLOW' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-800">{log.produceName}</td>
                  <td className={`p-3 text-right font-bold font-mono ${log.type === 'INFLOW' ? 'text-emerald-700' : 'text-blue-700'}`}>
                    {log.type === 'INFLOW' ? '+' : '-'}{log.qty.toLocaleString()} kg
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-500">{log.refId}</td>
                  <td className="p-3 text-slate-500 text-xs">{log.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
