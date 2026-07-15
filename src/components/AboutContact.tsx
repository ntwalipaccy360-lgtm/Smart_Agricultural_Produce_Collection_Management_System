/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Info, Mail, User, Sprout, Landmark, Cpu, Database, Send, Sparkles, CheckSquare 
} from 'lucide-react';

export default function AboutContact() {
  const [feedback, setFeedback] = useState({
    name: '',
    email: '',
    msg: '',
    role: 'PROFESSOR'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.name.trim() || !feedback.email.trim() || !feedback.msg.trim()) {
      alert('All fields are required.');
      return;
    }
    setSubmitted(true);
    alert('Thank you! Feedback logged successfully in simulated feedback ledger query.');
  };

  return (
    <div className="space-y-6" id="about_contact_view">
      
      {/* Capstone Info Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase font-mono tracking-wide">
            Oracle Database Programming Capstone
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Smart Agricultural Produce Collection & Management System
          </h2>
          <p className="text-sm text-slate-400">
            A software prototype showing the modern innovation components of a University Oracle Capstone Project
          </p>
        </div>

        {/* Technical Architecture grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          
          <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
            <Cpu className="text-emerald-600 h-5 w-5" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Inventory Triggers</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Auto-computes silo stocks upon Crop Collections or Bulk Dispatch orders. Rejects overselling with transactional rollbacks.
            </p>
          </div>

          <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
            <Landmark className="text-emerald-600 h-5 w-5" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Holiday Blocker</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Prevents recording produce collections during blocked national holidays, raising automated trigger warnings in audit.
            </p>
          </div>

          <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
            <Database className="text-emerald-600 h-5 w-5" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Double Audit Trails</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Captures every single row insertion, update, and deletion, logging precise before-and-after cell states in JSON.
            </p>
          </div>

          <div className="bg-slate-50 border p-4 rounded-2xl space-y-2">
            <Sprout className="text-emerald-600 h-5 w-5" />
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Financial Payouts</h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Triggers cooperative payments automatically after crop weighs, updating corporate credit lines securely.
            </p>
          </div>

        </div>

        {/* Student / Academic Team details */}
        <div className="bg-emerald-900 text-emerald-100 p-6 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <h3 className="font-black text-white text-lg flex items-center gap-2">
              <Sparkles className="text-emerald-300 h-5 w-5" />
              Academic Project Information
            </h3>
            <p className="text-xs leading-relaxed opacity-90 font-medium">
              This system demonstrates advanced PL/SQL programming, relational normalization constraints (3NF), complex compound triggers, auditing sequences, and business intelligence capabilities in Oracle APEX environment.
            </p>
          </div>
          <div className="space-y-1.5 font-mono text-xs text-emerald-200 border-t md:border-t-0 md:border-l border-emerald-800 pt-4 md:pt-0 md:pl-6">
            <p><strong>Lead Student:</strong> Oracle Capstone Group 4A</p>
            <p><strong>Supervisor:</strong> Prof. Agricultural Database Systems</p>
            <p><strong>University:</strong> Department of Computer Science & IT</p>
            <p><strong>Course Code:</strong> CSC-4102: Relational DB Programming</p>
          </div>
        </div>
      </div>

      {/* Feedback/Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Info list */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 border-b pb-3">
            <Mail className="text-emerald-600 h-5 w-5" />
            <h3 className="font-bold text-slate-800 text-sm">Feedback & Evaluation</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Please submit system performance feedback, bugs, or assessment notes. All feedback is logged within simulated Oracle diagnostic ledgers.
          </p>
          <div className="space-y-2 pt-2 text-xs text-slate-600 font-medium">
            <p className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">🏫 Lab Venue:</span> Central Tech Center Lab 2
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">📧 Support:</span> db-capstones@university.ac.ke
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">⌚ Grading Date:</span> July 15, 2026
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="feedback_form_panel">
          <h3 className="font-bold text-slate-900 text-sm">Submit Assessment Feedback</h3>
          
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-emerald-900 text-xs font-semibold animate-fade-in" id="feedback_success_alert">
              <CheckSquare className="h-5 w-5 inline text-emerald-600 mr-2" />
              Feedback submitted successfully! This assessment entry has been saved to simulated oracle database diagnostic traces.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" id="feedback_form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Evaluator Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prof. J. Kamau"
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Institution/Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="evaluator@university.edu"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Assessor Role *</label>
                  <select
                    value={feedback.role}
                    onChange={(e) => setFeedback({ ...feedback, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="PROFESSOR">Course Professor / Grader</option>
                    <option value="EXTERNAL_EXAMINER">External Industry Examiner</option>
                    <option value="STUDENT_PEER">Student Peer Evaluator</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diagnostic Review / Messages *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write grading remarks or evaluation notes..."
                    value={feedback.msg}
                    onChange={(e) => setFeedback({ ...feedback, msg: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 px-5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  id="btn_submit_feedback"
                >
                  <Send className="h-4 w-4" /> Log Assessment row
                </button>
              </div>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
