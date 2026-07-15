/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, Search, Plus, User, Phone, Mail, MapPin, Landmark, Trash2, Edit, X, AlertOctagon 
} from 'lucide-react';
import { Buyer } from '../types';
import { insertBuyer, setBuyers, logAuditEvent } from '../utils/db';

interface BuyersModuleProps {
  buyers: Buyer[];
  onRefresh: () => void;
}

export default function BuyersModule({ buyers, onRefresh }: BuyersModuleProps) {
  const [activeTab, setActiveTab] = useState<'LIST' | 'REGISTER'>('LIST');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Form State
  const [formData, setFormData] = useState({
    COMPANY_NAME: '',
    CONTACT_PERSON: '',
    PHONE: '',
    EMAIL: '',
    ADDRESS: '',
    CREDIT_LIMIT: 250000,
    BALANCE: 0,
    STATUS: 'ACTIVE' as 'ACTIVE' | 'BLACKLISTED' | 'INACTIVE'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editBuyerId, setEditBuyerId] = useState<number | null>(null);

  // Filter buyers
  const filteredBuyers = useMemo(() => {
    return buyers.filter(b => {
      const q = searchQuery.toLowerCase();
      return (
        b.COMPANY_NAME.toLowerCase().includes(q) ||
        b.CONTACT_PERSON.toLowerCase().includes(q) ||
        b.EMAIL.toLowerCase().includes(q) ||
        b.ADDRESS.toLowerCase().includes(q)
      );
    });
  }, [buyers, searchQuery]);

  // Submit Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.COMPANY_NAME.trim() || !formData.CONTACT_PERSON.trim()) {
      alert('Company Name and Contact Person are strictly required by Oracle schema constraints.');
      return;
    }

    insertBuyer({
      ...formData,
      CREDIT_LIMIT: Number(formData.CREDIT_LIMIT),
      BALANCE: Number(formData.BALANCE)
    });

    onRefresh();
    // Reset Form
    setFormData({
      COMPANY_NAME: '',
      CONTACT_PERSON: '',
      PHONE: '',
      EMAIL: '',
      ADDRESS: '',
      CREDIT_LIMIT: 250000,
      BALANCE: 0,
      STATUS: 'ACTIVE'
    });
    setActiveTab('LIST');
  };

  // Set form for edit
  const startEdit = (buyer: Buyer) => {
    setEditBuyerId(buyer.BUYER_ID);
    setFormData({
      COMPANY_NAME: buyer.COMPANY_NAME,
      CONTACT_PERSON: buyer.CONTACT_PERSON,
      PHONE: buyer.PHONE,
      EMAIL: buyer.EMAIL,
      ADDRESS: buyer.ADDRESS,
      CREDIT_LIMIT: buyer.CREDIT_LIMIT,
      BALANCE: buyer.BALANCE,
      STATUS: buyer.STATUS
    });
    setIsEditing(true);
    setActiveTab('REGISTER');
  };

  // Submit Edit
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBuyerId) return;

    const updated = buyers.map(b => {
      if (b.BUYER_ID === editBuyerId) {
        const original = { ...b };
        const updatedObj = {
          ...b,
          COMPANY_NAME: formData.COMPANY_NAME,
          CONTACT_PERSON: formData.CONTACT_PERSON,
          PHONE: formData.PHONE,
          EMAIL: formData.EMAIL,
          ADDRESS: formData.ADDRESS,
          CREDIT_LIMIT: Number(formData.CREDIT_LIMIT),
          BALANCE: Number(formData.BALANCE),
          STATUS: formData.STATUS
        };
        logAuditEvent('UPDATE', 'BUYERS', original, updatedObj);
        return updatedObj;
      }
      return b;
    });

    setBuyers(updated);
    onRefresh();

    // Reset Editing State
    setIsEditing(false);
    setEditBuyerId(null);
    setFormData({
      COMPANY_NAME: '',
      CONTACT_PERSON: '',
      PHONE: '',
      EMAIL: '',
      ADDRESS: '',
      CREDIT_LIMIT: 250000,
      BALANCE: 0,
      STATUS: 'ACTIVE'
    });
    setActiveTab('LIST');
  };

  // Block/Blacklist Buyer
  const handleToggleBlacklist = (buyerId: number) => {
    const buyer = buyers.find(b => b.BUYER_ID === buyerId);
    if (!buyer) return;

    const targetStatus = buyer.STATUS === 'BLACKLISTED' ? 'ACTIVE' : 'BLACKLISTED';
    const msg = `Are you sure you want to change the Oracle status of "${buyer.COMPANY_NAME}" to ${targetStatus}?`;
    
    if (window.confirm(msg)) {
      const original = { ...buyer };
      const updated = buyers.map(b => {
        if (b.BUYER_ID === buyerId) {
          const updatedObj = { ...b, STATUS: targetStatus as any };
          logAuditEvent('UPDATE', 'BUYERS', original, updatedObj);
          return updatedObj;
        }
        return b;
      });
      setBuyers(updated);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6" id="buyers_module_view">
      
      {/* Module Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-emerald-600 h-5 w-5" />
            Wholesale Buyer Registry
          </h2>
          <p className="text-xs text-slate-400 font-sans">Manage bulk buyers, millers, packaging plants, and exporter accounts</p>
        </div>
        <button
          onClick={() => {
            setIsEditing(false);
            setEditBuyerId(null);
            setFormData({
              COMPANY_NAME: '',
              CONTACT_PERSON: '',
              PHONE: '',
              EMAIL: '',
              ADDRESS: '',
              CREDIT_LIMIT: 250000,
              BALANCE: 0,
              STATUS: 'ACTIVE'
            });
            setActiveTab(activeTab === 'LIST' ? 'REGISTER' : 'LIST');
          }}
          className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
          id="btn_toggle_buyer_tab"
        >
          {activeTab === 'LIST' ? (
            <>
              <Plus className="h-4 w-4" /> Register Corporate Buyer
            </>
          ) : (
            'View All Buyers'
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'LIST' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="buyers_list_tab">
          
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search company, contact person, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="input_search_buyers"
              />
            </div>
            <div className="text-xs text-slate-400 sm:ml-auto font-medium">
              Showing {filteredBuyers.length} of {buyers.length} Oracle Buyer records
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="buyers_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Buyer ID</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Contact Agent</th>
                  <th className="py-3 px-4">Address & Phone</th>
                  <th className="py-3 px-4 text-right">Credit Limit</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400 text-xs">
                      No corporate buyer records found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredBuyers.map((b) => (
                    <tr key={b.BUYER_ID} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#BYR-{b.BUYER_ID}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{b.COMPANY_NAME}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-700 text-xs">{b.CONTACT_PERSON}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">{b.EMAIL}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div className="font-medium truncate max-w-xs">{b.ADDRESS}</div>
                        <div className="text-slate-400 font-mono text-[10px]">{b.PHONE}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-xs">
                        KES {b.CREDIT_LIMIT.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono text-xs">
                        <span className={b.BALANCE > b.CREDIT_LIMIT ? 'text-rose-600' : 'text-slate-900'}>
                          KES {b.BALANCE.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          b.STATUS === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.STATUS === 'BLACKLISTED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-slate-50 text-slate-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            b.STATUS === 'ACTIVE' ? 'bg-emerald-500' : b.STATUS === 'BLACKLISTED' ? 'bg-rose-500' : 'bg-slate-400'
                          }`} />
                          {b.STATUS}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => startEdit(b)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-lg transition"
                            title="Edit Buyer Details"
                            id={`btn_edit_buyer_${b.BUYER_ID}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleBlacklist(b.BUYER_ID)}
                            className={`p-1.5 rounded-lg transition ${
                              b.STATUS === 'BLACKLISTED' 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                            }`}
                            title={b.STATUS === 'BLACKLISTED' ? 'Approve Buyer' : 'Blacklist Buyer'}
                            id={`btn_blacklist_buyer_${b.BUYER_ID}`}
                          >
                            <AlertOctagon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Register Form Tab */}
      {activeTab === 'REGISTER' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6" id="buyers_register_tab">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? `Edit Corporate Buyer Profile (#BYR-${editBuyerId})` : 'Register Corporate Wholesale Buyer'}
            </h3>
            <p className="text-xs text-slate-400 font-sans">Creates records in the relational BUYERS table for credit limit allocation and order invoicing</p>
          </div>

          <form onSubmit={isEditing ? handleEdit : handleRegister} className="space-y-4" id="buyer_form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Registered Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Millers Ltd"
                    value={formData.COMPANY_NAME}
                    onChange={(e) => setFormData({ ...formData, COMPANY_NAME: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="byr_company_name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Primary Procurement Agent *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Kamau"
                    value={formData.CONTACT_PERSON}
                    onChange={(e) => setFormData({ ...formData, CONTACT_PERSON: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="byr_contact_person"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Telephone Line *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +254 20 445 9200"
                    value={formData.PHONE}
                    onChange={(e) => setFormData({ ...formData, PHONE: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="byr_phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Official Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. procurement@apex.com"
                    value={formData.EMAIL}
                    onChange={(e) => setFormData({ ...formData, EMAIL: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="byr_email"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Physical Warehouse / Dispatch Address *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Industrial Area, Phase II, Nairobi"
                    value={formData.ADDRESS}
                    onChange={(e) => setFormData({ ...formData, ADDRESS: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="byr_address"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Credit Limit (KES) *</label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500000"
                    value={formData.CREDIT_LIMIT}
                    onChange={(e) => setFormData({ ...formData, CREDIT_LIMIT: Number(e.target.value) })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="byr_credit_limit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status Code *</label>
                <select
                  value={formData.STATUS}
                  onChange={(e) => setFormData({ ...formData, STATUS: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  id="byr_status"
                >
                  <option value="ACTIVE">ACTIVE ORDER DISPATCH PRIVILEGES</option>
                  <option value="BLACKLISTED">BLACKLISTED (BLOCKED FROM DISPATCH)</option>
                  <option value="INACTIVE">INACTIVE PORTAL RECORD</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setActiveTab('LIST');
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                id="btn_cancel_buyer_form"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                id="btn_submit_buyer_form"
              >
                {isEditing ? 'Save Changes' : 'Execute PL/SQL Insert'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
