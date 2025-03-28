
import { useState } from "react";
import { useData } from "@/context/DataContext";
import DashboardCard from "@/components/DashboardCard";
import DataTable from "@/components/DataTable";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
} from "lucide-react";
import { format, subMonths, isWithinInterval, parseISO } from "date-fns";
import { StockMovement } from "@/types";

const COLORS = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12", "#9b59b6"];

const Analytics = () => {
  const { materials, sales, productions, stockMovements } = useData();
  
  const [dateRange, setDateRange] = useState({
    start: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd")
  });
  
  const [movementType, setMovementType] = useState("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };
  
  // Handle sort
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  
  // Filter movements by date range and type
  const filteredMovements = stockMovements
    .filter(movement => {
      const movementDate = new Date(movement.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Include the end date fully
      
      return isWithinInterval(movementDate, { start: startDate, end: endDate });
    })
    .filter(movement => 
      movementType === "all" || movement.type === movementType
    )
    .sort((a, b) => {
      let valueA: any = a[sortBy as keyof StockMovement];
      let valueB: any = b[sortBy as keyof StockMovement];
      
      if (sortBy === "date") {
        valueA = new Date(a.date).getTime();
        valueB = new Date(b.date).getTime();
      } else if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }
      
      if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
      if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  
  // Create data for inventory value by category pie chart
  const inventoryValueByCategory = materials.reduce((acc, material) => {
    const category = material.category || "Uncategorized";
    const value = material.currentQuantity * material.pricePerUnit;
    
    const existingCategory = acc.find(item => item.name === category);
    if (existingCategory) {
      existingCategory.value += value;
    } else {
      acc.push({ name: category, value });
    }
    
    return acc;
  }, [] as { name: string; value: number }[]);
  
  // Create data for stock movement types pie chart
  const movementTypeCount = stockMovements
    .filter(movement => {
      const movementDate = new Date(movement.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      return isWithinInterval(movementDate, { start: startDate, end: endDate });
    })
    .reduce((acc, movement) => {
      const type = movement.type;
      
      const existingType = acc.find(item => item.name === type);
      if (existingType) {
        existingType.value += 1;
      } else {
        acc.push({ name: type, value: 1 });
      }
      
      return acc;
    }, [] as { name: string; value: number }[]);
  
  // Create data for sales over time chart
  const salesByDate = sales
    .filter(sale => sale.status === "COMPLETED")
    .filter(sale => {
      const saleDate = new Date(sale.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      
      return isWithinInterval(saleDate, { start: startDate, end: endDate });
    })
    .reduce((acc, sale) => {
      const dateStr = format(new Date(sale.date), "MMM d");
      
      const existingDate = acc.find(item => item.date === dateStr);
      if (existingDate) {
        existingDate.amount += sale.totalAmount;
        existingDate.count += 1;
      } else {
        acc.push({ 
          date: dateStr, 
          amount: sale.totalAmount,
          count: 1
        });
      }
      
      return acc;
    }, [] as { date: string; amount: number; count: number }[])
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  
  // Create data for top selling materials chart
  const topSellingMaterials = sales
    .filter(sale => sale.status === "COMPLETED")
    .flatMap(sale => sale.items)
    .reduce((acc, item) => {
      const existingItem = acc.find(i => i.name === item.materialName);
      if (existingItem) {
        existingItem.quantity += item.quantity;
        existingItem.value += item.totalPrice;
      } else {
        acc.push({
          name: item.materialName,
          quantity: item.quantity,
          value: item.totalPrice
        });
      }
      return acc;
    }, [] as { name: string; quantity: number; value: number }[])
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Stock movement table columns
  const movementColumns = [
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("date")}>
          Date
          {sortBy === "date" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "date",
      cell: (row: StockMovement) => format(new Date(row.date), "MMM d, yyyy"),
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("materialName")}>
          Material
          {sortBy === "materialName" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "materialName",
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("type")}>
          Type
          {sortBy === "type" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "type",
      cell: (row: StockMovement) => {
        const getTypeStyle = () => {
          switch (row.type) {
            case "RECEIPT":
              return "bg-green-100 text-green-800 px-2 py-1 rounded";
            case "SALE":
              return "bg-blue-100 text-blue-800 px-2 py-1 rounded";
            case "PRODUCTION_CONSUMPTION":
              return "bg-orange-100 text-orange-800 px-2 py-1 rounded";
            case "RETURN":
              return "bg-purple-100 text-purple-800 px-2 py-1 rounded";
            case "ADJUSTMENT":
              return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
            default:
              return "bg-gray-100 text-gray-800 px-2 py-1 rounded";
          }
        };
        
        return (
          <span className={getTypeStyle()}>
            {row.type.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      header: (
        <div className="flex items-center cursor-pointer" onClick={() => handleSort("quantity")}>
          Quantity
          {sortBy === "quantity" && (
            <ArrowUpDown className={`ml-1 h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
          )}
        </div>
      ),
      accessor: "quantity",
      cell: (row: StockMovement) => {
        const isPositive = row.quantity > 0;
        return (
          <div className="flex items-center">
            {isPositive ? (
              <ChevronUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ChevronDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span>{Math.abs(row.quantity)}</span>
          </div>
        );
      },
    },
    {
      header: "Before",
      accessor: "beforeQuantity",
    },
    {
      header: "After",
      accessor: "afterQuantity",
    },
    {
      header: "Reference",
      accessor: "notes",
      cell: (row: StockMovement) => row.notes || "-",
    },
  ];

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        
        <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex gap-2">
            <Input
              type="date"
              name="start"
              value={dateRange.start}
              onChange={handleDateRangeChange}
              className="w-full md:w-40"
            />
            <Input
              type="date"
              name="end"
              value={dateRange.end}
              onChange={handleDateRangeChange}
              className="w-full md:w-40"
            />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Total Inventory Value"
          icon={<BarChart3 className="h-5 w-5" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {formatCurrency(
                materials.reduce(
                  (sum, material) => sum + material.currentQuantity * material.pricePerUnit,
                  0
                )
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              Across {materials.length} materials
            </span>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Sales Revenue"
          icon={<TrendingUp className="h-5 w-5" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {formatCurrency(
                sales
                  .filter(sale => 
                    sale.status === "COMPLETED" &&
                    isWithinInterval(parseISO(sale.date), {
                      start: new Date(dateRange.start),
                      end: new Date(dateRange.end)
                    })
                  )
                  .reduce((sum, sale) => sum + sale.totalAmount, 0)
              )}
            </span>
            <span className="text-sm text-muted-foreground">
              For selected period
            </span>
          </div>
        </DashboardCard>
        
        <DashboardCard
          title="Stock Movements"
          icon={<LineChart className="h-5 w-5" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {filteredMovements.length}
            </span>
            <span className="text-sm text-muted-foreground">
              Transactions recorded
            </span>
          </div>
        </DashboardCard>
      </div>
      
      <Tabs defaultValue="charts" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard 
              title="Sales Revenue Over Time" 
              icon={<BarChart3 className="h-5 w-5" />}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByDate}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="amount" 
                      name="Sales Amount" 
                      fill="#3498db" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            <DashboardCard 
              title="Top Selling Materials" 
              icon={<BarChart3 className="h-5 w-5" />}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topSellingMaterials}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Sales Value" 
                      fill="#2ecc71" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            <DashboardCard 
              title="Inventory Value by Category" 
              icon={<PieChartIcon className="h-5 w-5" />}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={inventoryValueByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inventoryValueByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
            
            <DashboardCard 
              title="Stock Movement Types" 
              icon={<PieChartIcon className="h-5 w-5" />}
            >
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={movementTypeCount}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.replace(/_/g, " ")}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {movementTypeCount.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </DashboardCard>
          </div>
        </TabsContent>
        
        <TabsContent value="movements">
          <div className="mb-4 flex gap-2">
            <Select 
              value={movementType} 
              onValueChange={setMovementType}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="RECEIPT">Receipt</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="PRODUCTION_CONSUMPTION">Production Consumption</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DataTable columns={movementColumns} data={filteredMovements} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
