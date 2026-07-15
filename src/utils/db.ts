/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Farmer, Buyer, ProduceCategory, Produce, ProduceCollection, Inventory, Order, Payment, PublicHoliday, AuditLog } from '../types';
import { 
  INITIAL_FARMERS, 
  INITIAL_BUYERS, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCE, 
  INITIAL_COLLECTIONS, 
  INITIAL_INVENTORY, 
  INITIAL_ORDERS, 
  INITIAL_PAYMENTS, 
  INITIAL_HOLIDAYS, 
  INITIAL_AUDIT_LOGS 
} from './sampleData';

// Storage Keys
const KEYS = {
  FARMERS: 'agri_farmers',
  BUYERS: 'agri_buyers',
  CATEGORIES: 'agri_categories',
  PRODUCE: 'agri_produce',
  COLLECTIONS: 'agri_collections',
  INVENTORY: 'agri_inventory',
  ORDERS: 'agri_orders',
  PAYMENTS: 'agri_payments',
  HOLIDAYS: 'agri_holidays',
  AUDIT_LOGS: 'agri_audit_logs',
  SESSION_USER: 'agri_session_user'
};

// Initialize helper
export function initLocalStorageDB() {
  if (!localStorage.getItem(KEYS.FARMERS)) localStorage.setItem(KEYS.FARMERS, JSON.stringify(INITIAL_FARMERS));
  if (!localStorage.getItem(KEYS.BUYERS)) localStorage.setItem(KEYS.BUYERS, JSON.stringify(INITIAL_BUYERS));
  if (!localStorage.getItem(KEYS.CATEGORIES)) localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  if (!localStorage.getItem(KEYS.PRODUCE)) localStorage.setItem(KEYS.PRODUCE, JSON.stringify(INITIAL_PRODUCE));
  if (!localStorage.getItem(KEYS.COLLECTIONS)) localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(INITIAL_COLLECTIONS));
  if (!localStorage.getItem(KEYS.INVENTORY)) localStorage.setItem(KEYS.INVENTORY, JSON.stringify(INITIAL_INVENTORY));
  if (!localStorage.getItem(KEYS.ORDERS)) localStorage.setItem(KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
  if (!localStorage.getItem(KEYS.PAYMENTS)) localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  if (!localStorage.getItem(KEYS.HOLIDAYS)) localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(INITIAL_HOLIDAYS));
  if (!localStorage.getItem(KEYS.AUDIT_LOGS)) localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
}

// Getters
export function getFarmers(): Farmer[] { return JSON.parse(localStorage.getItem(KEYS.FARMERS) || '[]'); }
export function getBuyers(): Buyer[] { return JSON.parse(localStorage.getItem(KEYS.BUYERS) || '[]'); }
export function getCategories(): ProduceCategory[] { return JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]'); }
export function getProduce(): Produce[] { return JSON.parse(localStorage.getItem(KEYS.PRODUCE) || '[]'); }
export function getCollections(): ProduceCollection[] { return JSON.parse(localStorage.getItem(KEYS.COLLECTIONS) || '[]'); }
export function getInventory(): Inventory[] { return JSON.parse(localStorage.getItem(KEYS.INVENTORY) || '[]'); }
export function getOrders(): Order[] { return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]'); }
export function getPayments(): Payment[] { return JSON.parse(localStorage.getItem(KEYS.PAYMENTS) || '[]'); }
export function getHolidays(): PublicHoliday[] { return JSON.parse(localStorage.getItem(KEYS.HOLIDAYS) || '[]'); }
export function getAuditLogs(): AuditLog[] { return JSON.parse(localStorage.getItem(KEYS.AUDIT_LOGS) || '[]'); }
export function getSessionUser(): { username: string; role: 'ADMIN' | 'EMPLOYEE' } | null {
  const data = localStorage.getItem(KEYS.SESSION_USER);
  return data ? JSON.parse(data) : null;
}

