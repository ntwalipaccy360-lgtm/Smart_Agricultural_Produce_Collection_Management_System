/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Farmer, Buyer, ProduceCategory, Produce, ProduceCollection, Inventory, Order, Payment, PublicHoliday, AuditLog } from '../types';

export const INITIAL_FARMERS: Farmer[] = [
  {
    FARMER_ID: 1001,
    FIRST_NAME: "Samuel",
    LAST_NAME: "Kiprotich",
    PHONE: "+254 712 345 678",
    EMAIL: "samuel.kip@riftvalleyagri.org",
    NATIONAL_ID: "ID-88493022",
    JOIN_DATE: "2025-01-10",
    REGION: "Rift Valley",
    COOPERATIVE_NAME: "Uasin Gishu Grain Coop",
    STATUS: "ACTIVE"
  },
  {
    FARMER_ID: 1002,
    FIRST_NAME: "Grace",
    LAST_NAME: "Mwanza",
    PHONE: "+254 723 456 789",
    EMAIL: "grace.mwanza@drylands.co.ke",
    NATIONAL_ID: "ID-92019488",
    JOIN_DATE: "2025-02-14",
    REGION: "Eastern Region",
    COOPERATIVE_NAME: "Makueni Horticulture Society",
    STATUS: "ACTIVE"
  },
  {
    FARMER_ID: 1003,
    FIRST_NAME: "John",
    LAST_NAME: "Ondeso",
    PHONE: "+254 734 567 890",
    EMAIL: "j.ondeso@nyanzaproduce.com",
    NATIONAL_ID: "ID-75392019",
    JOIN_DATE: "2025-03-01",
    REGION: "Nyanza",
    COOPERATIVE_NAME: "Lake Victoria Rice Growers Association",
    STATUS: "ACTIVE"
  },
  {
    FARMER_ID: 1004,
    FIRST_NAME: "Beatrice",
    LAST_NAME: "Wanjiku",
    PHONE: "+254 701 234 567",
    EMAIL: "beatrice.wanjiku@aberdares.org",
    NATIONAL_ID: "ID-89029311",
    JOIN_DATE: "2025-04-18",
    REGION: "Central Highlands",
    COOPERATIVE_NAME: "Aberdare Organic Farms",
    STATUS: "ACTIVE"
  },
  {
    FARMER_ID: 1005,
    FIRST_NAME: "Emmanuel",
    LAST_NAME: "Chirchir",
    PHONE: "+254 715 998 221",
    EMAIL: "emmanuel.chir@agrilink.ke",
    NATIONAL_ID: "ID-62049182",
    JOIN_DATE: "2025-05-02",
    REGION: "Rift Valley",
    COOPERATIVE_NAME: "Kericho Tea & Grain Union",
    STATUS: "SUSPENDED"
  }
];

export const INITIAL_BUYERS: Buyer[] = [
  {
    BUYER_ID: 2001,
    COMPANY_NAME: "Apex Millers Ltd",
    CONTACT_PERSON: "David Kamau",
    PHONE: "+254 20 445 9200",
    EMAIL: "procurement@apexmillers.com",
    ADDRESS: "Industrial Area, Phase II, Nairobi",
    CREDIT_LIMIT: 500000.00,
    BALANCE: 154200.00,
    STATUS: "ACTIVE"
  },
  {
    BUYER_ID: 2002,
    COMPANY_NAME: "FreshBasket Supermarkets",
    CONTACT_PERSON: "Mercy Mwangi",
    PHONE: "+254 722 889 001",
    EMAIL: "m.mwangi@freshbasket.co.ke",
    ADDRESS: "Mombasa Road Center, Nairobi",
    CREDIT_LIMIT: 250000.00,
    BALANCE: 45000.00,
    STATUS: "ACTIVE"
  },
  {
    BUYER_ID: 2003,
    COMPANY_NAME: "East African Breweries & Grain",
    CONTACT_PERSON: "Hassan Omar",
    PHONE: "+254 733 444 555",
    EMAIL: "omar.h@eabgcorp.com",
    ADDRESS: "Port Reitz, Mombasa",
    CREDIT_LIMIT: 1000000.00,
    BALANCE: 0.00,
    STATUS: "ACTIVE"
  },
  {
    BUYER_ID: 2004,
    COMPANY_NAME: "Global Export Agri-Trade",
    CONTACT_PERSON: "Sven Lindstrom",
    PHONE: "+254 20 555 1234",
    EMAIL: "sven@globalagritrade.org",
    ADDRESS: "KPA Plaza, Office 4B, Mombasa",
    CREDIT_LIMIT: 1500000.00,
    BALANCE: 875000.00,
    STATUS: "BLACKLISTED"
  }
];

