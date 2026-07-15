/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sprout, Lock, User, Eye, EyeOff, ShieldCheck, HelpCircle } from 'lucide-react';
import { setSessionUser, logAuditEvent } from '../utils/db';

interface LoginProps {
  onLoginSuccess: (user: { username: string; role: 'ADMIN' | 'EMPLOYEE' }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    // Authentic mock validation matching credentials mentioned
    const adminMatch = role === 'ADMIN' && username.toLowerCase() === 'admin' && password === 'admin123';
    const employeeMatch = role === 'EMPLOYEE' && username.toLowerCase().startsWith('operator_') && password === 'operator123';

    if (adminMatch) {
      const user = { username: 'admin', role: 'ADMIN' as const };
      setSessionUser(user);
      logAuditEvent('LOGIN', 'USER_SESSIONS', null, { username: 'admin', role: 'ADMIN' });
      onLoginSuccess(user);
    } else if (employeeMatch) {
      const user = { username, role: 'EMPLOYEE' as const };
      setSessionUser(user);
      logAuditEvent('LOGIN', 'USER_SESSIONS', null, { username, role: 'EMPLOYEE' });
      onLoginSuccess(user);
    } else {
      setError('Invalid credentials for selected role. Hint: Admin is admin/admin123; Employee is operator_01/operator123');
      // Auditing failed attempt
      const logs = JSON.parse(localStorage.getItem('agri_audit_logs') || '[]');
      const newLog = {
        LOG_ID: logs.length > 0 ? Math.max(...logs.map((l: any) => l.LOG_ID)) + 1 : 9501,
        USERNAME: username || 'FAILED_GUEST',
        ACTION: 'FAILED_LOGIN' as const,
        ACTION_TIMESTAMP: new Date().toISOString(),
        TABLE_NAME: 'USER_SESSIONS',
        OLD_VALUE: null,
        NEW_VALUE: JSON.stringify({ attempted_username: username, attempted_role: role }),
        IP_ADDRESS: '192.168.1.99'
      };
      localStorage.setItem('agri_audit_logs', JSON.stringify([newLog, ...logs]));
    }
  };

  const handleQuickFill = (selectedRole: 'ADMIN' | 'EMPLOYEE') => {
    setRole(selectedRole);
    if (selectedRole === 'ADMIN') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('operator_01');
      setPassword('operator123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden" id="login_container">
      {/* Decorative top green curve */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 shadow-sm transition hover:scale-105 duration-300">
            <Sprout className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold font-sans tracking-tight text-slate-900">
          Smart Ag-Produce Collection
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-sans">
          Oracle Database Programming Capstone Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-100 rounded-3xl sm:px-10">
          
          {/* Quick-Fill Presets */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Quick Role Seeding
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className={`py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  role === 'ADMIN' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                id="btn_preset_admin"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin (admin123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('EMPLOYEE')}
                className={`py-2 px-3 border rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  role === 'EMPLOYEE' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
                id="btn_preset_employee"
              >
                <User className="h-3.5 w-3.5" />
                Employee (operator123)
              </button>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleLogin} id="login_form">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Sign in as
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EMPLOYEE')}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="select_role"
              >
                <option value="ADMIN">SYSTEM ADMINISTRATOR</option>
                <option value="EMPLOYEE">STATION OPERATOR (EMPLOYEE)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Oracle Account Name / Username
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === 'ADMIN' ? 'admin' : 'operator_01'}
                  className="pl-10 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  id="input_username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Security Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
                  id="input_password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  id="btn_toggle_password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember_me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:outline-none"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  id="btn_forgot_pwd"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm" id="login_error_box">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all cursor-pointer hover:shadow-emerald-100"
                id="btn_submit_login"
              >
                Access Capstone Instance
              </button>
            </div>
          </form>

          {/* Academic Info Banner */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-start gap-2.5 text-xs text-slate-400">
              <HelpCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-600 mb-0.5">Academic Oracle Sandbox</p>
                <p>This prototype simulates real Oracle APEX application interfaces. Modifying records writes back directly to transient local storage tables.</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="forgot_modal">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Password Reset Simulation</h3>
            <p className="text-sm text-slate-500 mb-4">
              In production, Oracle Database APEX uses a workspace user registry. To log in:
            </p>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-6">
              <p className="text-xs text-slate-600"><strong className="text-emerald-700">Administrator:</strong> username <code className="bg-white px-1 py-0.5 rounded border">admin</code> / password <code className="bg-white px-1 py-0.5 rounded border">admin123</code></p>
              <p className="text-xs text-slate-600"><strong className="text-emerald-700">Station Operator:</strong> username <code className="bg-white px-1 py-0.5 rounded border">operator_01</code> / password <code className="bg-white px-1 py-0.5 rounded border">operator123</code></p>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full bg-slate-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-slate-800 transition cursor-pointer"
              id="btn_close_forgot_modal"
            >
              Understand & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
