import { BuyerCompanyProfile, Warehouse, UserProfile } from '../types';

export const BUYER_COMPANY: BuyerCompanyProfile = {
  name: 'Kavach Electricals & Control Systems Pvt Ltd',
  gstin: '29AABCK1234F1Z5',
  state: 'Karnataka',
  stateCode: '29',
  address: 'Plot 48/B, Phase 2, Peenya Industrial Area, Bengaluru, Karnataka 560058',
  pan: 'AABCK1234F',
  contactEmail: 'procurement@kavachelectricals.com',
  phone: '+91 80 2839 4401'
};

export const WAREHOUSES: Warehouse[] = [
  {
    id: 'WH-BLR-01',
    code: 'BLR-MAIN',
    name: 'Peenya Central Warehouse (Bengaluru)',
    location: 'Plot 48/B, Phase 2, Peenya Industrial Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    capacitySqFt: 18500,
    managerName: 'Suresh Gowda'
  },
  {
    id: 'WH-BGV-02',
    code: 'BGV-HUB',
    name: 'Belagavi Industrial Estate Depot',
    location: 'Shed 12-A, Udyambag Industrial Estate',
    city: 'Belagavi',
    state: 'Karnataka',
    pincode: '590008',
    capacitySqFt: 11200,
    managerName: 'Mahesh Patil'
  }
];

export const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr-1',
    name: 'Rajesh Sharma',
    role: 'BUSINESS_OWNER',
    email: 'r.sharma@kavachelectricals.com'
  },
  {
    id: 'usr-2',
    name: 'Ananya Hegde',
    role: 'PROCUREMENT_MANAGER',
    email: 'a.hegde@kavachelectricals.com'
  },
  {
    id: 'usr-3',
    name: 'Basavaraj K',
    role: 'WAREHOUSE_OPERATOR',
    email: 'b.kumar@kavachelectricals.com'
  },
  {
    id: 'usr-4',
    name: 'Priyanka Rao, CA',
    role: 'FINANCE_MANAGER',
    email: 'p.rao@kavachelectricals.com'
  },
  {
    id: 'usr-5',
    name: 'K. Venkatesh',
    role: 'AUDITOR',
    email: 'v.auditor@external-advisory.in'
  }
];

export const MATCH_TOLERANCE_PCT = 0.5; // 0.5% commercial price tolerance
export const MATCH_TOLERANCE_AMT = 5.0; // ₹5 maximum rounding difference
