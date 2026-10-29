import { 
  Vendor, 
  InventoryItem, 
  PurchaseOrder, 
  GoodsReceiptNote, 
  VendorInvoice, 
  ThreeWayMatchResult, 
  StockAlert, 
  GSTReconciliationRecord, 
  AuditEvent 
} from '../types';
import { calculateGST } from './gstService';

// --- 80 VENDORS ---
const VENDOR_NAMES = [
  { name: 'Apex Electrical Components (P) Ltd', state: 'Karnataka', code: '29', city: 'Bengaluru', pan: 'AAACA9812E' },
  { name: 'Vanguard Copper Strips & Rods', state: 'Maharashtra', code: '27', city: 'Pune', pan: 'AABCV4410D' },
  { name: 'Deccan Polymers & Insulations', state: 'Karnataka', code: '29', city: 'Hubballi', pan: 'AABCD8821F' },
  { name: 'Precision Contacts & Rivets Corp', state: 'Tamil Nadu', code: '33', city: 'Hosur', pan: 'AACCP1190K' },
  { name: 'Mysuru Solenoids & Actuators LLP', state: 'Karnataka', code: '29', city: 'Mysuru', pan: 'ABBMS7732L' },
  { name: 'Gujarat Epoxy Resins & Chemicals', state: 'Gujarat', code: '24', city: 'Vadodara', pan: 'AABCG5541B' },
  { name: 'Sterling Switchgear Hardware', state: 'Karnataka', code: '29', city: 'Belagavi', pan: 'AACCS6632H' },
  { name: 'ElectroShield Nomex Papers', state: 'Maharashtra', code: '27', city: 'Mumbai', pan: 'AAECE3321N' },
  { name: 'Karnataka Brass Fasteners Works', state: 'Karnataka', code: '29', city: 'Tumakuru', pan: 'AABCK4490M' },
  { name: 'Indo-German Bimetal Strips Ltd', state: 'Haryana', code: '08', city: 'Faridabad', pan: 'AAACI9912C' },
  { name: 'Coimbatore Coil Windings Pvt Ltd', state: 'Tamil Nadu', code: '33', city: 'Coimbatore', pan: 'AACCC8841P' },
  { name: 'Bangalore Arc Chutes & Moulding', state: 'Karnataka', code: '29', city: 'Bengaluru', pan: 'AAACB1102Q' },
  { name: 'National Current Transformers Corp', state: 'Telangana', code: '36', city: 'Hyderabad', pan: 'AACCN7712R' },
  { name: 'Western Toroids & Transformers', state: 'Maharashtra', code: '27', city: 'Nashik', pan: 'AAACW6623S' },
  { name: 'Hind Copper Alloys Industries', state: 'Rajasthan', code: '08', city: 'Khetri', pan: 'AAACH5512T' },
  { name: 'Belgaum Silicon Rubber Seals', state: 'Karnataka', code: '29', city: 'Belagavi', pan: 'AABCB3301U' },
  { name: 'Supreme MOV Varistors Ltd', state: 'Delhi', code: '07', city: 'New Delhi', pan: 'AAACS2210V' },
  { name: 'Delta Thermal Overload Controls', state: 'Karnataka', code: '29', city: 'Bengaluru', pan: 'AACCD4498W' },
  { name: 'Zenith FR-4 Laminates & Sheets', state: 'Gujarat', code: '24', city: 'Ahmedabad', pan: 'AAACZ7721X' },
  { name: 'Hindustan Wire Products Ltd', state: 'Karnataka', code: '29', city: 'Bengaluru', pan: 'AAACH8834Y' }
];

export function generate80Vendors(): Vendor[] {
  const vendors: Vendor[] = [];
  const categories = [
    ['Copper & Conductors'],
    ['Insulation & Polymers'],
    ['Switchgear Components'],
    ['Fasteners & Hardware'],
    ['Electronic & Sensing'],
    ['Copper & Conductors', 'Fasteners & Hardware'],
    ['Switchgear Components', 'Insulation & Polymers']
  ];
  const paymentTermsList = ['NET_30', 'NET_45', 'NET_15', 'NET_60', 'IMMEDIATE'] as const;

  for (let i = 0; i < 80; i++) {
    const base = VENDOR_NAMES[i % VENDOR_NAMES.length];
    const suffixNum = Math.floor(i / VENDOR_NAMES.length) + 1;
    const legalName = suffixNum === 1 ? base.name : `${base.name} (Unit ${suffixNum})`;
    const stateCode = base.code;
    const gstin = `${stateCode}${base.pan}1Z${(i % 9) + 1}`;
    
    vendors.push({
      id: `ven-${(i + 1).toString().padStart(3, '0')}`,
      vendorCode: `VND-${(i + 1).toString().padStart(3, '0')}`,
      legalName,
      tradeName: legalName.split(' ')[0] + ' ' + (base.state === 'Karnataka' ? 'Local' : 'Supply'),
      gstin,
      state: base.state,
      stateCode,
      city: base.city,
      address: `Plot ${10 + i * 3}, Industrial Zone, ${base.city}, ${base.state}`,
      contactPerson: ['Ramesh Rao', 'Anil Deshmukh', 'Sunil Kumar', 'Praveen Shenoy', 'Girish Kulkarni', 'Kavita Patel', 'M. Venkatesh', 'S. Narayanan'][i % 8],
      email: `sales${i + 1}@${base.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)}.co.in`,
      phone: `+91 ${98450 + (i * 123) % 40000} ${10000 + (i * 456) % 89999}`,
      paymentTerms: paymentTermsList[i % paymentTermsList.length],
      leadTimeDays: 4 + (i % 25),
      rating: parseFloat((3.8 + ((i % 12) * 0.1)).toFixed(1)),
      discrepancyRatePct: parseFloat((0.8 + ((i % 8) * 0.5)).toFixed(1)),
      suppliedCategories: categories[i % categories.length],
      outstandingPayable: (i % 5 === 0) ? 0 : 45000 + (i * 18200) % 350000,
      status: i === 14 ? 'ON_HOLD' : 'ACTIVE'
    });
  }

  return vendors;
}

export const SEED_VENDORS = generate80Vendors();

