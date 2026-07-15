/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Sprout, FolderHeart, Plus, Search, Thermometer, Hash, DollarSign, CalendarRange, Edit2, Trash2 
} from 'lucide-react';
import { Produce, ProduceCategory } from '../types';
import { insertCategory, insertProduce, setProduce, setCategories, logAuditEvent } from '../utils/db';

interface ProduceModuleProps {
  categories: ProduceCategory[];
  produce: Produce[];
  onRefresh: () => void;
}

export default function ProduceModule({ categories, produce, onRefresh }: ProduceModuleProps) {
  const [activeTab, setActiveTab] = useState<'PRODUCE' | 'CATEGORIES'>('PRODUCE');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. New Category Form State
  const [catForm, setCatForm] = useState({
    CATEGORY_NAME: '',
    DESCRIPTION: '',
    STORAGE_TEMP_C: 15.0
  });

  // 2. New Produce Form State
  const [prodForm, setProdForm] = useState({
    PRODUCE_NAME: '',
    CATEGORY_ID: 1,
    BASE_PRICE_PER_KG: 50.00,
    SKU: '',
    EXPIRY_DAYS: 30
  });

  const [showCatModal, setShowCatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);

  // Filter produce
  const filteredProduce = useMemo(() => {
    return produce.filter(p => {
      const q = searchQuery.toLowerCase();
      const cat = categories.find(c => c.CATEGORY_ID === p.CATEGORY_ID);
      return (
        p.PRODUCE_NAME.toLowerCase().includes(q) ||
        p.SKU.toLowerCase().includes(q) ||
        (cat && cat.CATEGORY_NAME.toLowerCase().includes(q))
      );
    });
  }, [produce, categories, searchQuery]);

  // Submit Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.CATEGORY_NAME.trim()) {
      alert('Category Name is required.');
      return;
    }

    const exists = categories.some(c => c.CATEGORY_NAME.toLowerCase() === catForm.CATEGORY_NAME.toLowerCase());
    if (exists) {
      alert('ORACLE SQL UNIQUE CONSTRAINT VIOLATION: Category name must be unique.');
      return;
    }

    insertCategory({
      ...catForm,
      STORAGE_TEMP_C: Number(catForm.STORAGE_TEMP_C)
    });

    onRefresh();
    setCatForm({ CATEGORY_NAME: '', DESCRIPTION: '', STORAGE_TEMP_C: 15.0 });
    setShowCatModal(false);
  };

  // Submit Produce
  const handleAddProduce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.PRODUCE_NAME.trim()) {
      alert('Produce Name is required.');
      return;
    }

    const exists = produce.some(p => p.PRODUCE_NAME.toLowerCase() === prodForm.PRODUCE_NAME.toLowerCase());
    if (exists) {
      alert('ORACLE SQL UNIQUE CONSTRAINT VIOLATION: Produce name already exists.');
      return;
    }

    // Auto SKU generation matching pattern: PRD-XXX-YYY-ID
    const cleanName = prodForm.PRODUCE_NAME.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    const skuCode = `PRD-${cleanName}-${Math.floor(Math.random() * 900 + 100)}`;

    insertProduce({
      ...prodForm,
      CATEGORY_ID: Number(prodForm.CATEGORY_ID),
      BASE_PRICE_PER_KG: Number(prodForm.BASE_PRICE_PER_KG),
      SKU: prodForm.SKU.trim() || skuCode,
      EXPIRY_DAYS: Number(prodForm.EXPIRY_DAYS)
    });

    onRefresh();
    setProdForm({
      PRODUCE_NAME: '',
      CATEGORY_ID: categories[0]?.CATEGORY_ID || 1,
      BASE_PRICE_PER_KG: 50.00,
      SKU: '',
      EXPIRY_DAYS: 30
    });
    setShowProdModal(false);
  };

  // Delete Produce (Trigger action)
  const handleDeleteProduce = (produceId: number) => {
    if (window.confirm('Are you sure you want to delete this produce item from the Oracle catalog? This will cascade-delete linked stocks.')) {
      const pObj = produce.find(p => p.PRODUCE_ID === produceId);
      const remaining = produce.filter(p => p.PRODUCE_ID !== produceId);
      setProduce(remaining);
      if (pObj) {
        logAuditEvent('DELETE', 'PRODUCE', pObj, null);
      }
      onRefresh();
    }
  };

  return (
    <div className="space-y-6" id="produce_module_view">
      
      {/* Module Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
            <Sprout className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Crop Catalog & Categories</h2>
            <p className="text-xs text-slate-400 font-sans">Establish categories, base pricing, temperature constraints, and SKUs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('PRODUCE')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'PRODUCE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
            id="tab_active_produce"
          >
            Produce Items ({produce.length})
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'CATEGORIES' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
            }`}
            id="tab_active_categories"
          >
            Oracle Food Categories ({categories.length})
          </button>
        </div>
      </div>

      {activeTab === 'PRODUCE' ? (
        <div className="space-y-4" id="produce_section">
          {/* Produce List Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search produce, category, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                id="search_produce_catalog"
              />
            </div>
            <button
              onClick={() => {
                if (categories.length === 0) {
                  alert('Please register at least one food category before cataloging produce.');
                  return;
                }
                setProdForm(f => ({ ...f, CATEGORY_ID: categories[0].CATEGORY_ID }));
                setShowProdModal(true);
              }}
              className="w-full sm:w-auto bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              id="btn_open_prod_modal"
            >
              <Plus className="h-4 w-4" /> Add Produce Catalog Item
            </button>
          </div>

          {/* Grid Layout of Produce items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="produce_catalog_grid">
            {filteredProduce.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-100 text-slate-400 text-xs">
                No crops cataloged matching "{searchQuery}".
              </div>
            ) : (
              filteredProduce.map(p => {
                const cat = categories.find(c => c.CATEGORY_ID === p.CATEGORY_ID);
                return (
                  <div key={p.PRODUCE_ID} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {cat?.CATEGORY_NAME || 'General Crops'}
                        </span>
                        <button
                          onClick={() => handleDeleteProduce(p.PRODUCE_ID)}
                          className="text-slate-300 hover:text-rose-600 p-1 rounded transition"
                          title="Delete crops"
                          id={`btn_delete_crop_${p.PRODUCE_ID}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">{p.PRODUCE_NAME}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-slate-50">
                        <div>
                          <p className="text-slate-400 font-medium">SKU Oracle ID</p>
                          <p className="font-mono text-slate-800 font-bold text-[11px]">{p.SKU}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 font-medium">Storage Limits</p>
                          <p className="font-semibold text-slate-800 flex items-center gap-0.5">
                            <Thermometer className="h-3.5 w-3.5 text-blue-500" />
                            {cat?.STORAGE_TEMP_C || '15'}°C Room
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-semibold">Standard Base Price</span>
                        <span className="text-emerald-700 font-bold font-mono text-sm">KES {p.BASE_PRICE_PER_KG} / kg</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 block uppercase font-mono">
                        Expires: {p.EXPIRY_DAYS} Days
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4" id="categories_section">
          {/* Categories Controls */}
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-base">Relational Categories Table</h3>
            <button
              onClick={() => setShowCatModal(true)}
              className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 cursor-pointer"
              id="btn_open_cat_modal"
            >
              <Plus className="h-4 w-4" /> Create Category Group
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden" id="categories_table_container">
            <table className="w-full text-left border-collapse" id="categories_table">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 text-xs font-bold uppercase tracking-wider bg-slate-50/30">
                  <th className="py-3 px-4">Category ID</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Product Shelf Description</th>
                  <th className="py-3 px-4 text-center">Cold Storage Temperature</th>
                  <th className="py-3 px-4 text-center">Linked Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {categories.map(c => {
                  const linkedCount = produce.filter(p => p.CATEGORY_ID === c.CATEGORY_ID).length;
                  return (
                    <tr key={c.CATEGORY_ID} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">#CAT-{c.CATEGORY_ID}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{c.CATEGORY_NAME}</td>
                      <td className="py-3.5 px-4 text-slate-600 text-xs max-w-sm truncate">{c.DESCRIPTION || 'No description listed'}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-mono">
                          <Thermometer className="h-3 w-3" /> {c.STORAGE_TEMP_C}°C
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 font-mono">
                        {linkedCount} items
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 1. Modal: Category Insertion */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="category_modal">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Category Registration</h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>
            
            <form onSubmit={handleAddCategory} className="space-y-4" id="category_insert_form">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Horticultural Fruits"
                  value={catForm.CATEGORY_NAME}
                  onChange={(e) => setCatForm({ ...catForm, CATEGORY_NAME: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  id="cat_name_input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Storage Condition temp (Celsius) *</label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 6.5"
                    value={catForm.STORAGE_TEMP_C}
                    onChange={(e) => setCatForm({ ...catForm, STORAGE_TEMP_C: Number(e.target.value) })}
                    className="pl-9 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    id="cat_temp_input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  placeholder="Staples, roots, perishable or sensitive..."
                  value={catForm.DESCRIPTION}
                  onChange={(e) => setCatForm({ ...catForm, DESCRIPTION: e.target.value })}
                  className="w-full h-20 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  id="cat_desc_input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_close_cat_form"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_submit_cat_form"
                >
                  Execute Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Produce Insertion */}
      {showProdModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="produce_modal">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Produce Catalogue Entry</h3>
              <button onClick={() => setShowProdModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>
            
            <form onSubmit={handleAddProduce} className="space-y-4" id="produce_insert_form">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Produce/Crop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Rosecoco Beans"
                  value={prodForm.PRODUCE_NAME}
                  onChange={(e) => setProdForm({ ...prodForm, PRODUCE_NAME: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  id="prod_name_input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Food Category Group *</label>
                  <select
                    value={prodForm.CATEGORY_ID}
                    onChange={(e) => setProdForm({ ...prodForm, CATEGORY_ID: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    id="prod_cat_input"
                  >
                    {categories.map(c => (
                      <option key={c.CATEGORY_ID} value={c.CATEGORY_ID}>{c.CATEGORY_NAME}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Base Price per KG (KES) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      required
                      placeholder="e.g. 85"
                      value={prodForm.BASE_PRICE_PER_KG}
                      onChange={(e) => setProdForm({ ...prodForm, BASE_PRICE_PER_KG: Number(e.target.value) })}
                      className="pl-8 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      id="prod_price_input"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">SKU Oracle ID (or Auto)</label>
                  <div className="relative">
                    <Hash className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="PRD-MAZ-WHT-01"
                      value={prodForm.SKU}
                      onChange={(e) => setProdForm({ ...prodForm, SKU: e.target.value })}
                      className="pl-8 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase"
                      id="prod_sku_input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Crops Shelf Expiry (Days) *</label>
                  <div className="relative">
                    <CalendarRange className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="number"
                      required
                      placeholder="365"
                      value={prodForm.EXPIRY_DAYS}
                      onChange={(e) => setProdForm({ ...prodForm, EXPIRY_DAYS: Number(e.target.value) })}
                      className="pl-8 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      id="prod_expiry_input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProdModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_close_prod_form"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer"
                  id="btn_submit_prod_form"
                >
                  Execute Insert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
