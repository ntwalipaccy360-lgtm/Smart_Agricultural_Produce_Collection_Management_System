/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Users, ShoppingBag, Sprout, Database, FileText, Landmark, Clock, ArrowUpRight, TrendingUp, AlertCircle, Sparkles, Activity
} from 'lucide-react';
import { Farmer, Buyer, ProduceCollection, Inventory, Order, Payment } from '../types';

interface DashboardProps {
  farmers: Farmer[];
  buyers: Buyer[];
  collections: ProduceCollection[];
  inventory: Inventory[];
  orders: Order[];
  payments: Payment[];
  onNavigate: (view: any) => void;
}

export default function Dashboard({ 
  farmers, 
  buyers, 
  collections, 
  inventory, 
  orders, 
  payments,
  onNavigate
}: DashboardProps) {

  // 1. Calculations
  const stats = useMemo(() => {
    const activeFarmers = farmers.filter(f => f.STATUS === 'ACTIVE').length;
    const activeBuyers = buyers.filter(b => b.STATUS === 'ACTIVE').length;
    
    // Total KG collected
    const totalKg = collections.reduce((sum, c) => sum + c.QUANTITY_KG, 0);
    
    // Total Value of collections (payout obligations)
    const totalPayoutValue = collections.reduce((sum, c) => sum + c.TOTAL_AMOUNT, 0);
    
    // Inventory total stock in hand
    const totalStockHand = inventory.reduce((sum, i) => sum + i.STOCK_ON_HAND, 0);
    
    // Total order revenue
    const totalRevenueValue = orders.reduce((sum, o) => sum + o.TOTAL_AMOUNT, 0);

    // Low stock warnings (under 1000kg)
    const lowStockCount = inventory.filter(i => i.STOCK_ON_HAND < 1500).length;

    // Pending Payments count
    const pendingPayCount = payments.filter(p => p.STATUS === 'PENDING').length;

    return {
      activeFarmers,
      activeBuyers,
      totalKg,
      totalPayoutValue,
      totalStockHand,
      totalRevenueValue,
      lowStockCount,
      pendingPayCount
    };
  }, [farmers, buyers, collections, inventory, orders, payments]);

  // 2. Custom High-Fidelity SVG Chart Calculations
  // A. Bar Chart: Produce Stock Levels
  const barChartData = useMemo(() => {
    // Top 5 produce stocks
    const prodStocks = inventory.map(inv => {
      const pId = inv.PRODUCE_ID;
      // Get name
      const pList = JSON.parse(localStorage.getItem('agri_produce') || '[]');
      const prod = pList.find((p: any) => p.PRODUCE_ID === pId);
      return {
        name: prod?.PRODUCE_NAME || `ID: ${pId}`,
        stock: inv.STOCK_ON_HAND
      };
    }).slice(0, 5);

    const maxStock = Math.max(...prodStocks.map(d => d.stock), 1000);
    return { data: prodStocks, maxStock };
  }, [inventory]);

  // B. Pie Chart: Collections by Grade
  const pieChartData = useMemo(() => {
    const grades = { A: 0, B: 0, C: 0 };
    collections.forEach(c => {
      if (c.GRADE === 'A') grades.A += c.QUANTITY_KG;
      else if (c.GRADE === 'B') grades.B += c.QUANTITY_KG;
      else grades.C += c.QUANTITY_KG;
    });
    const total = (grades.A + grades.B + grades.C) || 1;
    return [
      { grade: 'Grade A', value: grades.A, percent: Math.round((grades.A / total) * 100), color: '#10b981' }, // emerald
      { grade: 'Grade B', value: grades.B, percent: Math.round((grades.B / total) * 100), color: '#3b82f6' }, // blue
      { grade: 'Grade C', value: grades.C, percent: Math.round((grades.C / total) * 100), color: '#f59e0b' }  // amber
    ];
  }, [collections]);

  // C. Line Chart: Collections trend (last 5 collections volume)
  const trendChartData = useMemo(() => {
    const sorted = [...collections]
      .sort((a, b) => new Date(a.COLLECTION_DATE).getTime() - new Date(b.COLLECTION_DATE).getTime())
      .slice(-6);
    const maxVal = Math.max(...sorted.map(s => s.QUANTITY_KG), 1000);
    return { data: sorted, maxVal };
  }, [collections]);

  // System notifications list
  const systemAlerts = useMemo(() => {
    const alerts = [];
    if (stats.lowStockCount > 0) {
      alerts.push({
        type: 'danger',
        title: 'Critical Low Stock Alert',
        message: `${stats.lowStockCount} produce categories are holding under critical threshold (1,500 kg).`,
        time: 'Just now'
      });
    }
    if (stats.pendingPayCount > 0) {
      alerts.push({
        type: 'warning',
        title: 'Pending Disbursements',
        message: `There are ${stats.pendingPayCount} unresolved farmer payouts waiting for Oracle account settlement.`,
        time: '5 mins ago'
      });
    }
    // Add holiday check
    const today = new Date().toISOString().split('T')[0];
    const holidays = JSON.parse(localStorage.getItem('agri_holidays') || '[]');
    const isHoliday = holidays.find((h: any) => h.HOLIDAY_DATE === today && h.IS_COLLECTION_BLOCKED === 'Y');
    if (isHoliday) {
      alerts.push({
        type: 'info',
        title: 'Holiday Operational Trigger',
        message: `Today is "${isHoliday.HOLIDAY_NAME}". Collection entries are blocked/flagged by trigger constraint.`,
        time: 'Active'
      });
    }

    return alerts;
  }, [stats.lowStockCount, stats.pendingPayCount]);

  return (
    <div className="space-y-8" id="dashboard_view">
      
      {/* Upper Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-green-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Sprout className="w-64 h-64 translate-x-12 translate-y-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Academic Preview Engine
            </span>
            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-xs text-white/90">
              <Sparkles className="h-3 w-3 text-amber-300" />
              Oracle Capstone Simulation
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Agriculture Collection Dashboard</h1>
          <p className="mt-1 text-emerald-100 max-w-xl text-sm">
            Interactive metrics simulated directly from relational integrity schemas. Fully compliant with Oracle triggers and PL/SQL auditable constraints.
          </p>
        </div>
      </div>

      {/* Primary Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard_stats_grid">
        
        {/* Farmers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Farmers</p>
            <h3 className="text-2xl font-bold text-slate-900">{farmers.length}</h3>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {stats.activeFarmers} Active in cooperatives
            </span>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Inventory Stock */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage Stock</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.totalStockHand.toLocaleString()} <span className="text-sm font-normal text-slate-500">kg</span></h3>
            <span className={`text-xs font-medium flex items-center gap-1 ${stats.lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              <AlertCircle className="h-3 w-3" />
              {stats.lowStockCount > 0 ? `${stats.lowStockCount} Low stock alerts` : 'All stocks optimal'}
            </span>
          </div>
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
            <Database className="h-6 w-6" />
          </div>
        </div>

        {/* Order Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Invoiced Sales</p>
            <h3 className="text-2xl font-bold text-slate-900">KES {stats.totalRevenueValue.toLocaleString()}</h3>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              From {orders.length} buyer order agreements
            </span>
          </div>
          <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* Farmer Payments */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Farmer Payouts</p>
            <h3 className="text-2xl font-bold text-slate-900">KES {stats.totalPayoutValue.toLocaleString()}</h3>
            <span className={`text-xs font-medium flex items-center gap-1 ${stats.pendingPayCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              <Clock className="h-3 w-3" />
              {stats.pendingPayCount} payouts pending
            </span>
          </div>
          <div className="bg-purple-50 text-purple-600 p-4 rounded-2xl">
            <Landmark className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Main Analytical Section with Custom SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_analytics_grid">
        
        {/* Trend Area Chart (Line SVG) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Produce Collection Trends</h3>
              <p className="text-xs text-slate-400">Chronological display of last recorded collection transactions (kg)</p>
            </div>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <Activity className="h-3 w-3" /> Live Feed
            </span>
          </div>

          <div className="h-64 w-full relative flex items-end pt-6" id="collection_trend_chart">
            {/* Draw Simulated Line Chart in SVG */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* grid lines */}
              <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#f1f5f9" strokeWidth="1" />

              {/* Path generation */}
              {trendChartData.data.length > 1 && (() => {
                const totalPoints = trendChartData.data.length;
                const points = trendChartData.data.map((item, idx) => {
                  const x = (idx / (totalPoints - 1)) * 100;
                  const y = 100 - ((item.QUANTITY_KG / trendChartData.maxVal) * 80 + 10); // leave 10% margins
                  return { x, y, val: item.QUANTITY_KG, date: item.COLLECTION_DATE };
                });

                const pathStr = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x}% ${p.y}%`).join(' ');
                const fillPathStr = `${pathStr} L 100% 100% L 0% 100% Z`;

                return (
                  <>
                    {/* Fill */}
                    <path d={fillPathStr} fill="url(#chart-grad)" />
                    {/* Line */}
                    <path d={pathStr} fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
                    {/* Dots & Labels */}
                    {points.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={`${p.x}%`} cy={`${p.y}%`} r="5" fill="#ffffff" stroke="#059669" strokeWidth="3" />
                        <text x={`${p.x}%`} y={`${p.y - 12}%`} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f172a" className="font-mono">
                          {Math.round(p.val)}kg
                        </text>
                        <text x={`${p.x}%`} y="105%" textAnchor="middle" fontSize="9" fill="#94a3b8">
                          {p.date.substring(5)}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* Donut Pie Chart: Grade Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Produce Grade Ratio</h3>
            <p className="text-xs text-slate-400">Distribution of collected quantity by quality assessment grade</p>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative h-40 w-40">
              {/* SVG circular donut */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                {(() => {
                  let cumPercent = 0;
                  return pieChartData.map((slice, idx) => {
                    const strokeDash = `${slice.percent} ${100 - slice.percent}`;
                    const strokeOffset = 100 - cumPercent + 25; // standard circle offset
                    cumPercent += slice.percent;
                    if (slice.value === 0) return null;
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="12"
                        strokeDasharray={strokeDash}
                        strokeDashoffset={strokeOffset}
                        pathLength="100"
                        className="transition-all duration-1000"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Quality</span>
                <span className="text-xl font-bold text-slate-800">
                  {Math.round(stats.totalKg).toLocaleString()} kg
                </span>
              </div>
            </div>

            {/* Legends */}
            <div className="w-full grid grid-cols-3 gap-2 mt-6">
              {pieChartData.map((slice, idx) => (
                <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100/50">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="text-xs font-bold text-slate-700">{slice.grade}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 font-mono">{slice.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_lower_section">
        
        {/* Custom Bar Chart: Stock levels by produce */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Inventory Holdings (Silo & Bays)</h3>
            <p className="text-xs text-slate-400">Visual comparison of storage stock levels in major grain and tuber categories (kg)</p>
          </div>

          <div className="space-y-4 pt-4" id="inventory_stock_bars">
            {barChartData.data.map((item, idx) => {
              const pct = Math.max(5, (item.stock / barChartData.maxStock) * 100);
              const isLow = item.stock < 1500;
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.name}</span>
                    <span className={`font-mono font-bold ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {item.stock.toLocaleString()} kg {isLow && '(Critical Low)'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isLow ? 'bg-rose-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications & System Health */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-lg">Active System Alerts</h3>
            <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">Oracle Audit</span>
          </div>

          <div className="space-y-4" id="dashboard_alerts_container">
            {systemAlerts.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex bg-emerald-50 text-emerald-600 p-3 rounded-2xl mb-2">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">All Systems Functional</p>
                <p className="text-xs text-slate-400 mt-0.5">Database triggers & security active.</p>
              </div>
            ) : (
              systemAlerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-2xl border flex gap-3 ${
                    alert.type === 'danger' 
                      ? 'bg-rose-50 border-rose-100 text-rose-800' 
                      : alert.type === 'warning'
                      ? 'bg-amber-50 border-amber-100 text-amber-800'
                      : 'bg-blue-50 border-blue-100 text-blue-800'
                  }`}
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold font-sans">{alert.title}</p>
                    <p className="text-xs leading-relaxed opacity-90">{alert.message}</p>
                    <span className="block text-[10px] font-mono tracking-wide opacity-70 uppercase pt-1">{alert.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Orders table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Recent Buyer Order Agreements</h3>
            <p className="text-xs text-slate-400">Auditable wholesale dispatches recorded in simulated Oracle ORDERS table</p>
          </div>
          <button 
            onClick={() => onNavigate('ORDERS')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            id="btn_view_orders_dash"
          >
            Manage Orders <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto" id="recent_orders_table_dash">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Buyer Company</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Dispatch Destination</th>
                <th className="py-3 px-4 text-right">Invoice Value</th>
                <th className="py-3 px-4 text-center">Trigger Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.slice(0, 3).map((order) => {
                const buyerObj = buyers.find(b => b.BUYER_ID === order.BUYER_ID);
                return (
                  <tr key={order.ORDER_ID} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">#ORD-{order.ORDER_ID}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {buyerObj?.COMPANY_NAME || `Buyer ID ${order.BUYER_ID}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{order.ORDER_DATE}</td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{order.SHIPPING_ADDRESS}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      KES {order.TOTAL_AMOUNT.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        order.ORDER_STATUS === 'DELIVERED' 
                          ? 'bg-emerald-50 text-emerald-700'
                          : order.ORDER_STATUS === 'SHIPPED'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {order.ORDER_STATUS}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
