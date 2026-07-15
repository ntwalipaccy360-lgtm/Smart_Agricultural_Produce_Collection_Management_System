/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, Copy, Terminal, CheckSquare, FileCode, Sparkles 
} from 'lucide-react';
import { ORACLE_SQL_DDL } from '../utils/oracleSql';

type CodeCategory = 'ALL' | 'TABLES' | 'TRIGGERS' | 'SEQUENCES';

export default function OracleSqlHelper() {
  const [activeCategory, setActiveCategory] = useState<CodeCategory>('ALL');
  const [copied, setCopied] = useState(false);

  // Extract sections dynamically for display clarity
  const tableSection = `-- TABLE: PUBLIC_HOLIDAYS
-- TABLE: FARMERS
-- TABLE: BUYERS
-- TABLE: PRODUCE_CATEGORIES
-- TABLE: PRODUCE
-- TABLE: PRODUCE_COLLECTIONS
-- TABLE: INVENTORY
-- TABLE: ORDERS
-- TABLE: PAYMENTS
-- TABLE: AUDIT_LOG`;

  const triggersSection = `-- TRIGGER 1: BI_PRODUCE_COLLECTIONS_CALC
-- TRIGGER 2: AI_PRODUCE_COLLECTIONS_INVENTORY
-- TRIGGER 3: AUDITING TRIGGERS (Automated Oracle Audit Log)`;

  const handleCopy = () => {
    navigator.clipboard.writeText(ORACLE_SQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6" id="oracle_sql_helper_view">
      
      {/* Banner */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="text-emerald-400 h-5 w-5 animate-pulse" />
              Oracle 19c PL/SQL Scripting Console
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Export fully structured Oracle DDL schemas and compound database triggers directly to SQL Developer
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="bg-emerald-600 hover:bg-emerald-700 text-slate-950 px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            id="btn_copy_global_ddl"
          >
            <Copy className="h-4 w-4" />
            {copied ? 'Scripts Copied!' : 'Copy Full SQL Script'}
          </button>
        </div>

        {/* Tab filters */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
          {[
            { id: 'ALL', name: 'Full Compile Script (All SQL)' },
            { id: 'TABLES', name: 'Relational Schemas' },
            { id: 'TRIGGERS', name: 'PL/SQL Automated Triggers' },
            { id: 'SEQUENCES', name: 'Autogen Sequences' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as CodeCategory)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer ${
                activeCategory === tab.id 
                  ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Code Editor View */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden space-y-1">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono font-bold text-slate-300 flex items-center gap-1.5">
            <Terminal className="text-emerald-500 h-4 w-4" /> 
            {activeCategory === 'ALL' && 'oracle_capstone_complete_script.sql'}
            {activeCategory === 'TABLES' && 'oracle_capstone_schemas.sql'}
            {activeCategory === 'TRIGGERS' && 'oracle_capstone_triggers.sql'}
            {activeCategory === 'SEQUENCES' && 'oracle_capstone_sequences.sql'}
          </span>
          <span className="text-[10px] bg-slate-800 border px-2 py-0.5 rounded font-mono text-slate-400">
            ORACLE 19c ENGINE
          </span>
        </div>

        <pre className="p-6 overflow-x-auto text-xs font-mono text-emerald-400/90 leading-relaxed max-h-[70vh] overflow-y-auto whitespace-pre-wrap" id="sql_code_preview_frame">
          {activeCategory === 'ALL' && ORACLE_SQL_DDL}
          {activeCategory === 'TABLES' && (
            `-- Relational Tables Normalized in 3NF\n\n` + 
            ORACLE_SQL_DDL.substring(
              ORACLE_SQL_DDL.indexOf('CREATE TABLE PUBLIC_HOLIDAYS'),
              ORACLE_SQL_DDL.indexOf('CREATE OR REPLACE TRIGGER')
            )
          )}
          {activeCategory === 'TRIGGERS' && (
            `-- Compound Triggers supporting Calculated Columns, Auto-Reconcile, and Auditing\n\n` + 
            ORACLE_SQL_DDL.substring(ORACLE_SQL_DDL.indexOf('CREATE OR REPLACE TRIGGER'))
          )}
          {activeCategory === 'SEQUENCES' && (
            `-- Oracle Primary Key Sequences for Auto-Increment emulation\n\n` + 
            ORACLE_SQL_DDL.substring(
              ORACLE_SQL_DDL.indexOf('CREATE SEQUENCE FARMER_SEQ'),
              ORACLE_SQL_DDL.indexOf('CREATE TABLE PUBLIC_HOLIDAYS')
            )
          )}
        </pre>
      </div>

      {/* Academic helper block */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start gap-4" id="academic_helper_block">
        <Sparkles className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1.5 text-xs">
          <h4 className="font-bold text-slate-900">University Capstone Recommendation</h4>
          <p className="text-slate-500 leading-relaxed">
            Run these scripts inside the <strong className="text-slate-800">SQL Workshop - SQL Commands</strong> area in Oracle APEX. Ensure you execute the sequences block prior to the tables, and compile the trigger bodies last. This replicates the automated reactive business logic running in this frontend prototype.
          </p>
        </div>
      </div>

    </div>
  );
}