export const INITIAL_CATEGORIES: ProduceCategory[] = [
  {
    CATEGORY_ID: 1,
    CATEGORY_NAME: "Grains & Cereals",
    DESCRIPTION: "Staple dry crops such as maize, wheat, rice, barley, and millet.",
    STORAGE_TEMP_C: 15.0
  },
  {
    CATEGORY_ID: 2,
    CATEGORY_NAME: "Tubers & Roots",
    DESCRIPTION: "Underground energy-rich crops including potatoes, cassava, sweet potatoes, and yams.",
    STORAGE_TEMP_C: 8.5
  },
  {
    CATEGORY_ID: 3,
    CATEGORY_NAME: "Horticultural Fruits",
    DESCRIPTION: "High-value fruit crops like avocados, mangoes, passion fruits, and oranges.",
    STORAGE_TEMP_C: 6.0
  },
  {
    CATEGORY_ID: 4,
    CATEGORY_NAME: "Legumes & Pulses",
    DESCRIPTION: "Protein-rich dry seeds of leguminous plants including dry beans, peas, and lentils.",
    STORAGE_TEMP_C: 18.0
  }
];

export const INITIAL_PRODUCE: Produce[] = [
  {
    PRODUCE_ID: 301,
    PRODUCE_NAME: "White Maize Grade 1",
    CATEGORY_ID: 1,
    BASE_PRICE_PER_KG: 45.00,
    SKU: "PRD-MAZ-WHT-01",
    EXPIRY_DAYS: 365
  },
  {
    PRODUCE_ID: 302,
    PRODUCE_NAME: "Premium Basmati Rice",
    CATEGORY_ID: 1,
    BASE_PRICE_PER_KG: 120.00,
    SKU: "PRD-RIC-BAS-02",
    EXPIRY_DAYS: 540
  },
  {
    PRODUCE_ID: 303,
    PRODUCE_NAME: "Irish Potatoes (Shangi)",
    CATEGORY_ID: 2,
    BASE_PRICE_PER_KG: 35.00,
    SKU: "PRD-POT-SHA-03",
    EXPIRY_DAYS: 30
  },
  {
    PRODUCE_ID: 304,
    PRODUCE_NAME: "Hass Avocado Premium",
    CATEGORY_ID: 3,
    BASE_PRICE_PER_KG: 80.00,
    SKU: "PRD-AVO-HAS-04",
    EXPIRY_DAYS: 14
  },
  {
    PRODUCE_ID: 305,
    PRODUCE_NAME: "Rosecoco Dry Beans",
    CATEGORY_ID: 4,
    BASE_PRICE_PER_KG: 95.00,
    SKU: "PRD-BEN-ROS-05",
    EXPIRY_DAYS: 450
  }
];

