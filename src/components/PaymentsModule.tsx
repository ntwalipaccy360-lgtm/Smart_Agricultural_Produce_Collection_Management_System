/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Landmark, Search, CheckCircle, Clock, FileText, ArrowUpRight, ArrowDownLeft, X, DollarSign, Receipt, RefreshCw 
} from 'lucide-react';
import { Payment } from '../types';
import { processPayment } from '../utils/db';

interface PaymentsModuleProps {
  payments: Payment[];
  onRefresh: () => void;
}

export default function PaymentsModule({ payments, onRefresh }: PaymentsModuleProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const q = searchQuery.toLowerCase();
      return (
        p.PAYMENT_ID.toString().includes(q) ||
        p.TRANSACTION_REFERENCE.toLowerCase().includes(q) ||
        p.PAYMENT_METHOD.toLowerCase().includes(q) ||
        p.STATUS.toLowerCase() === q
      );
    });
  }, [payments, searchQuery]);

  // Selected payment for receipt
  const selectedPayment = useMemo(() => {
    if (!selectedPaymentId) return null;
    return payments.find(p => p.PAYMENT_ID === selectedPaymentId) || null;
  }, [payments, selectedPaymentId]);

  // Handle payment processing (Trigger settlement)
  const handleSettle = (paymentId: number) => {
    const result = processPayment(paymentId);
    if (result) {
      onRefresh();
      alert(`Oracle Settlement: Transaction #PAY-${paymentId} has been successfully settled. Oracle triggers have reconciled the connected buyer's credit balance.`);
    }
  };

  return (
    <div className="space-y-6" id="payments_module_view">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="text-emerald-600 h-5 w-5" />
            Financial Payouts & Receipts
          </h2>
          <p className="text-xs text-slate-400 font-sans">Settle cooperative crop collections (outflows) and track wholesale purchase invoice payments (inflows)</p>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1.5 rounded-xl font-bold font-mono">
          <Clock className="h-4 w-4 shrink-0" />
          {payments.filter(p => p.STATUS === 'PENDING').length} Transactions Awaiting Banking Settlement
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="payments_ledger_container">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search reference code, payment ID, status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              id="search_payments_input"
            />
          </div>
          <span className="text-xs text-slate-400 sm:ml-auto font-semibold uppercase font-mono">
            Table: PAYMENTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="payments_table">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                <th className="py-3 px-4">Payment ID</th>
                <th className="py-3 px-4">Banking Direction</th>
                <th className="py-3 px-4">Reference Source ID</th>
                <th className="py-3 px-4">Ledger Value Date</th>
                <th className="py-3 px-4 text-right">Transaction Amount</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4 text-center">Oracle Status</th>
                <th className="py-3 px-4 text-right">Receipt & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                    No financial ledger items found matching "{searchQuery}".
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isOutflow = p.SOURCE_TYPE === 'COLLECTION';
                  return (
                    <tr key={p.PAYMENT_ID} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#PAY-{p.PAYMENT_ID}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          isOutflow 
                            ? 'bg-rose-50 text-rose-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isOutflow ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownLeft className="h-3 w-3" />}
                          {isOutflow ? 'PAYOUT (DISBURSEMENT)' : 'REVENUE (COLLECTION IN)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {p.SOURCE_TYPE === 'COLLECTION' ? `#COLL-${p.SOURCE_ID}` : `#ORD-${p.SOURCE_ID}`}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{p.PAYMENT_DATE}</td>
                      <td className={`py-3.5 px-4 text-right font-bold font-mono text-sm ${
                        isOutflow ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {isOutflow ? '-' : '+'}KES {p.AMOUNT.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 text-xs uppercase tracking-wider">
                        {p.PAYMENT_METHOD.replace('_', ' ')}
                        <span className="block text-[10px] text-slate-400 font-mono lowercase">{p.TRANSACTION_REFERENCE}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          p.STATUS === 'COMPLETED' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.STATUS === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {p.STATUS}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPaymentId(p.PAYMENT_ID)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-lg transition"
                            title="Print Banking Voucher Receipt"
                            id={`btn_print_receipt_${p.PAYMENT_ID}`}
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                          {p.STATUS === 'PENDING' && (
                            <button
                              onClick={() => handleSettle(p.PAYMENT_ID)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition uppercase tracking-wider cursor-pointer"
                              id={`btn_settle_${p.PAYMENT_ID}`}
                            >
                              Settle
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

      {/* Banking Voucher Receipt Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="receipt_modal">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-6">
            
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono">
                  Oracle Payment Voucher
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">Transaction #PAY-{selectedPayment.PAYMENT_ID}</h3>
                <p className="text-xs text-slate-400">Value Date: {selectedPayment.PAYMENT_DATE}</p>
              </div>
              <button 
                onClick={() => setSelectedPaymentId(null)} 
                className="text-slate-400 hover:text-slate-600 text-xl"
                id="btn_close_receipt"
              >
                ×
              </button>
            </div>

            {/* Receipt Details Box */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4" id="printable_receipt_area">
              <div className="flex justify-between text-xs border-b pb-2">
                <span className="text-slate-400">System Source</span>
                <span className="font-bold text-slate-800 uppercase font-mono">{selectedPayment.SOURCE_TYPE} Reference</span>
              </div>

              <div className="flex justify-between text-xs border-b pb-2">
                <span className="text-slate-400">Database Source ID</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {selectedPayment.SOURCE_TYPE === 'COLLECTION' ? `#COLL-${selectedPayment.SOURCE_ID}` : `#ORD-${selectedPayment.SOURCE_ID}`}
                </span>
              </div>

              <div className="flex justify-between text-xs border-b pb-2">
                <span className="text-slate-400">Audit Banking Code</span>
                <span className="font-mono text-slate-600">{selectedPayment.TRANSACTION_REFERENCE}</span>
              </div>

              <div className="flex justify-between text-xs border-b pb-2">
                <span className="text-slate-400">Payment Channel</span>
                <span className="font-bold text-slate-800 uppercase font-sans text-[10px]">{selectedPayment.PAYMENT_METHOD.replace('_', ' ')}</span>
              </div>

              <div className="flex justify-between text-xs border-b pb-2">
                <span className="text-slate-400">Oracle Reconciliation State</span>
                <span className={`font-bold uppercase text-[10px] ${selectedPayment.STATUS === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {selectedPayment.STATUS}
                </span>
              </div>

              {/* Dynamic Amount Ring */}
              <div className="pt-2 text-center space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Reconciled Cash Value</span>
                <p className="text-2xl font-black font-mono text-slate-900">
                  KES {selectedPayment.AMOUNT.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Print and Download placeholders */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                id="btn_print_receipt_frame"
              >
                Print Voucher
              </button>
              <button
                onClick={() => alert('PDF voucher download successfully invoked as placeholder.')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                id="btn_download_receipt_frame"
              >
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