// Setters (direct write - use with caution, triggers are bypassed!)
export function setFarmers(data: Farmer[]) { localStorage.setItem(KEYS.FARMERS, JSON.stringify(data)); }
export function setBuyers(data: Buyer[]) { localStorage.setItem(KEYS.BUYERS, JSON.stringify(data)); }
export function setCategories(data: ProduceCategory[]) { localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(data)); }
export function setProduce(data: Produce[]) { localStorage.setItem(KEYS.PRODUCE, JSON.stringify(data)); }
export function setCollections(data: ProduceCollection[]) { localStorage.setItem(KEYS.COLLECTIONS, JSON.stringify(data)); }
export function setInventory(data: Inventory[]) { localStorage.setItem(KEYS.INVENTORY, JSON.stringify(data)); }
export function setOrders(data: Order[]) { localStorage.setItem(KEYS.ORDERS, JSON.stringify(data)); }
export function setPayments(data: Payment[]) { localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(data)); }
export function setHolidays(data: PublicHoliday[]) { localStorage.setItem(KEYS.HOLIDAYS, JSON.stringify(data)); }
export function setAuditLogs(data: AuditLog[]) { localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(data)); }
export function setSessionUser(user: { username: string; role: 'ADMIN' | 'EMPLOYEE' } | null) {
  if (user) localStorage.setItem(KEYS.SESSION_USER, JSON.stringify(user));
  else localStorage.removeItem(KEYS.SESSION_USER);
}

// Log an action to simulated Audit Table
export function logAuditEvent(action: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'FAILED_LOGIN', tableName: string, oldValue: any, newValue: any) {
  const logs = getAuditLogs();
  const session = getSessionUser();
  const newLog: AuditLog = {
    LOG_ID: logs.length > 0 ? Math.max(...logs.map(l => l.LOG_ID)) + 1 : 9501,
    USERNAME: session?.username || 'GUEST_SYS',
    ACTION: action,
    ACTION_TIMESTAMP: new Date().toISOString(),
    TABLE_NAME: tableName,
    OLD_VALUE: oldValue ? JSON.stringify(oldValue) : null,
    NEW_VALUE: newValue ? JSON.stringify(newValue) : null,
    IP_ADDRESS: '192.168.1.55' // Simulated container runtime IP
  };
  setAuditLogs([newLog, ...logs]);
}

// ==========================================
// ADVANCED ORACLE TRIGGER SIMULATION ACTIONS
// ==========================================

/**
 * simulated Trigger: BI_PRODUCE_COLLECTIONS_CALC & AI_PRODUCE_COLLECTIONS_INVENTORY
 * Executes pre-insert validations and post-insert inventory & payment automations.
 */
export function insertProduceCollection(collectionData: Omit<ProduceCollection, 'COLLECTION_ID' | 'TOTAL_AMOUNT' | 'HOLIDAY_CHECK' | 'CREATED_BY'>): { success: boolean; error?: string; collection?: ProduceCollection } {
  // 1. Check Public Holidays
  const holidays = getHolidays();
  const collectionDateStr = collectionData.COLLECTION_DATE; // 'YYYY-MM-DD'
  const matchingHoliday = holidays.find(h => h.HOLIDAY_DATE === collectionDateStr);
  
  let holidayCheck: 'PASSED' | 'WARNING' = 'PASSED';
  if (matchingHoliday && matchingHoliday.IS_COLLECTION_BLOCKED === 'Y') {
    holidayCheck = 'WARNING';
    // Throw a soft error or caution. Let's support creating but flag warning (same as Trigger)
  }

  const collections = getCollections();
  const nextId = collections.length > 0 ? Math.max(...collections.map(c => c.COLLECTION_ID)) + 1 : 5001;
  const totalAmount = collectionData.QUANTITY_KG * collectionData.PRICE_PER_KG;
  const session = getSessionUser();

  const newCollection: ProduceCollection = {
    ...collectionData,
    COLLECTION_ID: nextId,
    TOTAL_AMOUNT: totalAmount,
    HOLIDAY_CHECK: holidayCheck,
    CREATED_BY: session?.username || 'admin'
  };

  // Save collection
  setCollections([newCollection, ...collections]);

  // TRIGGER EFFECT 1: Update INVENTORY stocklevels
  const inventoryList = getInventory();
  const existingInv = inventoryList.find(i => i.PRODUCE_ID === collectionData.PRODUCE_ID);
  
  if (existingInv) {
    existingInv.STOCK_ON_HAND += collectionData.QUANTITY_KG;
    existingInv.AVAILABLE_STOCK = existingInv.STOCK_ON_HAND - existingInv.RESERVED_STOCK;
    existingInv.LAST_UPDATED = new Date().toISOString();
  } else {
    const nextInvId = inventoryList.length > 0 ? Math.max(...inventoryList.map(i => i.INVENTORY_ID)) + 1 : 6001;
    const newInv: Inventory = {
      INVENTORY_ID: nextInvId,
      PRODUCE_ID: collectionData.PRODUCE_ID,
      STOCK_ON_HAND: collectionData.QUANTITY_KG,
      RESERVED_STOCK: 0,
      AVAILABLE_STOCK: collectionData.QUANTITY_KG,
      LOCATION_BAY: 'BAY-' + Math.floor(Math.random() * 5 + 1) + 'A',
      LAST_UPDATED: new Date().toISOString()
    };
    inventoryList.push(newInv);
  }
  setInventory(inventoryList);

  // TRIGGER EFFECT 2: Generate PENDING Payment to the Farmer
  const payments = getPayments();
  const nextPayId = payments.length > 0 ? Math.max(...payments.map(p => p.PAYMENT_ID)) + 1 : 8001;
  const newPayment: Payment = {
    PAYMENT_ID: nextPayId,
    SOURCE_TYPE: 'COLLECTION',
    SOURCE_ID: nextId,
    PAYMENT_DATE: collectionDateStr,
    AMOUNT: totalAmount,
    PAYMENT_METHOD: 'BANK_TRANSFER',
    TRANSACTION_REFERENCE: `TXN-BK-AUTO-${nextId}`,
    STATUS: 'PENDING'
  };
  setPayments([newPayment, ...payments]);

  // TRIGGER EFFECT 3: Log Oracle Audit Event
  logAuditEvent('INSERT', 'PRODUCE_COLLECTIONS', null, newCollection);

  return { success: true, collection: newCollection };
}

