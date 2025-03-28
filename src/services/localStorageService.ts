
import { Storage } from '@capacitor/storage';
import { 
  Material, 
  Sale, 
  BOQ, 
  Production, 
  StockMovement, 
  Customer 
} from '@/types';

// Keys for storage
const STORAGE_KEYS = {
  MATERIALS: 'materials',
  SALES: 'sales',
  BOQS: 'boqs',
  PRODUCTIONS: 'productions',
  STOCK_MOVEMENTS: 'stockMovements',
  CUSTOMERS: 'customers'
};

// Get all materials
export const getMaterials = async (): Promise<Material[]> => {
  const { value } = await Storage.get({ key: STORAGE_KEYS.MATERIALS });
  return value ? JSON.parse(value) : [];
};

// Save materials
export const saveMaterials = async (materials: Material[]): Promise<void> => {
  await Storage.set({
    key: STORAGE_KEYS.MATERIALS,
    value: JSON.stringify(materials)
  });
};

// Get all sales
export const getSales = async (): Promise<Sale[]> => {
  const { value } = await Storage.get({ key: STORAGE_KEYS.SALES });
  return value ? JSON.parse(value) : [];
};

// Save sales
export const saveSales = async (sales: Sale[]): Promise<void> => {
  await Storage.set({
    key: STORAGE_KEYS.SALES,
    value: JSON.stringify(sales)
  });
};

// Get all BOQs
export const getBOQs = async (): Promise<BOQ[]> => {
  const { value } = await Storage.get({ key: STORAGE_KEYS.BOQS });
  return value ? JSON.parse(value) : [];
};

// Save BOQs
export const saveBOQs = async (boqs: BOQ[]): Promise<void> => {
  await Storage.set({
    key: STORAGE_KEYS.BOQS,
    value: JSON.stringify(boqs)
  });
};

// Get all productions
export const getProductions = async (): Promise<Production[]> => {
  const { value } = await Storage.get({ key: STORAGE_KEYS.PRODUCTIONS });
  return value ? JSON.parse(value) : [];
};

// Save productions
export const saveProductions = async (productions: Production[]): Promise<void> => {
  await Storage.set({
    key: STORAGE_KEYS.PRODUCTIONS,
    value: JSON.stringify(productions)
  });
};

// Get all stock movements
export const getStockMovements = async (): Promise<StockMovement[]> => {
  const { value } = await Storage.get({ key: STORAGE_KEYS.STOCK_MOVEMENTS });
  return value ? JSON.parse(value) : [];
};

// Save stock movements
export const saveStockMovements = async (stockMovements: StockMovement[]): Promise<void> => {
  await Storage.set({
    key: STORAGE_KEYS.STOCK_MOVEMENTS,
    value: JSON.stringify(stockMovements)
  });
};

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  const { value } = await Storage.get({ key: STORAGE_KEYS.CUSTOMERS });
  return value ? JSON.parse(value) : [];
};

// Save customers
export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  await Storage.set({
    key: STORAGE_KEYS.CUSTOMERS,
    value: JSON.stringify(customers)
  });
};

// Initialize storage with mock data
export const initializeStorage = async (
  materials: Material[], 
  sales: Sale[], 
  boqs: BOQ[], 
  productions: Production[], 
  stockMovements: StockMovement[], 
  customers: Customer[]
): Promise<void> => {
  const materialsExists = await Storage.get({ key: STORAGE_KEYS.MATERIALS });
  
  if (!materialsExists.value) {
    await saveMaterials(materials);
    await saveSales(sales);
    await saveBOQs(boqs);
    await saveProductions(productions);
    await saveStockMovements(stockMovements);
    await saveCustomers(customers);
    console.log('Local storage initialized with mock data');
  }
};