// --- 45 INVENTORY ITEMS ---
export const SEED_ITEMS: InventoryItem[] = [
  // 1. Copper & Conductors
  {
    id: 'item-cw-101',
    sku: 'CW-101',
    name: 'Super Enamelled Copper Wire 0.8 mm (Class H)',
    category: 'Copper & Conductors',
    description: 'Electrolytic grade 99.9% pure dual-coated copper wire for winding coils and solenoids',
    uom: 'kg',
    hsnCode: '85441110',
    gstRate: 18,
    preferredVendorId: 'ven-001',
    standardCost: 780,
    lastPurchasePrice: 775,
    lastPurchaseDate: '2026-10-14',
    balances: {
      'WH-BLR-01': {
        openingQty: 300,
        currentQty: 240,
        reservedQty: 40,
        availableQty: 200,
        minThreshold: 120,
        reorderQty: 250,
        targetStock: 400,
        locationRack: 'RACK-A1-04',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 12,
        daysRemaining: 16,
        expectedStockoutDate: '2026-11-13'
      },
      'WH-BGV-02': {
        openingQty: 120,
        currentQty: 90,
        reservedQty: 10,
        availableQty: 80,
        minThreshold: 60,
        reorderQty: 120,
        targetStock: 200,
        locationRack: 'RACK-B2-01',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 4,
        daysRemaining: 20,
        expectedStockoutDate: '2026-11-17'
      }
    },
    totalCurrentQty: 330,
    totalAvailableQty: 280,
    totalReservedQty: 50,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    // SCENARIO A: Low stock trigger item!
    id: 'item-cw-102',
    sku: 'CW-102',
    name: 'Enamelled Copper Wire 1.5 sq mm (Class F)',
    category: 'Copper & Conductors',
    description: 'Heavy duty round magnet wire for transformer secondaries and magnetic coils',
    uom: 'kg',
    hsnCode: '85441110',
    gstRate: 18,
    preferredVendorId: 'ven-002',
    standardCost: 820,
    lastPurchasePrice: 820,
    lastPurchaseDate: '2026-09-28',
    balances: {
      'WH-BLR-01': {
        openingQty: 150,
        currentQty: 45,
        reservedQty: 10,
        availableQty: 35, // Below min threshold 100!
        minThreshold: 100,
        reorderQty: 150,
        targetStock: 200,
        locationRack: 'RACK-A1-05',
        stockStatus: 'CRITICAL_SHORTAGE',
        avgDailyConsumption: 15,
        daysRemaining: 2,
        expectedStockoutDate: '2026-10-30'
      },
      'WH-BGV-02': {
        openingQty: 80,
        currentQty: 25,
        reservedQty: 5,
        availableQty: 20, // Below min threshold 40!
        minThreshold: 40,
        reorderQty: 80,
        targetStock: 100,
        locationRack: 'RACK-B2-02',
        stockStatus: 'REORDER_REQUIRED',
        avgDailyConsumption: 5,
        daysRemaining: 4,
        expectedStockoutDate: '2026-11-01'
      }
    },
    totalCurrentQty: 70,
    totalAvailableQty: 55,
    totalReservedQty: 15,
    overallStatus: 'CRITICAL_SHORTAGE',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'item-cb-103',
    sku: 'CB-103',
    name: 'EC Grade Copper Busbar 25x5 mm',
    category: 'Copper & Conductors',
    description: 'High conductivity extruded flat copper busbar for main distribution panelboards',
    uom: 'meters',
    hsnCode: '74071010',
    gstRate: 18,
    preferredVendorId: 'ven-002',
    standardCost: 640,
    lastPurchasePrice: 630,
    lastPurchaseDate: '2026-10-05',
    balances: {
      'WH-BLR-01': {
        openingQty: 400,
        currentQty: 320,
        reservedQty: 30,
        availableQty: 290,
        minThreshold: 100,
        reorderQty: 200,
        targetStock: 350,
        locationRack: 'BAY-C1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 10,
        daysRemaining: 29,
        expectedStockoutDate: '2026-11-26'
      },
      'WH-BGV-02': {
        openingQty: 150,
        currentQty: 120,
        reservedQty: 10,
        availableQty: 110,
        minThreshold: 50,
        reorderQty: 100,
        targetStock: 150,
        locationRack: 'BAY-C2',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 3,
        daysRemaining: 36,
        expectedStockoutDate: '2026-12-03'
      }
    },
    totalCurrentQty: 440,
    totalAvailableQty: 400,
    totalReservedQty: 40,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  // 2. Switchgear Components
  {
    // SCENARIOS B & C: Solenoid Coils with partial delivery & invoice mismatch!
    id: 'item-sc-301',
    sku: 'SC-301',
    name: 'Solenoid Actuator Coil 230V AC 50Hz',
    category: 'Switchgear Components',
    description: 'Precision molded epoxy encapsulated solenoid coil with DIN 43650 connector',
    uom: 'nos',
    hsnCode: '85059000',
    gstRate: 18,
    preferredVendorId: 'ven-001',
    standardCost: 450,
    lastPurchasePrice: 450,
    lastPurchaseDate: '2026-10-20',
    balances: {
      'WH-BLR-01': {
        openingQty: 120,
        currentQty: 165, // Received 85 units from PO 100
        reservedQty: 45,
        availableQty: 120,
        minThreshold: 80,
        reorderQty: 100,
        targetStock: 200,
        locationRack: 'RACK-D3-01',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 6,
        daysRemaining: 20,
        expectedStockoutDate: '2026-11-17'
      },
      'WH-BGV-02': {
        openingQty: 50,
        currentQty: 45,
        reservedQty: 5,
        availableQty: 40,
        minThreshold: 30,
        reorderQty: 50,
        targetStock: 80,
        locationRack: 'RACK-D3-02',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 2,
        daysRemaining: 20,
        expectedStockoutDate: '2026-11-17'
      }
    },
    totalCurrentQty: 210,
    totalAvailableQty: 160,
    totalReservedQty: 50,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'item-bm-302',
    sku: 'BM-302',
    name: 'Bimetallic Overload Strip 16A-24A Calibrated',
    category: 'Switchgear Components',
    description: 'Thermostatic deflection strip for motor protection circuit breakers',
    uom: 'nos',
    hsnCode: '90328990',
    gstRate: 18,
    preferredVendorId: 'ven-010',
    standardCost: 185,
    lastPurchasePrice: 185,
    lastPurchaseDate: '2026-10-10',
    balances: {
      'WH-BLR-01': {
        openingQty: 450,
        currentQty: 390,
        reservedQty: 80,
        availableQty: 310,
        minThreshold: 150,
        reorderQty: 300,
        targetStock: 500,
        locationRack: 'BIN-12',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 14,
        daysRemaining: 22,
        expectedStockoutDate: '2026-11-19'
      },
      'WH-BGV-02': {
        openingQty: 150,
        currentQty: 110,
        reservedQty: 20,
        availableQty: 90,
        minThreshold: 75,
        reorderQty: 150,
        targetStock: 250,
        locationRack: 'BIN-14',
        stockStatus: 'APPROACHING_THRESHOLD',
        avgDailyConsumption: 5,
        daysRemaining: 18,
        expectedStockoutDate: '2026-11-15'
      }
    },
    totalCurrentQty: 500,
    totalAvailableQty: 400,
    totalReservedQty: 100,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'item-cr-303',
    sku: 'CR-303',
    name: 'Silver Cadmium Oxide Contact Rivet 6mm',
    category: 'Switchgear Components',
    description: 'AgCdO 88/12 electrical contact tips for high-arcing contactor switches',
    uom: 'nos',
    hsnCode: '85389000',
    gstRate: 18,
    preferredVendorId: 'ven-004',
    standardCost: 42,
    lastPurchasePrice: 42.5,
    lastPurchaseDate: '2026-10-18',
    balances: {
      'WH-BLR-01': {
        openingQty: 2000,
        currentQty: 1600,
        reservedQty: 300,
        availableQty: 1300,
        minThreshold: 800,
        reorderQty: 1500,
        targetStock: 2500,
        locationRack: 'LOCKER-S1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 60,
        daysRemaining: 21,
        expectedStockoutDate: '2026-11-18'
      },
      'WH-BGV-02': {
        openingQty: 600,
        currentQty: 480,
        reservedQty: 100,
        availableQty: 380,
        minThreshold: 300,
        reorderQty: 600,
        targetStock: 800,
        locationRack: 'LOCKER-S2',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 15,
        daysRemaining: 25,
        expectedStockoutDate: '2026-11-22'
      }
    },
    totalCurrentQty: 2080,
    totalAvailableQty: 1680,
    totalReservedQty: 400,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  // 3. Insulation & Polymers
  {
    // SCENARIO F: Cross-warehouse difference item!
    // Peenya has healthy 280 sheets, Belagavi has only 12 sheets (below threshold 25)!
    id: 'item-fr-401',
    sku: 'FR-401',
    name: 'FR-4 Glass Epoxy Insulation Sheet 2mm (1m x 1m)',
    category: 'Insulation & Polymers',
    description: 'Flame retardant electrical grade fiberglass reinforced laminate',
    uom: 'nos',
    hsnCode: '39209999',
    gstRate: 18,
    preferredVendorId: 'ven-019',
    standardCost: 1250,
    lastPurchasePrice: 1250,
    lastPurchaseDate: '2026-09-15',
    balances: {
      'WH-BLR-01': {
        openingQty: 320,
        currentQty: 295,
        reservedQty: 15,
        availableQty: 280, // Healthy in Peenya!
        minThreshold: 50,
        reorderQty: 100,
        targetStock: 300,
        locationRack: 'BAY-INS-1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 4,
        daysRemaining: 70,
        expectedStockoutDate: '2027-01-06'
      },
      'WH-BGV-02': {
        openingQty: 30,
        currentQty: 15,
        reservedQty: 3,
        availableQty: 12, // Shortage in Belagavi! Opportunity for transfer
        minThreshold: 25,
        reorderQty: 40,
        targetStock: 60,
        locationRack: 'BAY-INS-2',
        stockStatus: 'REORDER_REQUIRED',
        avgDailyConsumption: 2,
        daysRemaining: 6,
        expectedStockoutDate: '2026-11-03'
      }
    },
    totalCurrentQty: 310,
    totalAvailableQty: 292,
    totalReservedQty: 18,
    overallStatus: 'APPROACHING_THRESHOLD',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    // SCENARIO E: Replenished item!
    id: 'item-es-204',
    sku: 'ES-204',
    name: 'Epoxy Casting Resin (CY-230 Grade)',
    category: 'Insulation & Polymers',
    description: 'Solventless liquid epoxy resin for vacuum pressure impregnation of coils',
    uom: 'kg',
    hsnCode: '39073010',
    gstRate: 18,
    preferredVendorId: 'ven-006',
    standardCost: 380,
    lastPurchasePrice: 380,
    lastPurchaseDate: '2026-10-22',
    balances: {
      'WH-BLR-01': {
        openingQty: 200,
        currentQty: 470, // Received 300 kg recently
        reservedQty: 20,
        availableQty: 450,
        minThreshold: 150,
        reorderQty: 250,
        targetStock: 500,
        locationRack: 'CHEM-ZONE-A',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 12,
        daysRemaining: 37,
        expectedStockoutDate: '2026-12-04'
      },
      'WH-BGV-02': {
        openingQty: 100,
        currentQty: 120,
        reservedQty: 10,
        availableQty: 110,
        minThreshold: 60,
        reorderQty: 100,
        targetStock: 150,
        locationRack: 'CHEM-ZONE-B',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 3,
        daysRemaining: 36,
        expectedStockoutDate: '2026-12-03'
      }
    },
    totalCurrentQty: 590,
    totalAvailableQty: 560,
    totalReservedQty: 30,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'item-np-205',
    sku: 'NP-205',
    name: 'Nomex 410 Aramid Insulation Paper 0.25mm',
    category: 'Insulation & Polymers',
    description: 'High temperature calendered insulating paper withstands up to 220 deg C',
    uom: 'rolls',
    hsnCode: '48059300',
    gstRate: 12,
    preferredVendorId: 'ven-008',
    standardCost: 3200,
    lastPurchasePrice: 3200,
    lastPurchaseDate: '2026-10-02',
    balances: {
      'WH-BLR-01': {
        openingQty: 25,
        currentQty: 20,
        reservedQty: 2,
        availableQty: 18,
        minThreshold: 10,
        reorderQty: 15,
        targetStock: 30,
        locationRack: 'RACK-E1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 0.6,
        daysRemaining: 30,
        expectedStockoutDate: '2026-11-27'
      },
      'WH-BGV-02': {
        openingQty: 10,
        currentQty: 9,
        reservedQty: 1,
        availableQty: 8,
        minThreshold: 5,
        reorderQty: 10,
        targetStock: 15,
        locationRack: 'RACK-E2',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 0.2,
        daysRemaining: 40,
        expectedStockoutDate: '2026-12-07'
      }
    },
    totalCurrentQty: 29,
    totalAvailableQty: 26,
    totalReservedQty: 3,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  // 4. Fasteners & Hardware
  {
    id: 'item-bt-501',
    sku: 'BT-501',
    name: 'Threaded Brass Terminal Stud M6 x 35mm',
    category: 'Fasteners & Hardware',
    description: 'High conductivity forged brass terminal bolt with 2 nuts and spring washers',
    uom: 'nos',
    hsnCode: '74153300',
    gstRate: 18,
    preferredVendorId: 'ven-009',
    standardCost: 28,
    lastPurchasePrice: 28,
    lastPurchaseDate: '2026-10-12',
    balances: {
      'WH-BLR-01': {
        openingQty: 3500,
        currentQty: 2800,
        reservedQty: 400,
        availableQty: 2400,
        minThreshold: 1000,
        reorderQty: 2000,
        targetStock: 4000,
        locationRack: 'BIN-F1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 80,
        daysRemaining: 30,
        expectedStockoutDate: '2026-11-27'
      },
      'WH-BGV-02': {
        openingQty: 1200,
        currentQty: 950,
        reservedQty: 100,
        availableQty: 850,
        minThreshold: 400,
        reorderQty: 1000,
        targetStock: 1500,
        locationRack: 'BIN-F2',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 25,
        daysRemaining: 34,
        expectedStockoutDate: '2026-12-01'
      }
    },
    totalCurrentQty: 3750,
    totalAvailableQty: 3250,
    totalReservedQty: 500,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'item-ss-502',
    sku: 'SS-502',
    name: 'Stainless Steel M4x16 Hex Socket Screws (SS 304)',
    category: 'Fasteners & Hardware',
    description: 'Corrosion resistant Allen head machine screws for internal breaker housing',
    uom: 'nos',
    hsnCode: '73181500',
    gstRate: 18,
    preferredVendorId: 'ven-007',
    standardCost: 3.5,
    lastPurchasePrice: 3.5,
    lastPurchaseDate: '2026-10-08',
    balances: {
      'WH-BLR-01': {
        openingQty: 10000,
        currentQty: 8400,
        reservedQty: 1200,
        availableQty: 7200,
        minThreshold: 3000,
        reorderQty: 6000,
        targetStock: 12000,
        locationRack: 'BIN-G1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 220,
        daysRemaining: 32,
        expectedStockoutDate: '2026-11-29'
      },
      'WH-BGV-02': {
        openingQty: 4000,
        currentQty: 3100,
        reservedQty: 500,
        availableQty: 2600,
        minThreshold: 1200,
        reorderQty: 3000,
        targetStock: 5000,
        locationRack: 'BIN-G2',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 70,
        daysRemaining: 37,
        expectedStockoutDate: '2026-12-04'
      }
    },
    totalCurrentQty: 11500,
    totalAvailableQty: 9800,
    totalReservedQty: 1700,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  // 5. Electronic & Sensing
  {
    id: 'item-ct-601',
    sku: 'CT-601',
    name: 'Toroidal Current Transformer 100/5A Class 0.5',
    category: 'Electronic & Sensing',
    description: 'Epoxy resin cast ring type measuring CT for current sensing modules',
    uom: 'nos',
    hsnCode: '85043100',
    gstRate: 18,
    preferredVendorId: 'ven-013',
    standardCost: 520,
    lastPurchasePrice: 520,
    lastPurchaseDate: '2026-10-15',
    balances: {
      'WH-BLR-01': {
        openingQty: 180,
        currentQty: 140,
        reservedQty: 25,
        availableQty: 115,
        minThreshold: 60,
        reorderQty: 100,
        targetStock: 200,
        locationRack: 'RACK-S1',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 5,
        daysRemaining: 23,
        expectedStockoutDate: '2026-11-20'
      },
      'WH-BGV-02': {
        openingQty: 70,
        currentQty: 55,
        reservedQty: 10,
        availableQty: 45,
        minThreshold: 30,
        reorderQty: 50,
        targetStock: 80,
        locationRack: 'RACK-S2',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 2,
        daysRemaining: 22,
        expectedStockoutDate: '2026-11-19'
      }
    },
    totalCurrentQty: 195,
    totalAvailableQty: 160,
    totalReservedQty: 35,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  },
  {
    id: 'item-mv-602',
    sku: 'MV-602',
    name: 'Metal Oxide Varistor (MOV 20D471K)',
    category: 'Electronic & Sensing',
    description: 'Surge suppression 470V disc varistor for transient voltage protection',
    uom: 'nos',
    hsnCode: '85334030',
    gstRate: 18,
    preferredVendorId: 'ven-017',
    standardCost: 14.5,
    lastPurchasePrice: 14.5,
    lastPurchaseDate: '2026-10-09',
    balances: {
      'WH-BLR-01': {
        openingQty: 2500,
        currentQty: 2100,
        reservedQty: 300,
        availableQty: 1800,
        minThreshold: 800,
        reorderQty: 1500,
        targetStock: 3000,
        locationRack: 'BIN-E4',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 50,
        daysRemaining: 36,
        expectedStockoutDate: '2026-12-03'
      },
      'WH-BGV-02': {
        openingQty: 800,
        currentQty: 680,
        reservedQty: 80,
        availableQty: 600,
        minThreshold: 300,
        reorderQty: 800,
        targetStock: 1200,
        locationRack: 'BIN-E5',
        stockStatus: 'HEALTHY',
        avgDailyConsumption: 18,
        daysRemaining: 33,
        expectedStockoutDate: '2026-11-30'
      }
    },
    totalCurrentQty: 2780,
    totalAvailableQty: 2400,
    totalReservedQty: 380,
    overallStatus: 'HEALTHY',
    updatedAt: '2026-10-28T10:00:00Z'
  }
];

// --- SEED PURCHASE ORDERS ---
export const SEED_PURCHASE_ORDERS: PurchaseOrder[] = [
  // PO 1: SCENARIOS B & C PO!
  // PO-2026-0812 for Solenoid Coils (100 units). 85 arrived, 15 outstanding.
  {
    id: 'po-2026-0812',
    poNumber: 'PO-2026-0812',
    vendorId: 'ven-001',
    vendorName: 'Apex Electrical Components (P) Ltd',
    vendorGstin: '29AAACA9812E1Z1', // Karnataka (Intra-state)
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    orderDate: '2026-10-15',
    expectedDeliveryDate: '2026-10-22',
    paymentTerms: 'NET_30',
    status: 'PARTIALLY_RECEIVED',
    lines: [
      {
        id: 'pol-812-1',
        itemId: 'item-sc-301',
        sku: 'SC-301',
        itemName: 'Solenoid Actuator Coil 230V AC 50Hz',
        uom: 'nos',
        hsnCode: '85059000',
        orderedQty: 100,
        unitPrice: 450,
        gstRate: 18,
        taxableAmount: 45000,
        cgst: 4050,
        sgst: 4050,
        igst: 0,
        totalAmount: 53100,
        previouslyReceivedQty: 0,
        acceptedQty: 85,
        outstandingQty: 15 // 15 outstanding units preserved!
      }
    ],
    subtotal: 45000,
    cgstTotal: 4050,
    sgstTotal: 4050,
    igstTotal: 0,
    grandTotal: 53100,
    isInterState: false,
    notes: 'Urgent supply for breaker production line #2.',
    approvalNotes: 'Approved as per standard rate contract.',
    approvedBy: 'Ananya Hegde (Procurement Manager)',
    approvedAt: '2026-10-15T11:30:00Z',
    createdAt: '2026-10-15T09:15:00Z',
    updatedAt: '2026-10-21T14:40:00Z'
  },
  // PO 2: Inter-state PO with Maharashtra vendor (Vanguard Copper Strips)
  {
    id: 'po-2026-0815',
    poNumber: 'PO-2026-0815',
    vendorId: 'ven-002',
    vendorName: 'Vanguard Copper Strips & Rods',
    vendorGstin: '27AABCV4410D1Z2', // Maharashtra (Inter-state)
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    orderDate: '2026-10-18',
    expectedDeliveryDate: '2026-10-29',
    paymentTerms: 'NET_45',
    status: 'APPROVED',
    lines: [
      {
        id: 'pol-815-1',
        itemId: 'item-cb-103',
        sku: 'CB-103',
        itemName: 'EC Grade Copper Busbar 25x5 mm',
        uom: 'meters',
        hsnCode: '74071010',
        orderedQty: 150,
        unitPrice: 640,
        gstRate: 18,
        taxableAmount: 96000,
        cgst: 0,
        sgst: 0,
        igst: 17280,
        totalAmount: 113280,
        previouslyReceivedQty: 0,
        acceptedQty: 0,
        outstandingQty: 150
      }
    ],
    subtotal: 96000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 17280,
    grandTotal: 113280,
    isInterState: true,
    notes: 'Dispatch via VRL Logistics door delivery.',
    approvalNotes: 'Approved within monthly capital purchase budget.',
    approvedBy: 'Rajesh Sharma (Business Owner)',
    approvedAt: '2026-10-18T16:00:00Z',
    createdAt: '2026-10-18T14:00:00Z',
    updatedAt: '2026-10-18T16:00:00Z'
  },
  // PO 3: SCENARIO E completed PO (ResinCY-230)
  {
    id: 'po-2026-0795',
    poNumber: 'PO-2026-0795',
    vendorId: 'ven-006',
    vendorName: 'Gujarat Epoxy Resins & Chemicals',
    vendorGstin: '24AABCG5541B1Z6', // Gujarat (Inter-state)
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    orderDate: '2026-10-08',
    expectedDeliveryDate: '2026-10-18',
    paymentTerms: 'NET_30',
    status: 'FULLY_RECEIVED',
    lines: [
      {
        id: 'pol-795-1',
        itemId: 'item-es-204',
        sku: 'ES-204',
        itemName: 'Epoxy Casting Resin (CY-230 Grade)',
        uom: 'kg',
        hsnCode: '39073010',
        orderedQty: 300,
        unitPrice: 380,
        gstRate: 18,
        taxableAmount: 114000,
        cgst: 0,
        sgst: 0,
        igst: 20520,
        totalAmount: 134520,
        previouslyReceivedQty: 0,
        acceptedQty: 300,
        outstandingQty: 0
      }
    ],
    subtotal: 114000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 20520,
    grandTotal: 134520,
    isInterState: true,
    approvalNotes: 'Approved from automated replenishment alert.',
    approvedBy: 'Ananya Hegde (Procurement Manager)',
    approvedAt: '2026-10-08T11:00:00Z',
    createdAt: '2026-10-08T10:00:00Z',
    updatedAt: '2026-10-22T12:00:00Z'
  }
];

// --- SEED GOODS RECEIPT NOTES ---
export const SEED_GOODS_RECEIPTS: GoodsReceiptNote[] = [
  // SCENARIO B GRN: 85 accepted, 15 shortage against PO-2026-0812 (100 ordered)
  {
    id: 'grn-2026-0421',
    grnNumber: 'GRN-2026-0421',
    poId: 'po-2026-0812',
    poNumber: 'PO-2026-0812',
    vendorId: 'ven-001',
    vendorName: 'Apex Electrical Components (P) Ltd',
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    receiptDate: '2026-10-21',
    deliveryChallanNo: 'DC-APX-7749',
    vehicleNo: 'KA-04-E-8821',
    receiverName: 'Basavaraj K (Warehouse Operator)',
    inspectionNotes: 'Physical box count was 85 units only. Vendor delivery challan stated 85 units due to raw material constraint at vendor plant. All 85 tested OK.',
    status: 'SHORTAGE_FLAGGED',
    lines: [
      {
        id: 'grnl-421-1',
        poLineId: 'pol-812-1',
        itemId: 'item-sc-301',
        sku: 'SC-301',
        itemName: 'Solenoid Actuator Coil 230V AC 50Hz',
        uom: 'nos',
        orderedQty: 100,
        previouslyReceivedQty: 0,
        deliveredQty: 85,
        acceptedQty: 85,
        rejectedQty: 0,
        outstandingQty: 15
      }
    ],
    totalOrderedQty: 100,
    totalDeliveredQty: 85,
    totalAcceptedQty: 85,
    totalRejectedQty: 0,
    hasDiscrepancy: true,
    discrepancyType: 'SHORTAGE',
    discrepancyNotes: 'Short delivery of 15 units. Outstanding PO balance retained. Vendor alerted.',
    isProcessedToInventory: true,
    createdAt: '2026-10-21T14:30:00Z'
  },
  // SCENARIO E GRN: 300 accepted (Full delivery)
  {
    id: 'grn-2026-0390',
    grnNumber: 'GRN-2026-0390',
    poId: 'po-2026-0795',
    poNumber: 'PO-2026-0795',
    vendorId: 'ven-006',
    vendorName: 'Gujarat Epoxy Resins & Chemicals',
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    receiptDate: '2026-10-22',
    deliveryChallanNo: 'GERC-DC-9012',
    vehicleNo: 'GJ-06-AX-4412',
    receiverName: 'Basavaraj K (Warehouse Operator)',
    inspectionNotes: 'All 6 drums of 50kg each received intact. Viscosity and batch certificate verified.',
    status: 'RECEIVED_VERIFIED',
    lines: [
      {
        id: 'grnl-390-1',
        poLineId: 'pol-795-1',
        itemId: 'item-es-204',
        sku: 'ES-204',
        itemName: 'Epoxy Casting Resin (CY-230 Grade)',
        uom: 'kg',
        orderedQty: 300,
        previouslyReceivedQty: 0,
        deliveredQty: 300,
        acceptedQty: 300,
        rejectedQty: 0,
        outstandingQty: 0
      }
    ],
    totalOrderedQty: 300,
    totalDeliveredQty: 300,
    totalAcceptedQty: 300,
    totalRejectedQty: 0,
    hasDiscrepancy: false,
    isProcessedToInventory: true,
    createdAt: '2026-10-22T11:30:00Z'
  }
];

// --- SEED VENDOR INVOICES ---
export const SEED_VENDOR_INVOICES: VendorInvoice[] = [
  // SCENARIO C INVOICE:
  // Vendor erroneously billed for 100 units instead of accepted 85 units!
  {
    id: 'inv-2026-9042',
    invoiceNumber: 'INV-2026-9042',
    vendorId: 'ven-001',
    vendorName: 'Apex Electrical Components (P) Ltd',
    vendorGstin: '29AAACA9812E1Z1',
    poId: 'po-2026-0812',
    poNumber: 'PO-2026-0812',
    grnId: 'grn-2026-0421',
    grnNumber: 'GRN-2026-0421',
    warehouseId: 'WH-BLR-01',
    invoiceDate: '2026-10-22',
    dueDate: '2026-11-21',
    lines: [
      {
        id: 'invl-9042-1',
        itemId: 'item-sc-301',
        sku: 'SC-301',
        itemName: 'Solenoid Actuator Coil 230V AC 50Hz',
        invoicedQty: 100, // MISMATCH: Billed 100 vs GRN 85 accepted!
        unitPrice: 450,
        gstRate: 18,
        taxableAmount: 45000,
        cgst: 4050,
        sgst: 4050,
        igst: 0,
        totalAmount: 53100
      }
    ],
    taxableAmount: 45000,
    cgstTotal: 4050,
    sgstTotal: 4050,
    igstTotal: 0,
    grandTotal: 53100,
    paymentStatus: 'DISCREPANCY_HOLD', // Gated! Disputed!
    isInterState: false,
    paidAmount: 0,
    notes: 'Invoice received via email. Discrepancy detected: Invoiced 100 nos vs GRN 85 nos.',
    createdAt: '2026-10-22T16:00:00Z'
  },
  // SCENARIO D INVOICE: GST Discrepancy
  {
    id: 'inv-2026-8819',
    invoiceNumber: 'INV-2026-8819',
    vendorId: 'ven-002',
    vendorName: 'Vanguard Copper Strips & Rods',
    vendorGstin: '27AABCV4410D1Z2',
    poId: 'po-2026-0815',
    poNumber: 'PO-2026-0815',
    warehouseId: 'WH-BLR-01',
    invoiceDate: '2026-10-24',
    dueDate: '2026-12-08',
    lines: [
      {
        id: 'invl-8819-1',
        itemId: 'item-cb-103',
        sku: 'CB-103',
        itemName: 'EC Grade Copper Busbar 25x5 mm',
        invoicedQty: 150,
        unitPrice: 640,
        gstRate: 18,
        taxableAmount: 96000,
        cgst: 0,
        sgst: 0,
        igst: 17280,
        totalAmount: 113280
      }
    ],
    taxableAmount: 96000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 17280,
    grandTotal: 113280,
    paymentStatus: 'AWAITING_MATCH',
    isInterState: true,
    paidAmount: 0,
    notes: 'Advance invoice copy for dispatch verification.',
    createdAt: '2026-10-24T11:00:00Z'
  },
  // Normal Matched & Paid invoice
  {
    id: 'inv-2026-7730',
    invoiceNumber: 'INV-2026-7730',
    vendorId: 'ven-006',
    vendorName: 'Gujarat Epoxy Resins & Chemicals',
    vendorGstin: '24AABCG5541B1Z6',
    poId: 'po-2026-0795',
    poNumber: 'PO-2026-0795',
    grnId: 'grn-2026-0390',
    grnNumber: 'GRN-2026-0390',
    warehouseId: 'WH-BLR-01',
    invoiceDate: '2026-10-23',
    dueDate: '2026-11-22',
    lines: [
      {
        id: 'invl-7730-1',
        itemId: 'item-es-204',
        sku: 'ES-204',
        itemName: 'Epoxy Casting Resin (CY-230 Grade)',
        invoicedQty: 300,
        unitPrice: 380,
        gstRate: 18,
        taxableAmount: 114000,
        cgst: 0,
        sgst: 0,
        igst: 20520,
        totalAmount: 134520
      }
    ],
    taxableAmount: 114000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 20520,
    grandTotal: 134520,
    paymentStatus: 'APPROVED_FOR_PAYMENT',
    isInterState: true,
    paidAmount: 0,
    notes: 'Three-way match clean. Approved by Finance Manager for payment run.',
    createdAt: '2026-10-23T15:00:00Z'
  }
];

// --- SEED THREE-WAY MATCH RESULTS ---
export const SEED_MATCH_RESULTS: ThreeWayMatchResult[] = [
  // SCENARIO C MATCH RESULT:
  {
    id: 'match-inv-2026-9042',
    invoiceId: 'inv-2026-9042',
    invoiceNumber: 'INV-2026-9042',
    poId: 'po-2026-0812',
    poNumber: 'PO-2026-0812',
    grnId: 'grn-2026-0421',
    grnNumber: 'GRN-2026-0421',
    vendorId: 'ven-001',
    vendorName: 'Apex Electrical Components (P) Ltd',
    matchStatus: 'QUANTITY_MISMATCH',
    discrepancies: [
      {
        field: 'QUANTITY',
        expectedValue: '85 nos (Accepted on GRN)',
        actualValue: '100 nos (Billed on Invoice)',
        difference: 15,
        unit: 'nos',
        severity: 'CRITICAL',
        description: 'Billed quantity (100) exceeds accepted delivery quantity (85) by 15 units for Solenoid Actuator Coil 230V AC 50Hz.',
        recommendedAction: 'Hold invoice payment. Request vendor credit note for 15 units (₹6,750 + GST) or revised invoice for 85 units.'
      }
    ],
    tolerancePercentageUsed: 0,
    resolutionStatus: 'UNRESOLVED',
    performedAt: '2026-10-22T16:05:00Z'
  },
  {
    id: 'match-inv-2026-7730',
    invoiceId: 'inv-2026-7730',
    invoiceNumber: 'INV-2026-7730',
    poId: 'po-2026-0795',
    poNumber: 'PO-2026-0795',
    grnId: 'grn-2026-0390',
    grnNumber: 'GRN-2026-0390',
    vendorId: 'ven-006',
    vendorName: 'Gujarat Epoxy Resins & Chemicals',
    matchStatus: 'FULLY_MATCHED',
    discrepancies: [],
    tolerancePercentageUsed: 0,
    resolutionStatus: 'RESOLVED',
    resolvedBy: 'Priyanka Rao, CA (Finance Manager)',
    resolvedAt: '2026-10-23T15:30:00Z',
    performedAt: '2026-10-23T15:10:00Z'
  }
];

// --- SEED STOCK ALERTS ---
export const SEED_STOCK_ALERTS: StockAlert[] = [
  // SCENARIO A ALERT: CW-102 at Peenya Central Warehouse
  {
    id: 'alert-cw-102-wh-blr-01',
    itemId: 'item-cw-102',
    sku: 'CW-102',
    itemName: 'Enamelled Copper Wire 1.5 sq mm (Class F)',
    category: 'Copper & Conductors',
    uom: 'kg',
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    currentAvailableQty: 35, // Below threshold 100!
    minThreshold: 100,
    targetStock: 200,
    quantityOnOrder: 0,
    suggestedReplenishmentQty: 165, // 200 - 35 - 0 = 165
    preferredVendorId: 'ven-002',
    preferredVendorName: 'Vanguard Copper Strips & Rods',
    preferredVendorEmail: 'sales2@vanguardcopp.co.in',
    status: 'REVIEW_REQUIRED',
    urgency: 'CRITICAL',
    vendorEmailDraft: {
      recipientEmail: 'sales2@vanguardcopp.co.in',
      subject: 'Replenishment RFQ / Purchase Requisition: Enamelled Copper Wire 1.5 sq mm (CW-102) - Kavach Electricals',
      body: `Dear Anil Deshmukh,

Greetings from Kavach Electricals & Control Systems Pvt Ltd.

Our automated inventory control system has flagged that our operational inventory for the following material has reached its replenishment threshold:

- Item Description: Enamelled Copper Wire 1.5 sq mm (Class F)
- Internal SKU: CW-102
- HSN Code: 85441110
- Delivery Destination: Peenya Central Warehouse (Bengaluru)
- Current Available Balance: 35 kg (Threshold: 100 kg)
- Required Replenishment Quantity: 165 kg
- Standard Agreed Payment Terms: NET_45

Please confirm current unit pricing (Contract Standard: ₹820.00/kg) and expected dispatch lead time to our Peenya facility within 24 hours.

Kindly reply to this email or send your proforma quotation referencing our procurement department.

Best regards,
Procurement Team
Kavach Electricals & Control Systems Pvt Ltd
Plot 48/B, Phase 2, Peenya Industrial Area, Bengaluru, Karnataka 560058
GSTIN: 29AABCK1234F1Z5
Email: procurement@kavachelectricals.com
`,
      isSimulatedSent: false
    },
    createdAt: '2026-10-28T08:00:00Z',
    updatedAt: '2026-10-28T08:00:00Z',
    notes: 'Material consumption spiked due to production run of 150A contactors.'
  },
  // Belagavi alert for same item (Cross-warehouse)
  {
    id: 'alert-cw-102-wh-bgv-02',
    itemId: 'item-cw-102',
    sku: 'CW-102',
    itemName: 'Enamelled Copper Wire 1.5 sq mm (Class F)',
    category: 'Copper & Conductors',
    uom: 'kg',
    warehouseId: 'WH-BGV-02',
    warehouseName: 'Belagavi Industrial Estate Depot',
    currentAvailableQty: 20, // Below threshold 40!
    minThreshold: 40,
    targetStock: 100,
    quantityOnOrder: 0,
    suggestedReplenishmentQty: 80,
    preferredVendorId: 'ven-002',
    preferredVendorName: 'Vanguard Copper Strips & Rods',
    preferredVendorEmail: 'sales2@vanguardcopp.co.in',
    status: 'DETECTED',
    urgency: 'HIGH',
    vendorEmailDraft: {
      recipientEmail: 'sales2@vanguardcopp.co.in',
      subject: 'Replenishment RFQ / Purchase Requisition: Enamelled Copper Wire 1.5 sq mm (CW-102) - Kavach Electricals (Belagavi)',
      body: `Dear Vendor Partner,

Greetings from Kavach Electricals & Control Systems Pvt Ltd.

Our Belagavi Depot has reached low stock for Enamelled Copper Wire 1.5 sq mm (CW-102). Current stock is 20 kg. Suggested order quantity is 80 kg.

Please confirm dispatch availability.

Best regards,
Procurement Team`,
      isSimulatedSent: false
    },
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-10-28T09:00:00Z'
  },
  // SCENARIO E Resolved Alert (Epoxy Resin CY-230)
  {
    id: 'alert-es-204-wh-blr-01',
    itemId: 'item-es-204',
    sku: 'ES-204',
    itemName: 'Epoxy Casting Resin (CY-230 Grade)',
    category: 'Insulation & Polymers',
    uom: 'kg',
    warehouseId: 'WH-BLR-01',
    warehouseName: 'Peenya Central Warehouse (Bengaluru)',
    currentAvailableQty: 450,
    minThreshold: 150,
    targetStock: 500,
    quantityOnOrder: 0,
    suggestedReplenishmentQty: 0,
    preferredVendorId: 'ven-006',
    preferredVendorName: 'Gujarat Epoxy Resins & Chemicals',
    preferredVendorEmail: 'sales6@gujaratepoxy.co.in',
    status: 'RESOLVED',
    urgency: 'MODERATE',
    vendorEmailDraft: {
      recipientEmail: 'sales6@gujaratepoxy.co.in',
      subject: 'Replenishment Order Request: Epoxy Casting Resin (ES-204)',
      body: 'Order completed and received.',
      isSimulatedSent: true,
      sentAt: '2026-10-08T10:15:00Z'
    },
    linkedPoId: 'po-2026-0795',
    createdAt: '2026-10-08T07:30:00Z',
    updatedAt: '2026-10-22T12:00:00Z',
    notes: 'Resolved upon full GRN receipt of 300 kg.'
  }
];

// --- SEED GST RECONCILIATION RECORDS ---
export const SEED_GST_RECORDS: GSTReconciliationRecord[] = [
  // Clean Intra-state record
  {
    id: 'gst-rec-001',
    period: '2026-10',
    invoiceId: 'inv-2026-7730',
    invoiceNumber: 'INV-2026-7730',
    invoiceDate: '2026-10-23',
    vendorId: 'ven-006',
    vendorName: 'Gujarat Epoxy Resins & Chemicals',
    vendorGstin: '24AABCG5541B1Z6',
    posState: 'Karnataka',
    isInterState: true,
    hsnCode: '39073010',
    taxableValue: 114000,
    calculatedCGST: 0,
    calculatedSGST: 0,
    calculatedIGST: 20520,
    calculatedTotalTax: 20520,
    gstr2bReportedTaxable: 114000,
    gstr2bReportedCGST: 0,
    gstr2bReportedSGST: 0,
    gstr2bReportedIGST: 20520,
    gstr2bReportedTotalTax: 20520,
    gstr2bFilingDate: '2026-10-25',
    reconciliationStatus: 'RECONCILED',
    itcEligibility: 'ELIGIBLE_VERIFIED',
    itcClaimableAmount: 20520,
    reviewedBy: 'Priyanka Rao, CA',
    reviewedAt: '2026-10-26T11:00:00Z'
  },
  // SCENARIO D GST Discrepancy record:
  // Vendor GSTR-2B reported only ₹14,200 IGST instead of billed ₹17,280 (or difference of ₹3,080)!
  {
    id: 'gst-rec-002',
    period: '2026-10',
    invoiceId: 'inv-2026-8819',
    invoiceNumber: 'INV-2026-8819',
    invoiceDate: '2026-10-24',
    vendorId: 'ven-002',
    vendorName: 'Vanguard Copper Strips & Rods',
    vendorGstin: '27AABCV4410D1Z2',
    posState: 'Karnataka',
    isInterState: true,
    hsnCode: '74071010',
    taxableValue: 96000,
    calculatedCGST: 0,
    calculatedSGST: 0,
    calculatedIGST: 17280,
    calculatedTotalTax: 17280,
    gstr2bReportedTaxable: 78888.89, // Vendor reported lower taxable amount!
    gstr2bReportedCGST: 0,
    gstr2bReportedSGST: 0,
    gstr2bReportedIGST: 14200, // Short reported by ₹3,080!
    gstr2bReportedTotalTax: 14200,
    gstr2bFilingDate: '2026-10-26',
    reconciliationStatus: 'AMOUNT_MISMATCH',
    itcEligibility: 'DISCREPANCY_FLAGGED',
    itcClaimableAmount: 14200,
    discrepancyReason: 'Vendor GSTR-1 filed ₹14,200 IGST, but physical purchase invoice claims ₹17,280. Difference of ₹3,080 requires vendor GSTR-1 amendment in November cycle.',
    reviewedBy: 'Priyanka Rao, CA',
    reviewedAt: '2026-10-27T14:15:00Z'
  },
  // SCENARIO C GST Record (Associated with 3-way match mismatch)
  {
    id: 'gst-rec-003',
    period: '2026-10',
    invoiceId: 'inv-2026-9042',
    invoiceNumber: 'INV-2026-9042',
    invoiceDate: '2026-10-22',
    vendorId: 'ven-001',
    vendorName: 'Apex Electrical Components (P) Ltd',
    vendorGstin: '29AAACA9812E1Z1',
    posState: 'Karnataka',
    isInterState: false,
    hsnCode: '85059000',
    taxableValue: 45000,
    calculatedCGST: 4050,
    calculatedSGST: 4050,
    calculatedIGST: 0,
    calculatedTotalTax: 8100,
    reconciliationStatus: 'AMOUNT_MISMATCH',
    itcEligibility: 'UNDER_REVIEW',
    itcClaimableAmount: 6885, // Only for 85 accepted units (85 * 450 * 18% = ₹6,885)
    discrepancyReason: 'Invoice is under 3-way quantity dispute (100 billed vs 85 received). ITC restricted to accepted portion pending vendor credit note.'
  }
];

// --- SEED AUDIT EVENTS ---
export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'audit-001',
    timestamp: '2026-10-28T08:00:00Z',
    userId: 'usr-sys',
    userName: 'ForgeFlow Inventory Monitor',
    userRole: 'BUSINESS_OWNER',
    action: 'LOW_STOCK_DETECTED',
    entityType: 'ALERT',
    entityId: 'alert-cw-102-wh-blr-01',
    entityRef: 'CW-102',
    details: 'Available stock (35 kg) fell below configured minimum threshold (100 kg) at Peenya Central Warehouse.',
    previousValue: 'Available: 50 kg',
    newValue: 'Available: 35 kg (Alert Triggered)'
  },
  {
    id: 'audit-002',
    timestamp: '2026-10-22T16:05:00Z',
    userId: 'usr-sys',
    userName: 'Three-Way Matching Engine',
    userRole: 'FINANCE_MANAGER',
    action: 'MATCH_DISCREPANCY_FLAGGED',
    entityType: 'MATCH',
    entityId: 'match-inv-2026-9042',
    entityRef: 'INV-2026-9042',
    details: 'Invoice billed 100 units against accepted GRN of 85 units for SC-301. Automated payment hold placed.',
    previousValue: 'PaymentStatus: AWAITING_MATCH',
    newValue: 'PaymentStatus: DISCREPANCY_HOLD'
  },
  {
    id: 'audit-003',
    timestamp: '2026-10-21T14:35:00Z',
    userId: 'usr-3',
    userName: 'Basavaraj K',
    userRole: 'WAREHOUSE_OPERATOR',
    action: 'GRN_SHORTAGE_RECORDED',
    entityType: 'GRN',
    entityId: 'grn-2026-0421',
    entityRef: 'GRN-2026-0421',
    details: 'Received 85 units against PO-2026-0812 (100 ordered). Retained 15 units outstanding balance on PO.',
    previousValue: 'Accepted: 0, Outstanding: 100',
    newValue: 'Accepted: 85, Outstanding: 15'
  },
  {
    id: 'audit-004',
    timestamp: '2026-10-18T16:00:00Z',
    userId: 'usr-1',
    userName: 'Rajesh Sharma',
    userRole: 'BUSINESS_OWNER',
    action: 'PO_APPROVED',
    entityType: 'PO',
    entityId: 'po-2026-0815',
    entityRef: 'PO-2026-0815',
    details: 'Purchase order approved for Vanguard Copper Strips (150m Busbar, ₹1,13,280 incl. IGST).',
    previousValue: 'Status: PENDING_APPROVAL',
    newValue: 'Status: APPROVED'
  },
  {
    id: 'audit-005',
    timestamp: '2026-10-15T11:30:00Z',
    userId: 'usr-2',
    userName: 'Ananya Hegde',
    userRole: 'PROCUREMENT_MANAGER',
    action: 'PO_APPROVED',
    entityType: 'PO',
    entityId: 'po-2026-0812',
    entityRef: 'PO-2026-0812',
    details: 'Purchase order created and approved for Apex Electricals (100 nos Solenoid Coils, ₹53,100).',
    previousValue: 'Status: DRAFT',
    newValue: 'Status: APPROVED'
  }
];
