
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
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
import * as localStorageService from '@/services/localStorageService';
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
  
  // Loading state
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [boqs, setBOQs] = useState<BOQ[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();

  // Initialize data from local storage
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize storage with mock data if it's empty
        await localStorageService.initializeStorage(
          initialMaterials,
          initialSales,
          initialBOQs,
          initialProductions,
          initialStockMovements,
          initialCustomers
        );
        
        // Load data from storage
        const storedMaterials = await localStorageService.getMaterials();
        const storedSales = await localStorageService.getSales();
        const storedBOQs = await localStorageService.getBOQs();
        const storedProductions = await localStorageService.getProductions();
        const storedStockMovements = await localStorageService.getStockMovements();
        const storedCustomers = await localStorageService.getCustomers();
        
        setMaterials(storedMaterials);
        setSales(storedSales);
        setBOQs(storedBOQs);
        setProductions(storedProductions);
        setStockMovements(storedStockMovements);
        setCustomers(storedCustomers);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Data Loading Error",
          description: "Could not load data from storage. Using default data.",
          variant: "destructive"
        });
        
        // Fall back to mock data if loading fails
        setMaterials(initialMaterials);
        setSales(initialSales);
        setBOQs(initialBOQs);
        setProductions(initialProductions);
        setStockMovements(initialStockMovements);
        setCustomers(initialCustomers);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Material Management
  const addMaterial = async (material: Omit<Material, 'id' | 'lastUpdated'>) => {
    const newMaterial: Material = {
      ...material,
      id: uuidv4(),
      lastUpdated: new Date().toISOString()
    };
    
    const updatedMaterials = [...materials, newMaterial];
    setMaterials(updatedMaterials);
    
    // Save to storage
    try {
      await localStorageService.saveMaterials(updatedMaterials);
      toast({
        title: "Material Added",
        description: `${newMaterial.name} has been added to inventory.`
      });
    } catch (error) {
      console.error('Error saving material:', error);
      toast({
        title: "Save Error",
        description: "Could not save material to storage.",
        variant: "destructive"
      });
    }
  };

  const updateMaterial = async (material: Material) => {
    const updatedMaterial = {
      ...material,
      lastUpdated: new Date().toISOString()
    };
    
    const updatedMaterials = materials.map(m => 
      m.id === material.id ? updatedMaterial : m
    );
    
    setMaterials(updatedMaterials);
    
    // Save to storage
    try {
      await localStorageService.saveMaterials(updatedMaterials);
      toast({
        title: "Material Updated",
        description: `${material.name} has been updated.`
      });
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: "Update Error",
        description: "Could not update material in storage.",
        variant: "destructive"
      });
    }
  };

  const deleteMaterial = async (id: string) => {
    const material = materials.find(m => m.id === id);
    if (material) {
      const updatedMaterials = materials.filter(m => m.id !== id);
      setMaterials(updatedMaterials);
      
      // Save to storage
      try {
        await localStorageService.saveMaterials(updatedMaterials);
        toast({
          title: "Material Deleted",
          description: `${material.name} has been removed.`
        });
      } catch (error) {
        console.error('Error deleting material:', error);
        toast({
          title: "Delete Error",
          description: "Could not delete material from storage.",
          variant: "destructive"
        });
      }
    }
  };

  // Sales Management
  const addSale = async (sale: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...sale,
      id: uuidv4()
    };
    
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    
    // Save to storage
    try {
      await localStorageService.saveSales(updatedSales);
      
      // Record stock movements for completed sales
      if (newSale.status === 'COMPLETED') {
        for (const item of newSale.items) {
          await recordStockMovement(
            item.materialId,
            -item.quantity, // Negative for outgoing
            'SALE',
            newSale.id,
            `Sale Order: ${newSale.orderNumber}`
          );
        }
      }
      
      toast({
        title: "Sale Created",
        description: `Sale order ${newSale.orderNumber} has been created.`
      });
    } catch (error) {
      console.error('Error saving sale:', error);
      toast({
        title: "Save Error",
        description: "Could not save sale to storage.",
        variant: "destructive"
      });
    }
  };

  const updateSale = async (sale: Sale) => {
    const updatedSales = sales.map(s => s.id === sale.id ? sale : s);
    setSales(updatedSales);
    
    // Save to storage
    try {
      await localStorageService.saveSales(updatedSales);
      toast({
        title: "Sale Updated",
        description: `Sale order ${sale.orderNumber} has been updated.`
      });
    } catch (error) {
      console.error('Error updating sale:', error);
      toast({
        title: "Update Error",
        description: "Could not update sale in storage.",
        variant: "destructive"
      });
    }
  };

  const deleteSale = async (id: string) => {
    const sale = sales.find(s => s.id === id);
    if (sale) {
      const updatedSales = sales.filter(s => s.id !== id);
      setSales(updatedSales);
      
      // Save to storage
      try {
        await localStorageService.saveSales(updatedSales);
        toast({
          title: "Sale Deleted",
          description: `Sale order ${sale.orderNumber} has been deleted.`
        });
      } catch (error) {
        console.error('Error deleting sale:', error);
        toast({
          title: "Delete Error",
          description: "Could not delete sale from storage.",
          variant: "destructive"
        });
      }
    }
  };

  // BOQ Management
  const addBOQ = async (boq: Omit<BOQ, 'id'>) => {
    const newBOQ: BOQ = {
      ...boq,
      id: uuidv4()
    };
    
    const updatedBOQs = [...boqs, newBOQ];
    setBOQs(updatedBOQs);
    
    // Save to storage
    try {
      await localStorageService.saveBOQs(updatedBOQs);
      toast({
        title: "BOQ Created",
        description: `BOQ for ${newBOQ.projectName} has been created.`
      });
    } catch (error) {
      console.error('Error saving BOQ:', error);
      toast({
        title: "Save Error",
        description: "Could not save BOQ to storage.",
        variant: "destructive"
      });
    }
  };

  const updateBOQ = async (boq: BOQ) => {
    const updatedBOQs = boqs.map(b => b.id === boq.id ? boq : b);
    setBOQs(updatedBOQs);
    
    // Save to storage
    try {
      await localStorageService.saveBOQs(updatedBOQs);
      toast({
        title: "BOQ Updated",
        description: `BOQ for ${boq.projectName} has been updated.`
      });
    } catch (error) {
      console.error('Error updating BOQ:', error);
      toast({
        title: "Update Error",
        description: "Could not update BOQ in storage.",
        variant: "destructive"
      });
    }
  };

  const deleteBOQ = async (id: string) => {
    const boq = boqs.find(b => b.id === id);
    if (boq) {
      const updatedBOQs = boqs.filter(b => b.id !== id);
      setBOQs(updatedBOQs);
      
      // Save to storage
      try {
        await localStorageService.saveBOQs(updatedBOQs);
        toast({
          title: "BOQ Deleted",
          description: `BOQ for ${boq.projectName} has been deleted.`
        });
      } catch (error) {
        console.error('Error deleting BOQ:', error);
        toast({
          title: "Delete Error",
          description: "Could not delete BOQ from storage.",
          variant: "destructive"
        });
      }
    }
  };

  // Production Management
  const addProduction = async (production: Omit<Production, 'id'>) => {
    const newProduction: Production = {
      ...production,
      id: uuidv4()
    };
    
    const updatedProductions = [...productions, newProduction];
    setProductions(updatedProductions);
    
    // Save to storage
    try {
      await localStorageService.saveProductions(updatedProductions);
      
      // Record stock movements for materials in production
      if (newProduction.status === 'COMPLETED' || newProduction.status === 'IN_PROGRESS') {
        for (const prodMaterial of newProduction.materials) {
          if (prodMaterial.actualQuantity) {
            await recordStockMovement(
              prodMaterial.materialId,
              -prodMaterial.actualQuantity, // Negative for consumption
              'PRODUCTION_CONSUMPTION',
              newProduction.id,
              `Production: ${newProduction.productionNumber}`
            );
          }
        }
      }
      
      toast({
        title: "Production Created",
        description: `Production order ${newProduction.productionNumber} has been created.`
      });
    } catch (error) {
      console.error('Error saving production:', error);
      toast({
        title: "Save Error",
        description: "Could not save production to storage.",
        variant: "destructive"
      });
    }
  };

  const updateProduction = async (production: Production) => {
    const updatedProductions = productions.map(p => p.id === production.id ? production : p);
    setProductions(updatedProductions);
    
    // Save to storage
    try {
      await localStorageService.saveProductions(updatedProductions);
      toast({
        title: "Production Updated",
        description: `Production order ${production.productionNumber} has been updated.`
      });
    } catch (error) {
      console.error('Error updating production:', error);
      toast({
        title: "Update Error",
        description: "Could not update production in storage.",
        variant: "destructive"
      });
    }
  };

  const deleteProduction = async (id: string) => {
    const production = productions.find(p => p.id === id);
    if (production) {
      const updatedProductions = productions.filter(p => p.id !== id);
      setProductions(updatedProductions);
      
      // Save to storage
      try {
        await localStorageService.saveProductions(updatedProductions);
        toast({
          title: "Production Deleted",
          description: `Production order ${production.productionNumber} has been deleted.`
        });
      } catch (error) {
        console.error('Error deleting production:', error);
        toast({
          title: "Delete Error",
          description: "Could not delete production from storage.",
          variant: "destructive"
        });
      }
    }
  };

  // Stock Movement
  const recordStockMovement = async (
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
    
    const updatedStockMovements = [...stockMovements, newMovement];
    setStockMovements(updatedStockMovements);
    
    // Save to storage
    try {
      await localStorageService.saveStockMovements(updatedStockMovements);
      
      // Update material quantity
      await updateMaterial({
        ...material,
        currentQuantity: afterQuantity
      });
    } catch (error) {
      console.error('Error recording stock movement:', error);
      toast({
        title: "Error",
        description: "Could not record stock movement.",
        variant: "destructive"
      });
    }
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
    getProductionById,
    isLoading
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
