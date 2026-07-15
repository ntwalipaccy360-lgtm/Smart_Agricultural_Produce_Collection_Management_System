/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Menu, X, LayoutDashboard, UserCheck, Users, Sprout, Scale, Database, ShoppingBag, 
  Landmark, FileText, ShieldCheck, Calendar, FileCode, Settings, Info, LogOut, ChevronRight, GraduationCap 
} from 'lucide-react';

// Import Database Utilities
import { loadDatabase, initializeDb, getCurrentUser, logoutUser } from './utils/db';
import { Farmer, Buyer, Produce, ProduceCollection, Inventory, Order, Payment, AuditLog, PublicHoliday } from './types';

// Import Custom Module Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FarmersModule from './components/FarmersModule';
import BuyersModule from './components/BuyersModule';
import ProduceModule from './components/ProduceModule';
import CollectionsModule from './components/CollectionsModule';
import InventoryModule from './components/InventoryModule';
import OrdersModule from './components/OrdersModule';
import PaymentsModule from './components/PaymentsModule';
import ReportsModule from './components/ReportsModule';
import AuditModule from './components/AuditModule';
import HolidaysModule from './components/HolidaysModule';
import OracleSqlHelper from './components/OracleSqlHelper';
import ProfileSettings from './components/ProfileSettings';
import AboutContact from './components/AboutContact';

