/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, User, Phone, Mail, FileText, Calendar, MapPin, Award, 
  Trash2, Edit, ChevronRight, X, AlertCircle, RefreshCw, UserCheck, ShieldAlert 
} from 'lucide-react';
import { Farmer } from '../types';
import { insertFarmer, setFarmers, logAuditEvent } from '../utils/db';

interface FarmersModuleProps {
  farmers: Farmer[];
  onRefresh: () => void;
}

export default function FarmersModule({ farmers, onRefresh }: FarmersModuleProps) {
  // Navigation states inside module
  const [activeTab, setActiveTab] = useState<'LIST' | 'REGISTER' | 'PROFILE'>('LIST');
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Registration Form State
  const [formData, setFormData] = useState({
    FIRST_NAME: '',
    LAST_NAME: '',
    PHONE: '',
    EMAIL: '',
    NATIONAL_ID: '',
    REGION: 'Rift Valley',
    COOPERATIVE_NAME: '',
    STATUS: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
  });

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFarmerId, setEditFarmerId] = useState<number | null>(null);

  // Filtered farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter(f => {
      const q = searchQuery.toLowerCase();
      return (
        f.FIRST_NAME.toLowerCase().includes(q) ||
        f.LAST_NAME.toLowerCase().includes(q) ||
        f.NATIONAL_ID.toLowerCase().includes(q) ||
        (f.COOPERATIVE_NAME && f.COOPERATIVE_NAME.toLowerCase().includes(q)) ||
        f.REGION.toLowerCase().includes(q)
      );
    });
  }, [farmers, searchQuery]);

  // Selected profile details
  const selectedFarmer = useMemo(() => {
    if (!selectedFarmerId) return null;
    return farmers.find(f => f.FARMER_ID === selectedFarmerId) || null;
  }, [farmers, selectedFarmerId]);

  // Handle Register Form Submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.FIRST_NAME.trim() || !formData.LAST_NAME.trim() || !formData.NATIONAL_ID.trim()) {
      alert('First Name, Last Name and National ID are strictly required by Oracle constraint definitions.');
      return;
    }

    // Double check UNIQUE NATIONAL_ID constraint
    const idExists = farmers.some(f => f.NATIONAL_ID === formData.NATIONAL_ID);
    if (idExists) {
      alert('ORACLE SQL UNIQUE CONSTRAINT VIOLATION: A farmer with this National ID is already registered in the system.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    insertFarmer({
      ...formData,
      JOIN_DATE: today
    });

    onRefresh();
    // Reset Form
    setFormData({
      FIRST_NAME: '',
      LAST_NAME: '',
      PHONE: '',
      EMAIL: '',
      NATIONAL_ID: '',
      REGION: 'Rift Valley',
      COOPERATIVE_NAME: '',
      STATUS: 'ACTIVE'
    });
    setActiveTab('LIST');
  };

  // Set form for edit
  const startEdit = (farmer: Farmer) => {
    setEditFarmerId(farmer.FARMER_ID);
    setFormData({
      FIRST_NAME: farmer.FIRST_NAME,
      LAST_NAME: farmer.LAST_NAME,
      PHONE: farmer.PHONE,
      EMAIL: farmer.EMAIL || '',
      NATIONAL_ID: farmer.NATIONAL_ID,
      REGION: farmer.REGION,
      COOPERATIVE_NAME: farmer.COOPERATIVE_NAME || '',
      STATUS: farmer.STATUS
    });
    setIsEditing(true);
    setActiveTab('REGISTER');
  };

  // Submit Edit changes
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFarmerId) return;

    // Verify unique National ID on edit
    const idExists = farmers.some(f => f.NATIONAL_ID === formData.NATIONAL_ID && f.FARMER_ID !== editFarmerId);
    if (idExists) {
      alert('ORACLE SQL UNIQUE CONSTRAINT VIOLATION: National ID already registered by another farmer.');
      return;
    }

    const updatedFarmers = farmers.map(f => {
      if (f.FARMER_ID === editFarmerId) {
        const original = { ...f };
        const updated = {
          ...f,
          FIRST_NAME: formData.FIRST_NAME,
          LAST_NAME: formData.LAST_NAME,
          PHONE: formData.PHONE,
          EMAIL: formData.EMAIL,
          NATIONAL_ID: formData.NATIONAL_ID,
          REGION: formData.REGION,
          COOPERATIVE_NAME: formData.COOPERATIVE_NAME,
          STATUS: formData.STATUS
        };
        // Log update action to simulated Oracle Audit
        logAuditEvent('UPDATE', 'FARMERS', original, updated);
        return updated;
      }
      return f;
    });

    setFarmers(updatedFarmers);
    onRefresh();

    // Reset Editing State
    setIsEditing(false);
    setEditFarmerId(null);
    setFormData({
      FIRST_NAME: '',
      LAST_NAME: '',
      PHONE: '',
      EMAIL: '',
      NATIONAL_ID: '',
      REGION: 'Rift Valley',
      COOPERATIVE_NAME: '',
      STATUS: 'ACTIVE'
    });
    setActiveTab('LIST');
  };

  // Delete/Suspend Farmer (soft trigger constraint)
  const handleDelete = (farmerId: number) => {
    const fObj = farmers.find(f => f.FARMER_ID === farmerId);
    if (!fObj) return;

    if (window.confirm(`Are you sure you want to flag farmer #${farmerId} (${fObj.FIRST_NAME} ${fObj.LAST_NAME}) as INACTIVE in Oracle registry?`)) {
      const original = { ...fObj };
      const updatedFarmers = farmers.map(f => {
        if (f.FARMER_ID === farmerId) {
          const updated = { ...f, STATUS: 'INACTIVE' as const };
          logAuditEvent('UPDATE', 'FARMERS', original, updated);
          return updated;
        }
        return f;
      });
      setFarmers(updatedFarmers);
      onRefresh();
    }
  };

  // View profile
  const handleViewProfile = (farmerId: number) => {
    setSelectedFarmerId(farmerId);
    setActiveTab('PROFILE');
  };

  return (
    <div className="space-y-6" id="farmers_module_view">
      
      {/* Module Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="text-emerald-600 h-5 w-5" />
            Farmer Registry Module
          </h2>
          <p className="text-xs text-slate-400">Manage smallholder farmers and cooperative associations</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setIsEditing(false);
              setEditFarmerId(null);
              setFormData({
                FIRST_NAME: '',
                LAST_NAME: '',
                PHONE: '',
                EMAIL: '',
                NATIONAL_ID: '',
                REGION: 'Rift Valley',
                COOPERATIVE_NAME: '',
                STATUS: 'ACTIVE'
              });
              setActiveTab(activeTab === 'LIST' ? 'REGISTER' : 'LIST');
            }}
            className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
            id="btn_toggle_farmer_tab"
          >
            {activeTab === 'LIST' ? (
              <>
                <Plus className="h-4 w-4" /> Register Farmer
              </>
            ) : (
              'View All Farmers'
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'LIST' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="farmers_list_tab">
          
          {/* Search bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search name, region, national ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="input_search_farmers"
              />
            </div>
            <div className="text-xs text-slate-400 sm:ml-auto font-medium">
              Showing {filteredFarmers.length} of {farmers.length} Oracle Farmer schema rows
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="farmers_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Farmer ID</th>
                  <th className="py-3 px-4">Farmer Name</th>
                  <th className="py-3 px-4">National ID</th>
                  <th className="py-3 px-4">Phone / Email</th>
                  <th className="py-3 px-4">Region / Cooperative</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredFarmers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                      No farmer records found matching "{searchQuery}".
                    </td>
                  </tr>
                ) : (
                  filteredFarmers.map((f) => (
                    <tr key={f.FARMER_ID} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#FMR-{f.FARMER_ID}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{f.FIRST_NAME} {f.LAST_NAME}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Joined: {f.JOIN_DATE}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{f.NATIONAL_ID}</td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium text-xs">{f.PHONE}</div>
                        <div className="text-xs text-slate-400">{f.EMAIL || 'No email registered'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium text-xs">{f.REGION}</div>
                        <div className="text-xs text-slate-500">{f.COOPERATIVE_NAME || 'Independent'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          f.STATUS === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700'
                            : f.STATUS === 'SUSPENDED'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            f.STATUS === 'ACTIVE' ? 'bg-emerald-500' : f.STATUS === 'SUSPENDED' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {f.STATUS}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <button
                            onClick={() => handleViewProfile(f.FARMER_ID)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-1.5 rounded-lg transition"
                            title="View Profile Details"
                            id={`btn_view_profile_${f.FARMER_ID}`}
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => startEdit(f)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-lg transition"
                            title="Edit Record"
                            id={`btn_edit_farmer_${f.FARMER_ID}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(f.FARMER_ID)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 rounded-lg transition"
                            title="Mark Inactive"
                            id={`btn_delete_farmer_${f.FARMER_ID}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6" id="farmers_register_tab">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isEditing ? `Edit Farmer Profile (#FMR-${editFarmerId})` : 'Register New Farmer Entity'}
            </h3>
            <p className="text-xs text-slate-400">Validates inputs against strict SQL constraints (e.g. UNIQUE National ID, NOT NULL names)</p>
          </div>

          <form onSubmit={isEditing ? handleEdit : handleRegister} className="space-y-4" id="farmer_form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">First Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Samuel"
                    value={formData.FIRST_NAME}
                    onChange={(e) => setFormData({ ...formData, FIRST_NAME: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="fmr_first_name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Last Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kiprotich"
                    value={formData.LAST_NAME}
                    onChange={(e) => setFormData({ ...formData, LAST_NAME: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="fmr_last_name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">National ID Document Number *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. ID-88493022"
                    value={formData.NATIONAL_ID}
                    onChange={(e) => setFormData({ ...formData, NATIONAL_ID: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="fmr_national_id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Primary Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +254 712 345 678"
                    value={formData.PHONE}
                    onChange={(e) => setFormData({ ...formData, PHONE: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="fmr_phone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="e.g. samuel@coop.com"
                    value={formData.EMAIL}
                    onChange={(e) => setFormData({ ...formData, EMAIL: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="fmr_email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Cooperative Association Name</label>
                <div className="relative">
                  <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Uasin Gishu Grain Coop"
                    value={formData.COOPERATIVE_NAME}
                    onChange={(e) => setFormData({ ...formData, COOPERATIVE_NAME: e.target.value })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="fmr_coop"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Agricultural Region Location</label>
                <select
                  value={formData.REGION}
                  onChange={(e) => setFormData({ ...formData, REGION: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  id="fmr_region"
                >
                  <option value="Rift Valley">Rift Valley Province</option>
                  <option value="Eastern Region">Eastern Region (Drylands)</option>
                  <option value="Nyanza">Nyanza (Lakeside Basins)</option>
                  <option value="Central Highlands">Central Highlands (Aberdares)</option>
                  <option value="Coast Province">Coast Province (Coastal Soils)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Oracle Schema Status *</label>
                <select
                  value={formData.STATUS}
                  onChange={(e) => setFormData({ ...formData, STATUS: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                  id="fmr_status"
                >
                  <option value="ACTIVE">ACTIVE STATUS</option>
                  <option value="SUSPENDED">SUSPENDED STATUS</option>
                  <option value="INACTIVE">INACTIVE STATUS</option>
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
                id="btn_cancel_form"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                id="btn_submit_farmer_form"
              >
                {isEditing ? 'Save Changes' : 'Execute PL/SQL Insert'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Farmer Profile Sheet Tab */}
      {activeTab === 'PROFILE' && selectedFarmer && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in" id="farmers_profile_tab">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Farmer Entity Profile Sheet</h3>
              <p className="text-xs text-slate-400">Relational metadata representing primary keys and connected records</p>
            </div>
            <button
              onClick={() => setActiveTab('LIST')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition cursor-pointer"
              id="btn_close_profile"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Box: Identity */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xl font-bold">
                {selectedFarmer.FIRST_NAME[0]}{selectedFarmer.LAST_NAME[0]}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">{selectedFarmer.FIRST_NAME} {selectedFarmer.LAST_NAME}</h4>
                <span className="text-[10px] font-mono font-bold text-emerald-700">ID: #FMR-{selectedFarmer.FARMER_ID}</span>
              </div>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                selectedFarmer.STATUS === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {selectedFarmer.STATUS}
              </span>
            </div>

            {/* Middle Box: Relational details */}
            <div className="md:col-span-2 space-y-4">
              <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-100 pb-1">Oracle Schema Attributes</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5 text-xs">
                  <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">National Document ID</p>
                    <p className="text-slate-800 font-bold font-mono">{selectedFarmer.NATIONAL_ID}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">Primary Telephone</p>
                    <p className="text-slate-800 font-bold">{selectedFarmer.PHONE}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">Registered Email</p>
                    <p className="text-slate-800 font-bold">{selectedFarmer.EMAIL || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">Regional District</p>
                    <p className="text-slate-800 font-bold">{selectedFarmer.REGION}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Award className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">Cooperative Association</p>
                    <p className="text-slate-800 font-bold">{selectedFarmer.COOPERATIVE_NAME || 'Independent Grower'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-slate-400 font-medium">Database Registration Date</p>
                    <p className="text-slate-800 font-bold font-mono">{selectedFarmer.JOIN_DATE}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Connected collection history summary */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Connected Produce Collections</h5>
            {(() => {
              const connectedColls = JSON.parse(localStorage.getItem('agri_collections') || '[]')
                .filter((c: any) => c.FARMER_ID === selectedFarmer.FARMER_ID);

              if (connectedColls.length === 0) {
                return (
                  <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center border">
                    No active collection transactions linked to this farmer entity.
                  </p>
                );
              }

              return (
                <div className="overflow-x-auto rounded-xl border border-slate-150">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 uppercase font-bold">
                        <th className="p-3">Collection ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Produce Item</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Total Payout</th>
                        <th className="p-3 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {connectedColls.map((c: any) => {
                        const prodList = JSON.parse(localStorage.getItem('agri_produce') || '[]');
                        const prod = prodList.find((p: any) => p.PRODUCE_ID === c.PRODUCE_ID);
                        return (
                          <tr key={c.COLLECTION_ID} className="hover:bg-slate-50/50">
                            <td className="p-3 font-mono font-bold text-slate-800">#COLL-{c.COLLECTION_ID}</td>
                            <td className="p-3">{c.COLLECTION_DATE}</td>
                            <td className="p-3 font-semibold text-slate-700">{prod?.PRODUCE_NAME || `Produce ID: ${c.PRODUCE_ID}`}</td>
                            <td className="p-3 text-right font-semibold">{c.QUANTITY_KG.toLocaleString()} kg</td>
                            <td className="p-3 text-right">KES {c.PRICE_PER_KG}</td>
                            <td className="p-3 text-right font-bold text-slate-900">KES {c.TOTAL_AMOUNT.toLocaleString()}</td>
                            <td className="p-3 text-center"><span className="font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">{c.GRADE}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

        </div>
      )}

    </div>
  );
}
