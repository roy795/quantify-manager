
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Material,
  Sale,
  BOQ,
  Production,
  StockMovement,
  Customer,
  MovementType
} from '@/types';
import { 
  materials as initialMaterials,
  sales as initialSales,
  boqs as initialBOQs,
  productions as initialProductions,
  stockMovements as initialStockMovements,
  customers as initialCustomers
} from '@/services/mockData';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  // Data
  materials: Material[];
  sales: Sale[];
  boqs: BOQ[];
  productions: Production[];
  stockMovements: StockMovement[];
  customers: Customer[];
  
  // Material Management
  addMaterial: (material: Omit<Material, 'id' | 'lastUpdated'>) => void;
  updateMaterial: (material: Material) => void;
  deleteMaterial: (id: string) => void;
  
  // Sales Management
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  
  // BOQ Management
  addBOQ: (boq: Omit<BOQ, 'id'>) => void;
  updateBOQ: (boq: BOQ) => void;
  deleteBOQ: (id: string) => void;
  
  // Production Management
  addProduction: (production: Omit<Production, 'id'>) => void;
  updateProduction: (production: Production) => void;
  deleteProduction: (id: string) => void;
  
  // Stock Movement
  recordStockMovement: (
    materialId: string,
    quantity: number,
    type: MovementType,
    referenceId?: string,
    notes?: string
  ) => void;
  
  // Filtering and Queries
  getLowStockMaterials: () => Material[];
  getStockMovementsForMaterial: (materialId: string) => StockMovement[];
  getMaterialById: (id: string) => Material | undefined;
  getSaleById: (id: string) => Sale | undefined;
  getBOQById: (id: string) => BOQ | undefined;
  getProductionById: (id: string) => Production | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [boqs, setBOQs] = useState<BOQ[]>(initialBOQs);
  const [productions, setProductions] = useState<Production[]>(initialProductions);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  
  const { toast } = useToast();

  // Material Management
  const addMaterial = (material: Omit<Material, 'id' | 'lastUpdated'>) => {
    const newMaterial: Material = {
      ...material,
      id: uuidv4(),
      lastUpdated: new Date().toISOString()
    };
    setMaterials([...materials, newMaterial]);
    toast({
      title: "Material Added",
      description: `${newMaterial.name} has been added to inventory.`
    });
  };

  const updateMaterial = (material: Material) => {
    const updatedMaterial = {
      ...material,
      lastUpdated: new Date().toISOString()
    };
    setMaterials(materials.map(m => m.id === material.id ? updatedMaterial : m));
    toast({
      title: "Material Updated",
      description: `${material.name} has been updated.`
    });
  };

  const deleteMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (material) {
      setMaterials(materials.filter(m => m.id !== id));
      toast({
        title: "Material Deleted",
        description: `${material.name} has been removed.`
      });
    }
  };

  // Sales Management
  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: uuidv4()
    };
    setSales([...sales, newSale]);
    
    // Record stock movements for completed sales
    if (newSale.status === 'COMPLETED') {
      newSale.items.forEach(item => {
        recordStockMovement(
          item.materialId,
          -item.quantity, // Negative for outgoing
          'SALE',
          newSale.id,
          `Sale Order: ${newSale.orderNumber}`
        );
      });
    }
    
    toast({
      title: "Sale Created",
      description: `Sale order ${newSale.orderNumber} has been created.`
    });
  };

  const updateSale = (sale: Sale) => {
    setSales(sales.map(s => s.id === sale.id ? sale : s));
    toast({
      title: "Sale Updated",
      description: `Sale order ${sale.orderNumber} has been updated.`
    });
  };

  const deleteSale = (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      setSales(sales.filter(s => s.id !== id));
      toast({
        title: "Sale Deleted",
        description: `Sale order ${sale.orderNumber} has been deleted.`
      });
    }
  };

  // BOQ Management
  const addBOQ = (boq: Omit<BOQ, 'id'>) => {
    const newBOQ: BOQ = {
      ...boq,
      id: uuidv4()
    };
    setBOQs([...boqs, newBOQ]);
    toast({
      title: "BOQ Created",
      description: `BOQ for ${newBOQ.projectName} has been created.`
    });
  };

  const updateBOQ = (boq: BOQ) => {
    setBOQs(boqs.map(b => b.id === boq.id ? boq : b));
    toast({
      title: "BOQ Updated",
      description: `BOQ for ${boq.projectName} has been updated.`
    });
  };

  const deleteBOQ = (id: string) => {
    const boq = boqs.find(b => b.id === id);
    if (boq) {
      setBOQs(boqs.filter(b => b.id !== id));
      toast({
        title: "BOQ Deleted",
        description: `BOQ for ${boq.projectName} has been deleted.`
      });
    }
  };

  // Production Management
  const addProduction = (production: Omit<Production, 'id'>) => {
    const newProduction: Production = {
      ...production,
      id: uuidv4()
    };
    setProductions([...productions, newProduction]);
    
    // Record stock movements for materials in production
    if (newProduction.status === 'COMPLETED' || newProduction.status === 'IN_PROGRESS') {
      newProduction.materials.forEach(prodMaterial => {
        if (prodMaterial.actualQuantity) {
          recordStockMovement(
            prodMaterial.materialId,
            -prodMaterial.actualQuantity, // Negative for consumption
            'PRODUCTION_CONSUMPTION',
            newProduction.id,
            `Production: ${newProduction.productionNumber}`
          );
        }
      });
    }
    
    toast({
      title: "Production Created",
      description: `Production order ${newProduction.productionNumber} has been created.`
    });
  };

  const updateProduction = (production: Production) => {
    setProductions(productions.map(p => p.id === production.id ? production : p));
    toast({
      title: "Production Updated",
      description: `Production order ${production.productionNumber} has been updated.`
    });
  };

  const deleteProduction = (id: string) => {
    const production = productions.find(p => p.id === id);
    if (production) {
      setProductions(productions.filter(p => p.id !== id));
      toast({
        title: "Production Deleted",
        description: `Production order ${production.productionNumber} has been deleted.`
      });
    }
  };

  // Stock Movement
  const recordStockMovement = (
    materialId: string,
    quantity: number,
    type: MovementType,
    referenceId?: string,
    notes?: string
  ) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;
    
    const beforeQuantity = material.currentQuantity;
    const afterQuantity = material.currentQuantity + quantity;
    
    // Create stock movement record
    const newMovement: StockMovement = {
      id: uuidv4(),
      materialId,
      materialName: material.name,
      type,
      quantity,
      beforeQuantity,
      afterQuantity,
      date: new Date().toISOString(),
      referenceId,
      notes
    };
    
    setStockMovements([...stockMovements, newMovement]);
    
    // Update material quantity
    updateMaterial({
      ...material,
      currentQuantity: afterQuantity
    });
  };

  // Filtering and Queries
  const getLowStockMaterials = (): Material[] => {
    return materials.filter(material => material.currentQuantity <= material.minQuantity);
  };

  const getStockMovementsForMaterial = (materialId: string): StockMovement[] => {
    return stockMovements.filter(movement => movement.materialId === materialId);
  };

  const getMaterialById = (id: string): Material | undefined => {
    return materials.find(material => material.id === id);
  };

  const getSaleById = (id: string): Sale | undefined => {
    return sales.find(sale => sale.id === id);
  };

  const getBOQById = (id: string): BOQ | undefined => {
    return boqs.find(boq => boq.id === id);
  };

  const getProductionById = (id: string): Production | undefined => {
    return productions.find(production => production.id === id);
  };

  const value: DataContextType = {
    materials,
    sales,
    boqs,
    productions,
    stockMovements,
    customers,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addSale,
    updateSale,
    deleteSale,
    addBOQ,
    updateBOQ,
    deleteBOQ,
    addProduction,
    updateProduction,
    deleteProduction,
    recordStockMovement,
    getLowStockMaterials,
    getStockMovementsForMaterial,
    getMaterialById,
    getSaleById,
    getBOQById,
    getProductionById
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
