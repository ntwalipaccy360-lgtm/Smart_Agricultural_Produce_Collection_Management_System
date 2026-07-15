/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Search, Clock, User, Terminal, Database, ArrowRight, ShieldAlert 
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditModuleProps {
  logs: AuditLog[];
  onRefresh: () => void;
}

export default function AuditModule({ logs, onRefresh }: AuditModuleProps) {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'LOGIN' | 'MUTATION'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      // 1. Filter by category
      if (activeFilter === 'LOGIN' && !['LOGIN', 'FAILED_LOGIN'].includes(l.ACTION)) return false;
      if (activeFilter === 'MUTATION' && ['LOGIN', 'FAILED_LOGIN'].includes(l.ACTION)) return false;

      // 2. Search query
      const q = searchQuery.toLowerCase();
      return (
        l.USERNAME.toLowerCase().includes(q) ||
        l.TABLE_NAME.toLowerCase().includes(q) ||
        l.ACTION.toLowerCase().includes(q) ||
        l.LOG_ID.toString().includes(q)
      );
    });
  }, [logs, activeFilter, searchQuery]);

  const selectedLog = useMemo(() => {
    if (!selectedLogId) return null;
    return logs.find(l => l.LOG_ID === selectedLogId) || null;
  }, [logs, selectedLogId]);

  return (
    <div className="space-y-6" id="audit_module_view">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600 h-5 w-5" />
            Oracle DB Security Audit Trail
          </h2>
          <p className="text-xs text-slate-400 font-sans">View auditable system transactions, security login logs, and auditable row values from table triggers</p>
        </div>
        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeFilter === 'ALL' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => setActiveFilter('LOGIN')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeFilter === 'LOGIN' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Logins ({logs.filter(l => ['LOGIN', 'FAILED_LOGIN'].includes(l.ACTION)).length})
          </button>
          <button
            onClick={() => setActiveFilter('MUTATION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeFilter === 'MUTATION' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            DML Triggers ({logs.filter(l => !['LOGIN', 'FAILED_LOGIN'].includes(l.ACTION)).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Table Grid of Logs */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="audit_logs_grid_box">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search audit actions, tables, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="search_audit_input"
              />
            </div>
            <span className="text-xs text-slate-400 font-bold font-mono uppercase">
              Table: AUDIT_LOG
            </span>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
            <table className="w-full text-left border-collapse" id="audit_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30 sticky top-0 bg-white z-10">
                  <th className="py-3 px-4">Log ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Relation Table</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 font-sans">
                      No security audit events recorded.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(l => {
                    const isFailure = l.ACTION === 'FAILED_LOGIN';
                    return (
                      <tr 
                        key={l.LOG_ID} 
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedLogId === l.LOG_ID ? 'bg-emerald-50/40' : ''
                        }`}
                        onClick={() => setSelectedLogId(l.LOG_ID)}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-600">#AUD-{l.LOG_ID}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" />
                            {l.USERNAME}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 font-bold font-mono px-2 py-0.5 rounded ${
                            l.ACTION === 'INSERT' 
                              ? 'bg-emerald-50 text-emerald-800' 
                              : l.ACTION === 'UPDATE'
                              ? 'bg-blue-50 text-blue-800'
                              : l.ACTION === 'DELETE'
                              ? 'bg-rose-50 text-rose-800 font-extrabold'
                              : isFailure
                              ? 'bg-red-100 text-red-800 animate-pulse border border-red-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}>
                            {l.ACTION}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600 uppercase font-semibold">{l.TABLE_NAME}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{l.ACTION_TIMESTAMP.replace('T', ' ').substring(0, 19)}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-600">Inspect</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Audit Details Inspection Panel */}
        <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between" id="audit_details_panel">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Terminal className="text-emerald-500 h-5 w-5" />
              <div>
                <h3 className="font-bold text-white text-sm">Security Log Examiner</h3>
                <p className="text-[10px] text-slate-400 font-mono">SYS_CONTEXT(USERENV, SESSION_USER)</p>
              </div>
            </div>

            {selectedLog ? (
              <div className="space-y-4 text-xs font-mono" id="audit_log_details">
                <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <p className="text-[10px] text-slate-500">SESSION IDENTIFIER</p>
                  <p className="font-bold text-emerald-400">Log Row ID: #AUD-{selectedLog.LOG_ID}</p>
                  <p className="text-slate-300">Action: {selectedLog.ACTION}</p>
                  <p className="text-slate-300">Auditable Table: {selectedLog.TABLE_NAME}</p>
                  <p className="text-slate-300">System Source IP: {selectedLog.IP_ADDRESS}</p>
                </div>

                {/* Old Value JSON Block */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Old Value (Before Trigger)</p>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 whitespace-pre-wrap overflow-x-auto max-h-32">
                    {selectedLog.OLD_VALUE ? JSON.stringify(JSON.parse(selectedLog.OLD_VALUE), null, 2) : 'NULL (Record Inserted)'}
                  </pre>
                </div>

                {/* New Value JSON Block */}
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">New Value (After Trigger)</p>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] text-emerald-300 whitespace-pre-wrap overflow-x-auto max-h-32">
                    {selectedLog.NEW_VALUE ? JSON.stringify(JSON.parse(selectedLog.NEW_VALUE), null, 2) : 'NULL (Record Deleted)'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 space-y-2">
                <Database className="h-10 w-10 text-slate-700 mx-auto" />
                <p className="text-slate-400 text-xs font-semibold">Select a log from the audit trail table to inspect relational cell modifications.</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-3">
            Oracle Autonomous Database audits are cryptographically signed. Local mutations cannot be cleared or rewritten.
          </div>

        </div>

      </div>

    </div>
  );
}
