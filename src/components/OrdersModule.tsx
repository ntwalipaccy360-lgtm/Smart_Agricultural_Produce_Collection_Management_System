/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, Plus, Calendar, User, FileText, Landmark, Trash2, X, Receipt, CheckSquare, Sparkles 
} from 'lucide-react';
import { Buyer, Order, Produce, Inventory } from '../types';
import { insertOrder, setOrders, logAuditEvent } from '../utils/db';

interface OrdersModuleProps {
  orders: Order[];
  buyers: Buyer[];
  produce: Produce[];
  inventory: Inventory[];
  onRefresh: () => void;
}

export default function OrdersModule({ orders, buyers, produce, inventory, onRefresh }: OrdersModuleProps) {
  const [activeTab, setActiveTab] = useState<'LIST' | 'CREATE'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // New Order Form state
  const [formData, setFormData] = useState({
    BUYER_ID: 2001,
    ORDER_DATE: new Date().toISOString().split('T')[0],
    EXPECTED_DELIVERY_DATE: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
    SHIPPING_ADDRESS: 'Apex Mills Depot, Thika Road'
  });

  // Items to buy (multi-item support is awesome!)
  const [orderItems, setOrderItems] = useState<{ produceId: number; qty: number; price: number }[]>([
    { produceId: 301, qty: 1000, price: 45 }
  ]);

  const [dbError, setDbError] = useState<string | null>(null);

  // Selected order details
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return null;
    return orders.find(o => o.ORDER_ID === selectedOrderId) || null;
  }, [orders, selectedOrderId]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const buyer = buyers.find(b => b.BUYER_ID === o.BUYER_ID);
      return (
        o.ORDER_ID.toString().includes(q) ||
        (buyer && buyer.COMPANY_NAME.toLowerCase().includes(q)) ||
        o.ORDER_STATUS.toLowerCase() === q
      );
    });
  }, [orders, buyers, searchQuery]);

  // Adjust standard price when item changes
  const handleItemProductChange = (index: number, produceId: number) => {
    const p = produce.find(pr => pr.PRODUCE_ID === produceId);
    if (p) {
      const updated = [...orderItems];
      updated[index] = {
        ...updated[index],
        produceId,
        price: p.BASE_PRICE_PER_KG
      };
      setOrderItems(updated);
    }
  };

  const handleItemQtyChange = (index: number, qty: number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], qty };
    setOrderItems(updated);
  };

  const handleItemPriceChange = (index: number, price: number) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], price };
    setOrderItems(updated);
  };

  const addOrderItemRow = () => {
    setOrderItems([...orderItems, { produceId: 301, qty: 1000, price: 45 }]);
  };

  const removeOrderItemRow = (index: number) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, idx) => idx !== index));
    }
  };

  // Submit Order Creation
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setDbError(null);

    const bObj = buyers.find(b => b.BUYER_ID === Number(formData.BUYER_ID));
    if (!bObj) {
      alert('Selected corporate buyer is invalid.');
      return;
    }

    if (bObj.STATUS === 'BLACKLISTED') {
      setDbError(`ORACLE SECURITY CONSTRAINT VIOLATION: Transaction blocked! Buyer company "${bObj.COMPANY_NAME}" has been BLACKLISTED for credit breaches. Operations aborted.`);
      return;
    }

    // Call simulated database order creation which handles transaction checks
    const result = insertOrder(
      {
        BUYER_ID: Number(formData.BUYER_ID),
        ORDER_DATE: formData.ORDER_DATE,
        SHIPPING_ADDRESS: formData.SHIPPING_ADDRESS,
        EXPECTED_DELIVERY_DATE: formData.EXPECTED_DELIVERY_DATE
      },
      orderItems
    );

    if (result.success && result.order) {
      onRefresh();
      // Show Invoice
      setSelectedOrderId(result.order.ORDER_ID);
      setActiveTab('LIST');
      alert(`Oracle Order Agreement #ORD-${result.order.ORDER_ID} has been successfully recorded and compiled in database instance. Outstanding buyer balances and silo levels updated.`);
    } else {
      // Show the stock rollback exception
      setDbError(`ORACLE EXCEPTION: Stock levels breach! ${result.error}`);
    }
  };

  // Ship Order (Update Status trigger)
  const handleUpdateStatus = (orderId: number, status: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED') => {
    const oObj = orders.find(o => o.ORDER_ID === orderId);
    if (!oObj) return;

    const original = { ...oObj };
    const updated = orders.map(o => {
      if (o.ORDER_ID === orderId) {
        const u = { ...o, ORDER_STATUS: status };
        logAuditEvent('UPDATE', 'ORDERS', original, u);
        return u;
      }
      return o;
    });

    setOrders(updated);
    onRefresh();
  };

  return (
    <div className="space-y-6" id="orders_module_view">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="text-emerald-600 h-5 w-5" />
            Wholesale Dispatches & Orders
          </h2>
          <p className="text-xs text-slate-400 font-sans font-medium">Record bulk dispatch contracts, run invoice billing, and check buyer credit</p>
        </div>
        <button
          onClick={() => {
            setDbError(null);
            setOrderItems([{ produceId: produce[0]?.PRODUCE_ID || 301, qty: 1000, price: produce[0]?.BASE_PRICE_PER_KG || 45 }]);
            setActiveTab(activeTab === 'LIST' ? 'CREATE' : 'LIST');
          }}
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
          id="btn_toggle_order_tab"
        >
          {activeTab === 'LIST' ? (
            <>
              <Plus className="h-4 w-4" /> Create Wholesale Contract
            </>
          ) : (
            'View All Orders'
          )}
        </button>
      </div>

      {activeTab === 'CREATE' ? (
        <div className="space-y-6" id="create_order_tab">
          
          {/* Oracle Error Alert Container */}
          {dbError && (
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl flex items-start gap-4 text-rose-900 animate-pulse" id="oracle_rollback_alert">
              <FileText className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-sm uppercase tracking-wide font-mono text-rose-800">
                  SQL EXECUTION FAILURE: TRANSACTION ROLLED BACK
                </p>
                <p className="text-xs leading-relaxed opacity-95">{dbError}</p>
                <div className="pt-2">
                  <span className="text-[10px] bg-white border border-rose-200 px-2.5 py-1 rounded font-bold uppercase font-mono text-rose-700">
                    ORA-20005: EXCEEDS_AVAILABLE_STORAGE_HOLDINGS
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 text-base">Compile Dispatch Contract</h3>
              <p className="text-xs text-slate-400">Verifies buyer credit privileges and silo stocks before committing changes</p>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-6" id="order_create_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Buyer selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Corporate Buyer *</label>
                  <select
                    value={formData.BUYER_ID}
                    onChange={(e) => setFormData({ ...formData, BUYER_ID: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    id="order_buyer_select"
                  >
                    {buyers.map(b => (
                      <option key={b.BUYER_ID} value={b.BUYER_ID}>
                        {b.COMPANY_NAME} (Contact: {b.CONTACT_PERSON}) - Credit: KES {b.CREDIT_LIMIT.toLocaleString()} - [{b.STATUS}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shipping address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.SHIPPING_ADDRESS}
                    onChange={(e) => setFormData({ ...formData, SHIPPING_ADDRESS: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="order_address_input"
                  />
                </div>

                {/* Dates */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Contract Agreement Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.ORDER_DATE}
                    onChange={(e) => setFormData({ ...formData, ORDER_DATE: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    id="order_date_input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Expected Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.EXPECTED_DELIVERY_DATE}
                    onChange={(e) => setFormData({ ...formData, EXPECTED_DELIVERY_DATE: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    id="order_delivery_date_input"
                  />
                </div>

              </div>

              {/* Order line items */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Line Commodities (Intake crosscheck)</h4>
                  <button
                    type="button"
                    onClick={addOrderItemRow}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition"
                    id="btn_add_order_item_row"
                  >
                    <Plus className="h-3 w-3" /> Add Crop Row
                  </button>
                </div>

                <div className="space-y-3">
                  {orderItems.map((item, idx) => {
                    const selectedProd = produce.find(p => p.PRODUCE_ID === item.produceId);
                    const inv = inventory.find(i => i.PRODUCE_ID === item.produceId);
                    const stockText = inv ? `${inv.AVAILABLE_STOCK.toLocaleString()} kg available` : 'No stock registered';
                    
                    return (
                      <div key={idx} className="bg-slate-50 border p-4 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end relative" id={`order_item_row_${idx}`}>
                        
                        {/* Crop Select */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Produce Crop</label>
                          <select
                            value={item.produceId}
                            onChange={(e) => handleItemProductChange(idx, Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none"
                            id={`row_produce_select_${idx}`}
                          >
                            {produce.map(p => (
                              <option key={p.PRODUCE_ID} value={p.PRODUCE_ID}>{p.PRODUCE_NAME}</option>
                            ))}
                          </select>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 block font-mono">
                            Silo Level: <strong className={inv && inv.AVAILABLE_STOCK < item.qty ? "text-rose-600" : "text-emerald-600"}>{stockText}</strong>
                          </span>
                        </div>

                        {/* Dispatch Weight */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dispatch Quantity Weight (KG)</label>
                          <input
                            type="number"
                            required
                            value={item.qty}
                            onChange={(e) => handleItemQtyChange(idx, Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none font-mono"
                            id={`row_qty_input_${idx}`}
                          />
                        </div>

                        {/* Agreement price */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contract Selling Price (KES/KG)</label>
                          <input
                            type="number"
                            required
                            value={item.price}
                            onChange={(e) => handleItemPriceChange(idx, Number(e.target.value))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none font-mono"
                            id={`row_price_input_${idx}`}
                          />
                        </div>

                        {/* Calculations & Actions */}
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                            <span className="font-bold text-xs font-mono text-slate-800">KES {(item.qty * item.price).toLocaleString()}</span>
                          </div>
                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeOrderItemRow(idx)}
                              className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl"
                              id={`btn_delete_order_row_${idx}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Total Invoice Gross</span>
                  <p className="text-xs text-slate-400">Updates the buyer balance registry immediately on database trigger</p>
                </div>
                <span className="text-2xl font-bold font-mono text-slate-900">
                  KES {orderItems.reduce((sum, i) => sum + (i.qty * i.price), 0).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('LIST')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_cancel_order_form"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_submit_order_form"
                >
                  Execute PL/SQL Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="orders_list_tab">
          
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search contract ID, company, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="search_orders_input"
              />
            </div>
            <div className="text-xs text-slate-400 sm:ml-auto font-medium">
              Showing {filteredOrders.length} of {orders.length} contract agreements
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="orders_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Contract ID</th>
                  <th className="py-3 px-4">Buyer Company</th>
                  <th className="py-3 px-4">Agreement Date</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4">Dispatch Destination</th>
                  <th className="py-3 px-4 text-right">Invoice Value</th>
                  <th className="py-3 px-4 text-center">Dispatch Status</th>
                  <th className="py-3 px-4 text-right">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                      No wholesale dispatches found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o) => {
                    const buyer = buyers.find(b => b.BUYER_ID === o.BUYER_ID);
                    return (
                      <tr key={o.ORDER_ID} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#ORD-{o.ORDER_ID}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {buyer?.COMPANY_NAME || `Buyer ID ${o.BUYER_ID}`}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{o.ORDER_DATE}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{o.EXPECTED_DELIVERY_DATE || 'Immediate'}</td>
                        <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{o.SHIPPING_ADDRESS}</td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                          KES {o.TOTAL_AMOUNT.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            o.ORDER_STATUS === 'DELIVERED' 
                              ? 'bg-emerald-50 text-emerald-700'
                              : o.ORDER_STATUS === 'SHIPPED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {o.ORDER_STATUS}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedOrderId(o.ORDER_ID)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-lg transition"
                              title="Print Invoice Receipt"
                              id={`btn_print_invoice_${o.ORDER_ID}`}
                            >
                              <Receipt className="h-3.5 w-3.5" />
                            </button>
                            {o.ORDER_STATUS === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateStatus(o.ORDER_ID, 'CONFIRMED')}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition"
                                title="Confirm Contract"
                                id={`btn_confirm_order_${o.ORDER_ID}`}
                              >
                                <CheckSquare className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {o.ORDER_STATUS === 'CONFIRMED' && (
                              <button
                                onClick={() => handleUpdateStatus(o.ORDER_ID, 'SHIPPED')}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-lg transition"
                                title="Mark Shipped"
                                id={`btn_ship_order_${o.ORDER_ID}`}
                              >
                                <CheckSquare className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {o.ORDER_STATUS === 'SHIPPED' && (
                              <button
                                onClick={() => handleUpdateStatus(o.ORDER_ID, 'DELIVERED')}
                                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-lg transition"
                                title="Mark Delivered"
                                id={`btn_deliver_order_${o.ORDER_ID}`}
                              >
                                <CheckSquare className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
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

      {/* Invoice Viewer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="invoice_modal">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-slate-100 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                  Official Wholesale Invoice
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-1">Contract Agreement #ORD-{selectedOrder.ORDER_ID}</h3>
                <p className="text-xs text-slate-400">Date Issued: {selectedOrder.ORDER_DATE}</p>
              </div>
              <button 
                onClick={() => setSelectedOrderId(null)} 
                className="text-slate-400 hover:text-slate-600 text-xl"
                id="btn_close_invoice"
              >
                ×
              </button>
            </div>

            {/* Printable Frame Area */}
            <div className="border border-slate-150 rounded-2xl p-6 space-y-6 bg-slate-50/50" id="printable_invoice_area">
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400 uppercase font-bold tracking-wider mb-1">Weighing Station (Seller)</p>
                  <p className="font-bold text-slate-800">Smart Ag-Produce Storage Hub</p>
                  <p className="text-slate-500">Silo Complex Block 3A, Thika District</p>
                  <p className="text-slate-500">Nairobi, Kenya</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 uppercase font-bold tracking-wider mb-1">Corporate Client (Buyer)</p>
                  <p className="font-bold text-slate-800">
                    {buyers.find(b => b.BUYER_ID === selectedOrder.BUYER_ID)?.COMPANY_NAME || 'Unknown Buyer'}
                  </p>
                  <p className="text-slate-500">{selectedOrder.SHIPPING_ADDRESS}</p>
                  <p className="text-slate-500 font-mono">Contact: {buyers.find(b => b.BUYER_ID === selectedOrder.BUYER_ID)?.PHONE}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-xl bg-white overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 font-bold uppercase text-slate-400">
                      <th className="p-3">Produce Commodity Description</th>
                      <th className="p-3 text-right">Standard Rate / KG</th>
                      <th className="p-3 text-right">Dispatched Weight (KG)</th>
                      <th className="p-3 text-right">Line Total (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Simulated Order Items */}
                    <tr>
                      <td className="p-3 font-semibold text-slate-800">
                        {/* Resolve produce name if possible */}
                        White Maize Grade 1 (Standard Feed Milling)
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">KES 45.00</td>
                      <td className="p-3 text-right font-mono text-slate-800">
                        {Math.floor(selectedOrder.TOTAL_AMOUNT / 45 || 1000).toLocaleString()} kg
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 font-mono">
                        KES {selectedOrder.TOTAL_AMOUNT.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Payout Section */}
              <div className="flex justify-end text-right">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-400">Net Commodity Value</span>
                    <span className="font-mono text-slate-800 font-bold">KES {selectedOrder.TOTAL_AMOUNT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-slate-400">Value Added Tax (0% Exempt)</span>
                    <span className="font-mono text-slate-800 font-bold">KES 0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                    <span>Invoice Net Balance Due</span>
                    <span className="font-mono text-emerald-800">KES {selectedOrder.TOTAL_AMOUNT.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-dashed">
                Thank you for your valued agricultural trade partnership. Outstanding balances must be settled within net-30 days according to pre-allocated credit terms.
              </div>

            </div>

            {/* Print and Download Buttons */}
            <div className="flex justify-between gap-2 border-t pt-4">
              <span className="text-xs text-slate-400 font-mono mt-2 uppercase">Oracle Audit ID: #TXN-ORD-AUTO-{selectedOrder.ORDER_ID}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_print_invoice_frame"
                >
                  Print Document
                </button>
                <button
                  onClick={() => alert('Download PDF function is fully generated as a placeholder for Oracle APEX report generation workflows.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_pdf_invoice_frame"
                >
                  Download PDF
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