type ActiveModule = 
  | 'DASHBOARD' | 'FARMERS' | 'BUYERS' | 'PRODUCE' | 'COLLECTIONS' 
  | 'INVENTORY' | 'ORDERS' | 'PAYMENTS' | 'REPORTS' | 'AUDIT' 
  | 'HOLIDAYS' | 'SQL_HELPER' | 'SETTINGS' | 'ABOUT';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<ActiveModule>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Database states
  const [dbState, setDbState] = useState<{
    farmers: Farmer[];
    buyers: Buyer[];
    produce: Produce[];
    collections: ProduceCollection[];
    inventory: Inventory[];
    orders: Order[];
    payments: Payment[];
    logs: AuditLog[];
    holidays: PublicHoliday[];
  } | null>(null);

  // Initialize and load database on mount
  useEffect(() => {
    initializeDb(); // Seeds default values if not exists
    refreshData();
    checkAuth();
  }, []);

  const refreshData = () => {
    const data = loadDatabase();
    setDbState(data);
  };

  const checkAuth = () => {
    const user = getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setCurrentUser(user);
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const handleLogout = () => {
    logoutUser();
    checkAuth();
    setActiveModule('DASHBOARD');
  };

  const handleLoginSuccess = () => {
    checkAuth();
    refreshData();
  };

  // Nav Links setup
  const navItems = [
    { id: 'DASHBOARD', name: 'Analytic Dashboard', icon: LayoutDashboard },
    { id: 'FARMERS', name: 'Cooperative Farmers', icon: Users },
    { id: 'BUYERS', name: 'Corporate Buyers', icon: UserCheck },
    { id: 'PRODUCE', name: 'Produce Catalog', icon: Sprout },
    { id: 'COLLECTIONS', name: 'Intake Weigh Station', icon: Scale },
    { id: 'INVENTORY', name: 'Silo Storage Inventory', icon: Database },
    { id: 'ORDERS', name: 'Wholesale Dispatches', icon: ShoppingBag },
    { id: 'PAYMENTS', name: 'Financial Settlements', icon: Landmark },
    { id: 'REPORTS', name: 'BI Reports', icon: FileText },
    { id: 'AUDIT', name: 'Security Audit Trail', icon: ShieldCheck },
    { id: 'HOLIDAYS', name: 'Holiday Scheduler', icon: Calendar },
    { id: 'SQL_HELPER', name: 'Oracle Scripting Hub', icon: FileCode },
    { id: 'SETTINGS', name: 'Profile & Settings', icon: Settings },
    { id: 'ABOUT', name: 'About Capstone', icon: Info },
  ];

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800" id="main_app_container">
      
      {/* Mobile Top bar */}
      <header className="md:hidden bg-emerald-950 text-white flex items-center justify-between p-4 border-b border-emerald-900 z-30 sticky top-0 shadow-md" id="mobile_header">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-400" />
          <div>
            <h1 className="text-sm font-black tracking-wide uppercase">Smart Ag-Hub</h1>
            <p className="text-[9px] text-emerald-300 tracking-wider">ORACLE DB CAPSTONE</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1 text-emerald-100 hover:text-white"
          id="btn_mobile_menu_toggle"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside 
        className={`fixed md:sticky top-0 left-0 bottom-0 w-64 bg-emerald-950 text-emerald-100 border-r border-emerald-900 flex flex-col justify-between z-40 transition-all duration-300 md:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        id="app_sidebar"
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          
          {/* Logo brand */}
          <div className="p-6 border-b border-emerald-900 flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-emerald-400 shrink-0" />
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase leading-tight">Smart Ag-Hub</h1>
              <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider font-mono">Oracle Prototype</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1" id="sidebar_nav">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id as ActiveModule);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-sm font-bold shadow-emerald-700/50 scale-102' 
                      : 'hover:bg-emerald-900 text-emerald-200 hover:text-white'
                  }`}
                  id={`nav_btn_${item.id}`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white animate-pulse' : 'text-emerald-400'}`} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User context footer */}
        <div className="p-4 border-t border-emerald-900 bg-emerald-950/50 space-y-3" id="sidebar_footer">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-800 text-emerald-100 font-black p-2 rounded-xl text-xs font-mono border border-emerald-700">
              DBA
            </div>
            <div className="truncate text-xs">
              <p className="font-bold text-white leading-none">{currentUser || 'Database Admin'}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-mono">Oracle Standard Privileges</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-emerald-900/40 hover:bg-rose-950/40 border border-emerald-800 hover:border-rose-900 text-emerald-300 hover:text-rose-200 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition cursor-pointer"
            id="btn_logout_sidebar"
          >
            <LogOut className="h-3.5 w-3.5" /> Logout Session
          </button>
        </div>

      </aside>

      {/* Background shadow for mobile slide-out menu */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-30 md:hidden"
          id="mobile_menu_backdrop"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6 overflow-x-hidden" id="main_content_body">
        
        {/* Dynamic State Verification Loader */}
        {dbState ? (
          <>
            {activeModule === 'DASHBOARD' && (
              <Dashboard 
                farmers={dbState.farmers} 
                buyers={dbState.buyers} 
                collections={dbState.collections} 
                inventory={dbState.inventory} 
                orders={dbState.orders} 
                payments={dbState.payments} 
                onNavigate={setActiveModule}
              />
            )}
            
            {activeModule === 'FARMERS' && (
              <FarmersModule 
                farmers={dbState.farmers} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'BUYERS' && (
              <BuyersModule 
                buyers={dbState.buyers} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'PRODUCE' && (
              <ProduceModule 
                categories={dbState.categories}
                produce={dbState.produce} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'COLLECTIONS' && (
              <CollectionsModule 
                farmers={dbState.farmers} 
                produce={dbState.produce} 
                collections={dbState.collections} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'INVENTORY' && (
              <InventoryModule 
                inventory={dbState.inventory} 
                produce={dbState.produce} 
                collections={dbState.collections} 
                orders={dbState.orders} 
              />
            )}

            {activeModule === 'ORDERS' && (
              <OrdersModule 
                orders={dbState.orders} 
                buyers={dbState.buyers} 
                produce={dbState.produce} 
                inventory={dbState.inventory} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'PAYMENTS' && (
              <PaymentsModule 
                payments={dbState.payments} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'REPORTS' && (
              <ReportsModule 
                farmers={dbState.farmers} 
                buyers={dbState.buyers} 
                produce={dbState.produce} 
                collections={dbState.collections} 
                inventory={dbState.inventory} 
                orders={dbState.orders} 
                payments={dbState.payments} 
              />
            )}

            {activeModule === 'AUDIT' && (
              <AuditModule 
                logs={dbState.logs} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'HOLIDAYS' && (
              <HolidaysModule 
                holidays={dbState.holidays} 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'SQL_HELPER' && (
              <OracleSqlHelper />
            )}

            {activeModule === 'SETTINGS' && (
              <ProfileSettings 
                onRefresh={refreshData} 
              />
            )}

            {activeModule === 'ABOUT' && (
              <AboutContact />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Database className="h-12 w-12 text-emerald-600 animate-spin" />
            <p className="text-sm text-slate-400 font-semibold font-mono uppercase tracking-widest">
              Connecting to simulated Oracle session...
            </p>
          </div>
        )}

      </main>

    </div>
  );
}
