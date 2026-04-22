export type AppAction = 'read' | 'write' | 'edit' | 'delete' | 'export' | 'approve';
export type AppModule = 
  | 'dashboard' 
  | 'users' 
  | 'employees' 
  | 'inventory' 
  | 'livestock' 
  | 'agriculture' 
  | 'finance' 
  | 'audit' 
  | 'customers' 
  | 'partners' 
  | 'farmers' 
  | 'investors'
  | 'documents'
  | 'products';

export interface Permission {
  module: AppModule;
  actions: AppAction[];
}

export type UserRole = 
  | 'super_admin' 
  | 'investor' 
  | 'group_ceo' 
  | 'coo_cto' 
  | 'hrd' 
  | 'niaga' 
  | 'peternakan' 
  | 'pertanian' 
  | 'viewer';

export interface Hierarchy {
  grup: string;
  perusahaan: string;
  divisi: string;
  subDivisi?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  hierarchy: Hierarchy;
  permissions?: Permission[]; // Specific overrides if any
  status: 'active' | 'suspended';
  createdAt: any;
  lastLogin?: any;
  createdBy?: string; // UID of creator
  mfaEnabled: boolean;
}

export interface Employee {
  id: string;
  fullName: string;
  email: string;
  department: 'HR' | 'Niaga' | 'Peternakan' | 'Pertanian' | 'Finance' | 'IT';
  position: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'resigned' | 'on-leave';
  attendance?: {
    date: string;
    checkIn: string;
    checkOut?: string;
  }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  category: 'Livestock' | 'Agriculture' | 'Retail' | 'Equipment' | 'Product';
  location: string;
  warehouseId?: string;
  minStockThreshold: number;
  unit: string;
  productId?: string;
}

export interface StockBatch {
  id: string;
  itemId: string;
  initialQuantity: number;
  currentQuantity: number;
  costPrice: number;
  receivedAt: any;
  expiryDate?: any;
  batchCode: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number;
  type: 'Cold' | 'Dry' | 'General';
  status: 'active' | 'inactive';
  manager?: string;
  phoneNumber?: string;
  description?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  sku: string;
  itemName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  quantity: number;
  from?: string; // warehouse name or external
  to?: string;   // warehouse name or external
  reason: string;
  recordedBy: string;
  timestamp: any;
}

export interface Livestock {
  id: string;
  type: string; // e.g., Cattle, Chicken, Sheep
  quantity: number;
  weight: number;
  healthStatus: 'Healthy' | 'Sick' | 'Under-Treatment';
  feedStock: number;
  lastCheckup: string;
  notes: string;
}

export interface Agriculture {
  id: string;
  commodity: string;
  seedsStock: number;
  landArea: number;
  landCondition: string;
  plantingSchedule: string;
  harvestEstimateDate: string;
  expectedYield: number;
}

export interface ProductGroup {
  id: string; // group_id
  code: string; // PTRK, PRTN, OLHN, RSLR
  name: string;
  description: string;
  isActive: boolean;
}

export interface ProductCategory {
  id: string; // category_id
  groupId: string;
  parentCategoryId: string | null;
  code: string;
  name: string;
  level: 1 | 2;
  isActive: boolean;
}

export interface Product {
  id: string;
  groupId: string;
  categoryId: string;
  sku: string;
  name: string;
  description: string;
  category: 'Animal' | 'Plant' | 'Processed'; // Legacy or specific classification
  price: number;
  specifications: string;
  origin: string;
  imageUrl: string;
  isPublic: boolean;
  unit: string; // e.g., kg, ekor, liter
}

export interface CompanyDocument {
  id: string;
  title: string;
  category: 'SOP' | 'Report' | 'Legal' | 'Financial' | 'Other';
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  createdAt: any;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  priority: 'low' | 'medium' | 'high';
  recipientRole?: UserRole;
  recipientUid?: string;
  isRead: boolean;
  createdAt: any;
}

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  division: 'Peternakan' | 'Pertanian' | 'Niaga' | 'Corporate';
  amount: number;
  category: string;
  description: string;
  date: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  details: string;
  timestamp: any;
  ipAddress?: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  segment: 'B2C' | 'B2B' | 'Distributor' | 'Ekspor' | 'Impor';
  interestedProducts: string;
  buyingFrequency: string;
  status: 'active' | 'lead' | 'inactive';
}

export interface Partner {
  id: string;
  name: string;
  partnerType: string;
  pic: string;
  scopeOfCooperation: string;
  status: 'active' | 'potential' | 'expired';
}

export interface Farmer {
  id: string;
  name: string;
  village: string;
  regency: string;
  landArea: number;
  commodity: string;
  harvestEstimate: string;
  status: 'active' | 'prospect';
}

export interface Investor {
  id: string;
  name: string;
  investorType: 'Individual' | 'Institutional' | 'VC' | 'Angel';
  institution: string;
  investmentValue: number;
  focusArea: string;
  status: 'active' | 'potential' | 'committed';
}
