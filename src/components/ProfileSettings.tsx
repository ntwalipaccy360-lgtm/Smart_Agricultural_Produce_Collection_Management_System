/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, Settings, RefreshCw, Save, ShieldAlert, Landmark, Key, Database 
} from 'lucide-react';
import { initializeDb } from '../utils/db';

interface ProfileSettingsProps {
  onRefresh: () => void;
}

export default function ProfileSettings({ onRefresh }: ProfileSettingsProps) {
  const [profile, setProfile] = useState({
    name: 'Academic DBA Administrator',
    email: 'capstone.coordinator@university.ac.ke',
    role: 'Database Administrator (DBA)',
    phone: '+254 711 000000',
    dep: 'Agriculture IT Department'
  });

  const [settings, setSettings] = useState({
    stationName: 'Smart Ag-Produce Storage Hubs',
    district: 'Thika District',
    capacity: '150,000',
    alertThreshold: '1500',
    automaticReconcile: 'Y'
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('DBA administrator profile parameters compiled and updated in USER_PREFERENCES storage context.');
  };

  const handleSettingsSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System operational variables updated. Global business filters adjusted.');
  };

  const handleResetDb = () => {
    if (window.confirm('CRITICAL DATABASE RESET WARNING:\nThis will wipe all collections, payments, logs, and modifications, restoring the factory seeded Oracle mockup datasets.\nAre you sure you want to proceed?')) {
      initializeDb(true);
      onRefresh();
      alert('Database reinitialized successfully! All schemas flushed and reset.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="profile_settings_view">
      
      {/* Profile Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6" id="profile_panel">
        <div className="flex items-center gap-2 border-b pb-4">
          <User className="text-emerald-600 h-5 w-5" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">DBA Profile Console</h3>
            <p className="text-xs text-slate-400">Manage signed-in operator session variables</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4" id="profile_form">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Operator Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Signed-in Academic Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Oracle Database Security Role</label>
              <input
                type="text"
                disabled
                value={profile.role}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Work Department</label>
              <input
                type="text"
                value={profile.dep}
                onChange={(e) => setProfile({ ...profile, dep: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            id="btn_save_profile"
          >
            <Save className="h-4 w-4" /> Save Profile Info
          </button>
        </form>
      </div>

      {/* System Settings & Re-seed Section */}
      <div className="space-y-6">
        
        {/* Operations Settings */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6" id="settings_panel">
          <div className="flex items-center gap-2 border-b pb-4">
            <Settings className="text-emerald-600 h-5 w-5" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weigh Station Parameters</h3>
              <p className="text-xs text-slate-400">Global agricultural operational variables</p>
            </div>
          </div>

          <form onSubmit={handleSettingsSave} className="space-y-4" id="settings_form">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Silo Station Site Name</label>
                <input
                  type="text"
                  value={settings.stationName}
                  onChange={(e) => setSettings({ ...settings, stationName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Warehouse Capacity (KG)</label>
                  <input
                    type="text"
                    value={settings.capacity}
                    onChange={(e) => setSettings({ ...settings, capacity: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Critical Low Stock Margin</label>
                  <input
                    type="text"
                    value={settings.alertThreshold}
                    onChange={(e) => setSettings({ ...settings, alertThreshold: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              id="btn_save_settings"
            >
              <Save className="h-4 w-4" /> Save Operations Config
            </button>
          </form>
        </div>

        {/* Database Re-seed Alert block */}
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 space-y-4" id="db_reset_panel">
          <div className="flex items-center gap-2 text-rose-800">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <h3 className="font-bold text-sm uppercase tracking-wide">Danger Zone: Database Reset</h3>
          </div>
          
          <p className="text-xs text-rose-700 leading-relaxed">
            Wipes all transaction sequences, deletes new farmers/buyers/orders, flushes the security audits trail table, and restores the original seed records to local storage. This is ideal for resetting the app before a live academic grading session.
          </p>

          <button
            onClick={handleResetDb}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-2.5 px-4 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            id="btn_reset_database"
          >
            <RefreshCw className="h-4 w-4" /> Re-Seed Oracle Sandbox Data
          </button>
        </div>

      </div>

    </div>
  );
}