export const INITIAL_COLLECTIONS: ProduceCollection[] = [
  {
    COLLECTION_ID: 5001,
    FARMER_ID: 1001,
    PRODUCE_ID: 301,
    COLLECTION_DATE: "2026-07-01",
    QUANTITY_KG: 5000.00,
    PRICE_PER_KG: 45.00,
    TOTAL_AMOUNT: 225000.00,
    GRADE: "A",
    MOISTURE_CONTENT: 12.8,
    HOLIDAY_CHECK: "PASSED",
    CREATED_BY: "admin"
  },
  {
    COLLECTION_ID: 5002,
    FARMER_ID: 1002,
    PRODUCE_ID: 304,
    COLLECTION_DATE: "2026-07-05",
    QUANTITY_KG: 1200.00,
    PRICE_PER_KG: 80.00,
    TOTAL_AMOUNT: 96000.00,
    GRADE: "A",
    MOISTURE_CONTENT: 14.2,
    HOLIDAY_CHECK: "PASSED",
    CREATED_BY: "operator_01"
  },
  {
    COLLECTION_ID: 5003,
    FARMER_ID: 1003,
    PRODUCE_ID: 302,
    COLLECTION_DATE: "2026-07-10",
    QUANTITY_KG: 3500.00,
    PRICE_PER_KG: 115.00,
    TOTAL_AMOUNT: 402500.00,
    GRADE: "B",
    MOISTURE_CONTENT: 13.5,
    HOLIDAY_CHECK: "PASSED",
    CREATED_BY: "admin"
  },
  {
    COLLECTION_ID: 5004,
    FARMER_ID: 1004,
    PRODUCE_ID: 303,
    COLLECTION_DATE: "2026-07-12",
    QUANTITY_KG: 2000.00,
    PRICE_PER_KG: 35.00,
    TOTAL_AMOUNT: 70000.00,
    GRADE: "A",
    MOISTURE_CONTENT: 15.1,
    HOLIDAY_CHECK: "PASSED",
    CREATED_BY: "operator_02"
  }
];

export const INITIAL_INVENTORY: Inventory[] = [
  {
    INVENTORY_ID: 6001,
    PRODUCE_ID: 301,
    STOCK_ON_HAND: 15000.00,
    RESERVED_STOCK: 4000.00,
    AVAILABLE_STOCK: 11000.00,
    LOCATION_BAY: "SILO-01A",
    LAST_UPDATED: "2026-07-14T10:30:00"
  },
  {
    INVENTORY_ID: 6002,
    PRODUCE_ID: 302,
    STOCK_ON_HAND: 8500.00,
    RESERVED_STOCK: 2000.00,
    AVAILABLE_STOCK: 6500.00,
    LOCATION_BAY: "SILO-03B",
    LAST_UPDATED: "2026-07-14T11:15:00"
  },
  {
    INVENTORY_ID: 6003,
    PRODUCE_ID: 303,
    STOCK_ON_HAND: 2000.00,
    RESERVED_STOCK: 500.00,
    AVAILABLE_STOCK: 1500.00,
    LOCATION_BAY: "COLD-ROOM-02",
    LAST_UPDATED: "2026-07-14T15:45:00"
  },
  {
    INVENTORY_ID: 6004,
    PRODUCE_ID: 304,
    STOCK_ON_HAND: 1200.00,
    RESERVED_STOCK: 800.00,
    AVAILABLE_STOCK: 400.00,
    LOCATION_BAY: "COLD-ROOM-01",
    LAST_UPDATED: "2026-07-14T16:00:00"
  },
  {
    INVENTORY_ID: 6005,
    PRODUCE_ID: 305,
    STOCK_ON_HAND: 6000.00,
    RESERVED_STOCK: 0.00,
    AVAILABLE_STOCK: 6000.00,
    LOCATION_BAY: "DRY-SHED-04",
    LAST_UPDATED: "2026-07-14T09:00:00"
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    ORDER_ID: 7001,
    BUYER_ID: 2001,
    ORDER_DATE: "2026-07-02",
    TOTAL_AMOUNT: 180000.00, // 4000kg of White Maize @ 45
    ORDER_STATUS: "DELIVERED",
    SHIPPING_ADDRESS: "Apex Mills Depot, Thika Road",
    EXPECTED_DELIVERY_DATE: "2026-07-04"
  },
  {
    ORDER_ID: 7002,
    BUYER_ID: 2002,
    ORDER_DATE: "2026-07-08",
    TOTAL_AMOUNT: 64000.00, // 800kg of Avocado @ 80
    ORDER_STATUS: "SHIPPED",
    SHIPPING_ADDRESS: "FreshBasket Hub, Industrial Area, Nairobi",
    EXPECTED_DELIVERY_DATE: "2026-07-10"
  },
  {
    ORDER_ID: 7003,
    BUYER_ID: 2003,
    ORDER_DATE: "2026-07-14",
    TOTAL_AMOUNT: 240000.00, // 2000kg of Basmati Rice @ 120
    ORDER_STATUS: "CONFIRMED",
    SHIPPING_ADDRESS: "East African Breweries, Ruaraka, Nairobi",
    EXPECTED_DELIVERY_DATE: "2026-07-18"
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    PAYMENT_ID: 8001,
    SOURCE_TYPE: "COLLECTION",
    SOURCE_ID: 5001,
    PAYMENT_DATE: "2026-07-02",
    AMOUNT: 225000.00,
    PAYMENT_METHOD: "BANK_TRANSFER",
    TRANSACTION_REFERENCE: "TXN-BK-29381023",
    STATUS: "COMPLETED"
  },
  {
    PAYMENT_ID: 8002,
    SOURCE_TYPE: "COLLECTION",
    SOURCE_ID: 5002,
    PAYMENT_DATE: "2026-07-06",
    AMOUNT: 96000.00,
    PAYMENT_METHOD: "MOBILE_MONEY",
    TRANSACTION_REFERENCE: "TXN-MP-77492019",
    STATUS: "COMPLETED"
  },
  {
    PAYMENT_ID: 8003,
    SOURCE_TYPE: "ORDER",
    SOURCE_ID: 7001,
    PAYMENT_DATE: "2026-07-03",
    AMOUNT: 180000.00,
    PAYMENT_METHOD: "CHEQUE",
    TRANSACTION_REFERENCE: "TXN-CHQ-110293",
    STATUS: "COMPLETED"
  },
  {
    PAYMENT_ID: 8004,
    SOURCE_TYPE: "COLLECTION",
    SOURCE_ID: 5003,
    PAYMENT_DATE: "2026-07-11",
    AMOUNT: 402500.00,
    PAYMENT_METHOD: "BANK_TRANSFER",
    TRANSACTION_REFERENCE: "TXN-BK-99120482",
    STATUS: "PENDING"
  }
];

