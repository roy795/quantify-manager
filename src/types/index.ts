
// Common types
export type Status = 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
export type MovementType = 'RECEIPT' | 'PRODUCTION_CONSUMPTION' | 'SALE' | 'RETURN' | 'ADJUSTMENT';

// Material management
export interface Material {
  id: string;
  name: string;
  currentQuantity: number;
  minQuantity: number;
  unit: string;
  pricePerUnit: number;
  lastUpdated: string; // ISO date string
  category?: string;
}

// Sales management
export interface Customer {
  id: string;
  name: string;
  contact: string;
  address?: string;
}

export interface SaleItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  date: string; // ISO date string
  status: Status;
  items: SaleItem[];
  totalAmount: number;
  notes?: string;
}

// BOQ (Bill of Quantities) Management
export interface BOQItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  wastageFactor: number;
}

export interface BOQ {
  id: string;
  projectName: string;
  date: string; // ISO date string
  status: Status;
  items: BOQItem[];
  totalAmount: number;
  notes?: string;
}

// Production Management
export interface ProductionMaterial {
  id: string;
  materialId: string;
  materialName: string;
  plannedQuantity: number;
  actualQuantity?: number;
  unit: string;
}

export interface Production {
  id: string;
  productionNumber: string;
  description: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string
  status: Status;
  materials: ProductionMaterial[];
  notes?: string;
}

// Stock Movement Tracking
export interface StockMovement {
  id: string;
  materialId: string;
  materialName: string;
  type: MovementType;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  date: string; // ISO date string
  referenceId?: string; // Reference to related entity (sale id, production id, etc.)
  notes?: string;
}

// Analytics
export interface MaterialValueSummary {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
}

export interface SalesSummary {
  totalSales: number;
  pendingSales: number;
  completedSales: number;
  cancelledSales: number;
  totalRevenue: number;
}

export interface ProductionSummary {
  totalProductions: number;
  inProgressProductions: number;
  completedProductions: number;
  cancelledProductions: number;
}

export interface DashboardSummary {
  materials: MaterialValueSummary;
  sales: SalesSummary;
  production: ProductionSummary;
}
