
import { 
  Material, 
  Sale, 
  BOQ, 
  Production, 
  StockMovement,
  Customer,
  DashboardSummary,
  Status
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Generate random date within the last 30 days
const getRandomDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Materials mock data
export const materials: Material[] = [
  {
    id: uuidv4(),
    name: 'Cement',
    currentQuantity: 150,
    minQuantity: 50,
    unit: 'bags',
    pricePerUnit: 7.5,
    lastUpdated: getRandomDate(),
    category: 'Construction'
  },
  {
    id: uuidv4(),
    name: 'Steel Bars',
    currentQuantity: 300,
    minQuantity: 100,
    unit: 'pcs',
    pricePerUnit: 15,
    lastUpdated: getRandomDate(),
    category: 'Construction'
  },
  {
    id: uuidv4(),
    name: 'Paint',
    currentQuantity: 45,
    minQuantity: 20,
    unit: 'gallons',
    pricePerUnit: 25,
    lastUpdated: getRandomDate(),
    category: 'Finishing'
  },
  {
    id: uuidv4(),
    name: 'Bricks',
    currentQuantity: 2500,
    minQuantity: 1000,
    unit: 'pcs',
    pricePerUnit: 0.75,
    lastUpdated: getRandomDate(),
    category: 'Construction'
  },
  {
    id: uuidv4(),
    name: 'Timber',
    currentQuantity: 120,
    minQuantity: 50,
    unit: 'boards',
    pricePerUnit: 35,
    lastUpdated: getRandomDate(),
    category: 'Construction'
  },
  {
    id: uuidv4(),
    name: 'Sand',
    currentQuantity: 18,
    minQuantity: 20,
    unit: 'cubic meters',
    pricePerUnit: 45,
    lastUpdated: getRandomDate(),
    category: 'Construction'
  },
  {
    id: uuidv4(),
    name: 'Gravel',
    currentQuantity: 25,
    minQuantity: 15,
    unit: 'cubic meters',
    pricePerUnit: 50,
    lastUpdated: getRandomDate(),
    category: 'Construction'
  },
  {
    id: uuidv4(),
    name: 'Tiles',
    currentQuantity: 750,
    minQuantity: 200,
    unit: 'boxes',
    pricePerUnit: 30,
    lastUpdated: getRandomDate(),
    category: 'Finishing'
  },
  {
    id: uuidv4(),
    name: 'PVC Pipes',
    currentQuantity: 180,
    minQuantity: 50,
    unit: 'pcs',
    pricePerUnit: 12,
    lastUpdated: getRandomDate(),
    category: 'Plumbing'
  },
  {
    id: uuidv4(),
    name: 'Electrical Wires',
    currentQuantity: 500,
    minQuantity: 200,
    unit: 'meters',
    pricePerUnit: 2.5,
    lastUpdated: getRandomDate(),
    category: 'Electrical'
  },
];

// Customers mock data
export const customers: Customer[] = [
  {
    id: uuidv4(),
    name: 'ABC Construction Co.',
    contact: '555-1234',
    address: '123 Builder St, Construction City'
  },
  {
    id: uuidv4(),
    name: 'XYZ Developers',
    contact: '555-5678',
    address: '456 Developer Ave, Tech Town'
  },
  {
    id: uuidv4(),
    name: 'Acme Building Supplies',
    contact: '555-9012',
    address: '789 Supply Rd, Warehouse District'
  },
  {
    id: uuidv4(),
    name: 'City Housing Authority',
    contact: '555-3456',
    address: '101 Government Blvd, City Center'
  }
];

// Generate Sales
const statuses: Status[] = ['PENDING', 'COMPLETED', 'CANCELLED'];
export const sales: Sale[] = [];

for (let i = 0; i < 15; i++) {
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const itemCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let totalAmount = 0;
  
  for (let j = 0; j < itemCount; j++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const quantity = Math.floor(Math.random() * 20) + 1;
    const totalPrice = quantity * material.pricePerUnit;
    totalAmount += totalPrice;
    
    items.push({
      id: uuidv4(),
      materialId: material.id,
      materialName: material.name,
      quantity,
      unitPrice: material.pricePerUnit,
      totalPrice
    });
  }
  
  sales.push({
    id: uuidv4(),
    orderNumber: `SO-${1000 + i}`,
    customerId: customer.id,
    customerName: customer.name,
    date: getRandomDate(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    items,
    totalAmount,
    notes: i % 5 === 0 ? 'Priority order' : undefined
  });
}

// Generate BOQs
export const boqs: BOQ[] = [];

for (let i = 0; i < 8; i++) {
  const itemCount = Math.floor(Math.random() * 5) + 2;
  const items = [];
  let totalAmount = 0;
  
  for (let j = 0; j < itemCount; j++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const quantity = Math.floor(Math.random() * 50) + 10;
    const wastageFactor = Math.random() * 0.1 + 1.05; // 5% to 15% wastage
    const totalPrice = quantity * material.pricePerUnit * wastageFactor;
    totalAmount += totalPrice;
    
    items.push({
      id: uuidv4(),
      materialId: material.id,
      materialName: material.name,
      quantity,
      unit: material.unit,
      unitPrice: material.pricePerUnit,
      totalPrice,
      wastageFactor
    });
  }
  
  boqs.push({
    id: uuidv4(),
    projectName: `Project ${String.fromCharCode(65 + i)}`,
    date: getRandomDate(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    items,
    totalAmount,
    notes: i % 3 === 0 ? 'High priority project' : undefined
  });
}

// Generate Productions
export const productions: Production[] = [];

for (let i = 0; i < 10; i++) {
  const materialCount = Math.floor(Math.random() * 4) + 2;
  const productionMaterials = [];
  
  for (let j = 0; j < materialCount; j++) {
    const material = materials[Math.floor(Math.random() * materials.length)];
    const plannedQuantity = Math.floor(Math.random() * 30) + 5;
    const actualQuantity = i % 3 === 0 ? undefined : plannedQuantity + Math.floor(Math.random() * 6) - 3;
    
    productionMaterials.push({
      id: uuidv4(),
      materialId: material.id,
      materialName: material.name,
      plannedQuantity,
      actualQuantity,
      unit: material.unit
    });
  }
  
  const startDate = getRandomDate();
  const status: Status = i % 4 === 0 ? 'PENDING' : i % 3 === 0 ? 'IN_PROGRESS' : 'COMPLETED';
  let endDate;
  
  if (status === 'COMPLETED') {
    const endDateObj = new Date(startDate);
    endDateObj.setDate(endDateObj.getDate() + Math.floor(Math.random() * 7) + 1);
    endDate = endDateObj.toISOString();
  }
  
  productions.push({
    id: uuidv4(),
    productionNumber: `PO-${2000 + i}`,
    description: `Production batch ${i + 1}`,
    startDate,
    endDate,
    status,
    materials: productionMaterials,
    notes: i % 5 === 0 ? 'Quality inspection required' : undefined
  });
}

// Generate Stock Movements
export const stockMovements: StockMovement[] = [];

// Add some receipt movements
for (let i = 0; i < 20; i++) {
  const material = materials[Math.floor(Math.random() * materials.length)];
  const quantity = Math.floor(Math.random() * 50) + 10;
  
  stockMovements.push({
    id: uuidv4(),
    materialId: material.id,
    materialName: material.name,
    type: 'RECEIPT',
    quantity,
    beforeQuantity: material.currentQuantity - quantity,
    afterQuantity: material.currentQuantity,
    date: getRandomDate(),
    notes: 'Regular stock delivery'
  });
}

// Add some sale movements
for (let i = 0; i < 15; i++) {
  const sale = sales[i % sales.length];
  if (sale.status === 'COMPLETED') {
    for (const item of sale.items) {
      const material = materials.find(m => m.id === item.materialId);
      if (material) {
        stockMovements.push({
          id: uuidv4(),
          materialId: material.id,
          materialName: material.name,
          type: 'SALE',
          quantity: -item.quantity, // Negative for outgoing
          beforeQuantity: material.currentQuantity + item.quantity,
          afterQuantity: material.currentQuantity,
          date: sale.date,
          referenceId: sale.id,
          notes: `Sale Order: ${sale.orderNumber}`
        });
      }
    }
  }
}

// Add some production consumption movements
for (let i = 0; i < 10; i++) {
  const production = productions[i];
  if (production.status === 'COMPLETED' || production.status === 'IN_PROGRESS') {
    for (const prodMaterial of production.materials) {
      if (prodMaterial.actualQuantity) {
        const material = materials.find(m => m.id === prodMaterial.materialId);
        if (material) {
          stockMovements.push({
            id: uuidv4(),
            materialId: material.id,
            materialName: material.name,
            type: 'PRODUCTION_CONSUMPTION',
            quantity: -prodMaterial.actualQuantity, // Negative for consumption
            beforeQuantity: material.currentQuantity + prodMaterial.actualQuantity,
            afterQuantity: material.currentQuantity,
            date: production.startDate,
            referenceId: production.id,
            notes: `Production: ${production.productionNumber}`
          });
        }
      }
    }
  }
}

// Calculate dashboard summary
export const getDashboardSummary = (): DashboardSummary => {
  // Materials summary
  const totalItems = materials.length;
  const totalValue = materials.reduce((sum, material) => 
    sum + (material.currentQuantity * material.pricePerUnit), 0);
  const lowStockItems = materials.filter(m => m.currentQuantity <= m.minQuantity).length;

  // Sales summary
  const totalSales = sales.length;
  const pendingSales = sales.filter(s => s.status === 'PENDING').length;
  const completedSales = sales.filter(s => s.status === 'COMPLETED').length;
  const cancelledSales = sales.filter(s => s.status === 'CANCELLED').length;
  const totalRevenue = sales
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, sale) => sum + sale.totalAmount, 0);

  // Production summary
  const totalProductions = productions.length;
  const inProgressProductions = productions.filter(p => p.status === 'IN_PROGRESS').length;
  const completedProductions = productions.filter(p => p.status === 'COMPLETED').length;
  const cancelledProductions = productions.filter(p => p.status === 'CANCELLED').length;

  return {
    materials: {
      totalItems,
      totalValue,
      lowStockItems
    },
    sales: {
      totalSales,
      pendingSales,
      completedSales,
      cancelledSales,
      totalRevenue
    },
    production: {
      totalProductions,
      inProgressProductions,
      completedProductions,
      cancelledProductions
    }
  };
};

// Mock service API functions
export const getMaterialById = (id: string): Material | undefined => {
  return materials.find(material => material.id === id);
};

export const getSaleById = (id: string): Sale | undefined => {
  return sales.find(sale => sale.id === id);
};

export const getBOQById = (id: string): BOQ | undefined => {
  return boqs.find(boq => boq.id === id);
};

export const getProductionById = (id: string): Production | undefined => {
  return productions.find(production => production.id === id);
};

export const getStockMovementsForMaterial = (materialId: string): StockMovement[] => {
  return stockMovements.filter(movement => movement.materialId === materialId);
};

export const getLowStockMaterials = (): Material[] => {
  return materials.filter(material => material.currentQuantity <= material.minQuantity);
};

export const getSalesByDateRange = (startDate: string, endDate: string): Sale[] => {
  return sales.filter(sale => {
    const saleDate = new Date(sale.date);
    return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
  });
};