export const INITIAL_HOLIDAYS: PublicHoliday[] = [
  {
    HOLIDAY_ID: 901,
    HOLIDAY_NAME: "New Year's Day",
    HOLIDAY_DATE: "2026-01-01",
    IS_COLLECTION_BLOCKED: "Y"
  },
  {
    HOLIDAY_ID: 902,
    HOLIDAY_NAME: "Good Friday",
    HOLIDAY_DATE: "2026-04-03",
    IS_COLLECTION_BLOCKED: "N"
  },
  {
    HOLIDAY_ID: 903,
    HOLIDAY_NAME: "National Ag-Harvest Festival",
    HOLIDAY_DATE: "2026-07-15", // Today is July 15! This is blocked, so recording on July 15 triggers our custom Holiday trigger warning!
    IS_COLLECTION_BLOCKED: "Y"
  },
  {
    HOLIDAY_ID: 904,
    HOLIDAY_NAME: "Jamhuri Independence Day",
    HOLIDAY_DATE: "2026-12-12",
    IS_COLLECTION_BLOCKED: "Y"
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    LOG_ID: 9501,
    USERNAME: "admin",
    ACTION: "LOGIN",
    ACTION_TIMESTAMP: "2026-07-15T08:00:00",
    TABLE_NAME: "USER_SESSIONS",
    OLD_VALUE: null,
    NEW_VALUE: JSON.stringify({ session: "active", ip: "192.168.1.10" }),
    IP_ADDRESS: "192.168.1.10"
  },
  {
    LOG_ID: 9502,
    USERNAME: "admin",
    ACTION: "INSERT",
    ACTION_TIMESTAMP: "2026-07-14T09:30:00",
    TABLE_NAME: "PRODUCE",
    OLD_VALUE: null,
    NEW_VALUE: JSON.stringify({ PRODUCE_ID: 305, PRODUCE_NAME: "Rosecoco Dry Beans" }),
    IP_ADDRESS: "192.168.1.10"
  },
  {
    LOG_ID: 9503,
    USERNAME: "operator_01",
    ACTION: "LOGIN",
    ACTION_TIMESTAMP: "2026-07-15T08:30:00",
    TABLE_NAME: "USER_SESSIONS",
    OLD_VALUE: null,
    NEW_VALUE: JSON.stringify({ session: "active", ip: "192.168.1.15" }),
    IP_ADDRESS: "192.168.1.15"
  }
];
