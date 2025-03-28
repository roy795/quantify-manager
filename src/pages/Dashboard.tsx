
import { useData } from "@/context/DataContext";
import DashboardCard from "@/components/DashboardCard";
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Clock,
  Factory,
  BarChart3,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const Dashboard = () => {
  const { 
    materials, 
    sales, 
    productions, 
    getLowStockMaterials 
  } = useData();
  
  const lowStockItems = getLowStockMaterials();
  
  // Calculate summary data
  const totalInventoryValue = materials.reduce(
    (sum, material) => sum + material.currentQuantity * material.pricePerUnit,
    0
  );
  
  const recentSales = sales
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  
  const pendingSales = sales.filter((sale) => sale.status === "PENDING").length;
  const completedSales = sales.filter((sale) => sale.status === "COMPLETED").length;
  const inProgressProductions = productions.filter(
    (prod) => prod.status === "IN_PROGRESS"
  ).length;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center">
          <Badge variant="outline" className="ml-2">
            {format(new Date(), "PPP")}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardCard
          title="Inventory"
          icon={<Package className="h-5 w-5" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{materials.length}</span>
            <span className="text-sm text-muted-foreground">Total Items</span>
            <span className="text-lg font-semibold mt-2">{formatCurrency(totalInventoryValue)}</span>
            <span className="text-sm text-muted-foreground">Total Value</span>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Low Stock"
          icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{lowStockItems.length}</span>
            <span className="text-sm text-muted-foreground">Items Below Threshold</span>
            <Link to="/inventory" className="text-primary text-sm mt-2 hover:underline">
              View inventory
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Sales"
          icon={<ShoppingCart className="h-5 w-5" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{sales.length}</span>
            <span className="text-sm text-muted-foreground">Total Orders</span>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {completedSales} Completed
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                {pendingSales} Pending
              </Badge>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Production"
          icon={<Factory className="h-5 w-5" />}
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold">{productions.length}</span>
            <span className="text-sm text-muted-foreground">Total Orders</span>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                {inProgressProductions} In Progress
              </Badge>
            </div>
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-2">
          <DashboardCard title="Low Stock Alerts" icon={<AlertTriangle className="h-5 w-5" />}>
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground">No low stock items</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-destructive">
                          {item.currentQuantity} / {item.minQuantity} {item.unit}
                        </span>
                      </div>
                      <Progress
                        value={(item.currentQuantity / item.minQuantity) * 100}
                        className="mt-2 bg-red-100"
                      />
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Link to="/inventory" className="text-primary text-sm hover:underline block mt-2">
                    View {lowStockItems.length - 5} more
                  </Link>
                )}
              </div>
            )}
          </DashboardCard>
        </div>

        {/* Recent Sales */}
        <div>
          <DashboardCard title="Recent Sales" icon={<DollarSign className="h-5 w-5" />}>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex flex-col p-3 rounded-md border">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{sale.orderNumber}</span>
                    <Badge
                      variant="outline"
                      className={
                        sale.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : sale.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {sale.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{sale.customerName}</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">
                      {format(new Date(sale.date), "MMM d, yyyy")}
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(sale.totalAmount)}
                    </span>
                  </div>
                </div>
              ))}
              <Link to="/sales" className="text-primary text-sm hover:underline block">
                View all sales
              </Link>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
