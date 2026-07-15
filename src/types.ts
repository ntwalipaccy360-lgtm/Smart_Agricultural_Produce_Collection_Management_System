/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ==========================================
// ORACLE DATABASE CAPSTONE SCHEMA INTERFACES
// ==========================================

export interface Farmer {
  FARMER_ID: number;           // NUMBER (Primary Key)
  FIRST_NAME: string;          // VARCHAR2(100)
  LAST_NAME: string;           // VARCHAR2(100)
  PHONE: string;               // VARCHAR2(20)
  EMAIL: string;               // VARCHAR2(100)
  NATIONAL_ID: string;         // VARCHAR2(50) (Unique)
  JOIN_DATE: string;           // DATE
  REGION: string;              // VARCHAR2(100)
  COOPERATIVE_NAME: string;    // VARCHAR2(150)
  STATUS: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'; // VARCHAR2(20)
}

export interface Buyer {
  BUYER_ID: number;            // NUMBER (Primary Key)
  COMPANY_NAME: string;        // VARCHAR2(200)
  CONTACT_PERSON: string;      // VARCHAR2(150)
  PHONE: string;               // VARCHAR2(20)
  EMAIL: string;               // VARCHAR2(100)
  ADDRESS: string;             // VARCHAR2(300)
  CREDIT_LIMIT: number;        // NUMBER(10,2)
  BALANCE: number;             // NUMBER(10,2)
  STATUS: 'ACTIVE' | 'BLACKLISTED' | 'INACTIVE'; // VARCHAR2(20)
}

export interface ProduceCategory {
  CATEGORY_ID: number;         // NUMBER (Primary Key)
  CATEGORY_NAME: string;       // VARCHAR2(100) (Unique)
  DESCRIPTION: string;         // VARCHAR2(400)
  STORAGE_TEMP_C: number;      // NUMBER(4,1)
}

export interface Produce {
  PRODUCE_ID: number;          // NUMBER (Primary Key)
  PRODUCE_NAME: string;        // VARCHAR2(150) (Unique)
  CATEGORY_ID: number;         // NUMBER (Foreign Key references PRODUCE_CATEGORIES)
  BASE_PRICE_PER_KG: number;   // NUMBER(10,2)
  SKU: string;                 // VARCHAR2(50) (Unique)
  EXPIRY_DAYS: number;         // NUMBER
}

export interface ProduceCollection {
  COLLECTION_ID: number;       // NUMBER (Primary Key)
  FARMER_ID: number;           // NUMBER (Foreign Key references FARMERS)
  PRODUCE_ID: number;          // NUMBER (Foreign Key references PRODUCE)
  COLLECTION_DATE: string;     // DATE
  QUANTITY_KG: number;         // NUMBER(10,2)
  PRICE_PER_KG: number;        // NUMBER(10,2)
  TOTAL_AMOUNT: number;        // NUMBER(12,2) (Derived: QUANTITY_KG * PRICE_PER_KG)
  GRADE: 'A' | 'B' | 'C';      // VARCHAR2(2)
  MOISTURE_CONTENT: number;    // NUMBER(4,2) (e.g. 13.5%)
  HOLIDAY_CHECK: 'PASSED' | 'WARNING'; // VARCHAR2(20)
  CREATED_BY: string;          // VARCHAR2(100) (Auditing context)
}

export interface Inventory {
  INVENTORY_ID: number;        // NUMBER (Primary Key)
  PRODUCE_ID: number;          // NUMBER (Foreign Key references PRODUCE)
  STOCK_ON_HAND: number;       // NUMBER(12,2)
  RESERVED_STOCK: number;      // NUMBER(12,2)
  AVAILABLE_STOCK: number;     // NUMBER(12,2) (Derived: STOCK_ON_HAND - RESERVED_STOCK)
  LOCATION_BAY: string;        // VARCHAR2(50)
  LAST_UPDATED: string;        // TIMESTAMP
}

export interface Order {
  ORDER_ID: number;            // NUMBER (Primary Key)
  BUYER_ID: number;            // NUMBER (Foreign Key references BUYERS)
  ORDER_DATE: string;          // DATE
  TOTAL_AMOUNT: number;        // NUMBER(12,2)
  ORDER_STATUS: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; // VARCHAR2(20)
  SHIPPING_ADDRESS: string;    // VARCHAR2(300)
  EXPECTED_DELIVERY_DATE: string; // DATE
}

export interface Payment {
  PAYMENT_ID: number;          // NUMBER (Primary Key)
  SOURCE_TYPE: 'COLLECTION' | 'ORDER'; // VARCHAR2(20) (Payment out to Farmer or payment in from Buyer)
  SOURCE_ID: number;           // NUMBER (ID of Collection or Order)
  PAYMENT_DATE: string;        // DATE
  AMOUNT: number;              // NUMBER(12,2)
  PAYMENT_METHOD: 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY' | 'CHEQUE'; // VARCHAR2(50)
  TRANSACTION_REFERENCE: string; // VARCHAR2(100) (Unique)
  STATUS: 'PENDING' | 'COMPLETED' | 'FAILED'; // VARCHAR2(20)
}

export interface PublicHoliday {
  HOLIDAY_ID: number;          // NUMBER (Primary Key)
  HOLIDAY_NAME: string;        // VARCHAR2(150)
  HOLIDAY_DATE: string;        // DATE (Unique)
  IS_COLLECTION_BLOCKED: 'Y' | 'N'; // CHAR(1)
}

export interface AuditLog {
  LOG_ID: number;              // NUMBER (Primary Key)
  USERNAME: string;            // VARCHAR2(100)
  ACTION: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'FAILED_LOGIN'; // VARCHAR2(50)
  ACTION_TIMESTAMP: string;    // TIMESTAMP
  TABLE_NAME: string;          // VARCHAR2(100)
  OLD_VALUE: string | null;    // CLOB (JSON string)
  NEW_VALUE: string | null;    // CLOB (JSON string)
  IP_ADDRESS: string;          // VARCHAR2(45)
}

export type ViewType =
  | 'DASHBOARD'
  | 'FARMERS'
  | 'BUYERS'
  | 'PRODUCE_CATEGORIES'
  | 'PRODUCE'
  | 'COLLECTIONS'
  | 'INVENTORY'
  | 'ORDERS'
  | 'PAYMENTS'
  | 'REPORTS'
  | 'AUDIT'
  | 'HOLIDAYS'
  | 'PROFILE'
  | 'SETTINGS'
  | 'ABOUT'
  | 'ORACLE_SQL'; // Specialized section for Oracle DDL script visualization!
