import rawData from './dataset.json';
import { FullDataset, Manufacturer, VendorRecord, PurchaseRecord, InventoryRecord, GSTReconciliationRecord } from '../types/dataset';

export const initialDataset: FullDataset = rawData as FullDataset;

export const rawManufacturers: Manufacturer[] = initialDataset.manufacturers;
export const rawVendors: VendorRecord[] = initialDataset.vendors;
export const rawPurchases: PurchaseRecord[] = initialDataset.purchases;
export const rawInventory: InventoryRecord[] = initialDataset.inventory;
export const rawGSTReconciliation: GSTReconciliationRecord[] = initialDataset.gstReconciliation;