/**
 * Register a Farmer
 */
export function insertFarmer(farmerData: Omit<Farmer, 'FARMER_ID'>): Farmer {
  const farmers = getFarmers();
  const nextId = farmers.length > 0 ? Math.max(...farmers.map(f => f.FARMER_ID)) + 1 : 1001;
  const newFarmer: Farmer = {
    ...farmerData,
    FARMER_ID: nextId
  };
  setFarmers([...farmers, newFarmer]);
  logAuditEvent('INSERT', 'FARMERS', null, newFarmer);
  return newFarmer;
}

/**
 * Register a Buyer
 */
export function insertBuyer(buyerData: Omit<Buyer, 'BUYER_ID'>): Buyer {
  const buyers = getBuyers();
  const nextId = buyers.length > 0 ? Math.max(...buyers.map(b => b.BUYER_ID)) + 1 : 2001;
  const newBuyer: Buyer = {
    ...buyerData,
    BUYER_ID: nextId
  };
  setBuyers([...buyers, newBuyer]);
  logAuditEvent('INSERT', 'BUYERS', null, newBuyer);
  return newBuyer;
}

/**
 * Register a Category
 */
export function insertCategory(categoryData: Omit<ProduceCategory, 'CATEGORY_ID'>): ProduceCategory {
  const categories = getCategories();
  const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.CATEGORY_ID)) + 1 : 1;
  const newCategory: ProduceCategory = {
    ...categoryData,
    CATEGORY_ID: nextId
  };
  setCategories([...categories, newCategory]);
  logAuditEvent('INSERT', 'PRODUCE_CATEGORIES', null, newCategory);
  return newCategory;
}

/**
 * Register a Produce
 */
export function insertProduce(produceData: Omit<Produce, 'PRODUCE_ID'>): Produce {
  const produces = getProduce();
  const nextId = produces.length > 0 ? Math.max(...produces.map(p => p.PRODUCE_ID)) + 1 : 301;
  const newProduce: Produce = {
    ...produceData,
    PRODUCE_ID: nextId
  };
  setProduce([...produces, newProduce]);
  
  // Create an empty inventory record automatically (similar to a cascade trigger)
  const inventoryList = getInventory();
  const nextInvId = inventoryList.length > 0 ? Math.max(...inventoryList.map(i => i.INVENTORY_ID)) + 1 : 6001;
  const newInv: Inventory = {
    INVENTORY_ID: nextInvId,
    PRODUCE_ID: nextId,
    STOCK_ON_HAND: 0,
    RESERVED_STOCK: 0,
    AVAILABLE_STOCK: 0,
    LOCATION_BAY: 'BAY-NEW',
    LAST_UPDATED: new Date().toISOString()
  };
  setInventory([...inventoryList, newInv]);

  logAuditEvent('INSERT', 'PRODUCE', null, newProduce);
  return newProduce;
}

/**
 * Create a Buyer Order
 */
