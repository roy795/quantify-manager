
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
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.MATERIALS });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting materials:', error);
    return [];
  }
};

// Save materials
export const saveMaterials = async (materials: Material[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.MATERIALS,
      value: JSON.stringify(materials)
    });
  } catch (error) {
    console.error('Error saving materials:', error);
  }
};

// Get all sales
export const getSales = async (): Promise<Sale[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.SALES });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting sales:', error);
    return [];
  }
};

// Save sales
export const saveSales = async (sales: Sale[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.SALES,
      value: JSON.stringify(sales)
    });
  } catch (error) {
    console.error('Error saving sales:', error);
  }
};

// Get all BOQs
export const getBOQs = async (): Promise<BOQ[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.BOQS });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting BOQs:', error);
    return [];
  }
};

// Save BOQs
export const saveBOQs = async (boqs: BOQ[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.BOQS,
      value: JSON.stringify(boqs)
    });
  } catch (error) {
    console.error('Error saving BOQs:', error);
  }
};

// Get all productions
export const getProductions = async (): Promise<Production[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.PRODUCTIONS });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting productions:', error);
    return [];
  }
};

// Save productions
export const saveProductions = async (productions: Production[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.PRODUCTIONS,
      value: JSON.stringify(productions)
    });
  } catch (error) {
    console.error('Error saving productions:', error);
  }
};

// Get all stock movements
export const getStockMovements = async (): Promise<StockMovement[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.STOCK_MOVEMENTS });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting stock movements:', error);
    return [];
  }
};

// Save stock movements
export const saveStockMovements = async (stockMovements: StockMovement[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.STOCK_MOVEMENTS,
      value: JSON.stringify(stockMovements)
    });
  } catch (error) {
    console.error('Error saving stock movements:', error);
  }
};

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const { value } = await Storage.get({ key: STORAGE_KEYS.CUSTOMERS });
    return value ? JSON.parse(value) : [];
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

// Save customers
export const saveCustomers = async (customers: Customer[]): Promise<void> => {
  try {
    await Storage.set({
      key: STORAGE_KEYS.CUSTOMERS,
      value: JSON.stringify(customers)
    });
  } catch (error) {
    console.error('Error saving customers:', error);
  }
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
  try {
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
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};