export function insertOrder(orderData: Omit<Order, 'ORDER_ID' | 'TOTAL_AMOUNT' | 'ORDER_STATUS'>, items: { produceId: number; qty: number; price: number }[]): { success: boolean; error?: string; order?: Order } {
  // Check Inventory first for all items
  const inventoryList = getInventory();
  for (const item of items) {
    const inv = inventoryList.find(i => i.PRODUCE_ID === item.produceId);
    if (!inv || inv.AVAILABLE_STOCK < item.qty) {
      const p = getProduce().find(pr => pr.PRODUCE_ID === item.produceId);
      return { 
        success: false, 
        error: `Insufficient stock for produce "${p?.PRODUCE_NAME || 'Unknown'}". Available: ${inv?.AVAILABLE_STOCK || 0} kg, requested: ${item.qty} kg.` 
      };
    }
  }

  // Deduct Inventory Stock Level
  for (const item of items) {
    const inv = inventoryList.find(i => i.PRODUCE_ID === item.produceId)!;
    inv.STOCK_ON_HAND -= item.qty;
    inv.AVAILABLE_STOCK = inv.STOCK_ON_HAND - inv.RESERVED_STOCK;
    inv.LAST_UPDATED = new Date().toISOString();
  }
  setInventory(inventoryList);

  const orders = getOrders();
  const nextId = orders.length > 0 ? Math.max(...orders.map(o => o.ORDER_ID)) + 1 : 7001;
  const totalAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const newOrder: Order = {
    ...orderData,
    ORDER_ID: nextId,
    TOTAL_AMOUNT: totalAmount,
    ORDER_STATUS: 'PENDING'
  };

  setOrders([newOrder, ...orders]);

  // Adjust Buyer Balance
  const buyers = getBuyers();
  const buyer = buyers.find(b => b.BUYER_ID === orderData.BUYER_ID);
  if (buyer) {
    buyer.BALANCE += totalAmount;
    setBuyers(buyers);
  }

  // Generate Pending Payment in from Buyer
  const payments = getPayments();
  const nextPayId = payments.length > 0 ? Math.max(...payments.map(p => p.PAYMENT_ID)) + 1 : 8001;
  const newPayment: Payment = {
    PAYMENT_ID: nextPayId,
    SOURCE_TYPE: 'ORDER',
    SOURCE_ID: nextId,
    PAYMENT_DATE: orderData.ORDER_DATE,
    AMOUNT: totalAmount,
    PAYMENT_METHOD: 'BANK_TRANSFER',
    TRANSACTION_REFERENCE: `TXN-ORD-AUTO-${nextId}`,
    STATUS: 'PENDING'
  };
  setPayments([newPayment, ...payments]);

  logAuditEvent('INSERT', 'ORDERS', null, newOrder);

  return { success: true, order: newOrder };
}

/**
 * Settle/Complete a Payment
 */
export function processPayment(paymentId: number): Payment | null {
  const payments = getPayments();
  const payIndex = payments.findIndex(p => p.PAYMENT_ID === paymentId);
  if (payIndex === -1) return null;

  const original = { ...payments[payIndex] };
  payments[payIndex].STATUS = 'COMPLETED';
  payments[payIndex].PAYMENT_DATE = new Date().toISOString().split('T')[0];
  setPayments(payments);

  logAuditEvent('UPDATE', 'PAYMENTS', original, payments[payIndex]);

  // If this payment was an ORDER payment, decrease the buyer's balance by payment amount!
  if (original.SOURCE_TYPE === 'ORDER') {
    const orders = getOrders();
    const order = orders.find(o => o.ORDER_ID === original.SOURCE_ID);
    if (order) {
      const buyers = getBuyers();
      const buyer = buyers.find(b => b.BUYER_ID === order.BUYER_ID);
      if (buyer) {
        buyer.BALANCE = Math.max(0, buyer.BALANCE - original.AMOUNT);
        setBuyers(buyers);
      }
    }
  }

  return payments[payIndex];
}

// ----------------------------------------------------
// INTEGRATED CAPSTONE GLOBAL CONTROLLERS
// ----------------------------------------------------

/**
 * Aggregates all relational tables into a single reactive frame
 */
export function loadDatabase() {
  return {
    farmers: getFarmers(),
    buyers: getBuyers(),
    categories: getCategories(),
    produce: getProduce(),
    collections: getCollections(),
    inventory: getInventory(),
    orders: getOrders(),
    payments: getPayments(),
    logs: getAuditLogs(),
    holidays: getHolidays()
  };
}

/**
 * Initializes or resets the entire Oracle Capstone schema sandbox
 */
export function initializeDb(force = false) {
  if (force) {
    // Clear our specific database keys only (preserve any others if present)
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  }
  initLocalStorageDB();
}

/**
 * Gets currently logged in user context
 */
export function getCurrentUser(): string | null {
  const session = getSessionUser();
  return session ? `${session.username} (${session.role === 'ADMIN' ? 'DBA' : 'OPERATOR'})` : null;
}

/**
 * Destroys current signed-in user session
 */
export function logoutUser() {
  setSessionUser(null);
}

