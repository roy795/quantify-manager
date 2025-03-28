
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, FileText, Factory, BarChart2 } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const modules = [
    {
      title: "Inventory Management",
      icon: <Package className="h-6 w-6" />,
      description: "Track materials, stock levels, and inventory value",
      path: "/inventory"
    },
    {
      title: "Sales Management",
      icon: <ShoppingCart className="h-6 w-6" />,
      description: "Create sales orders and track revenue",
      path: "/sales"
    },
    {
      title: "Bill of Quantities",
      icon: <FileText className="h-6 w-6" />,
      description: "Manage project material requirements",
      path: "/boq"
    },
    {
      title: "Production Management",
      icon: <Factory className="h-6 w-6" />,
      description: "Track production processes and material consumption",
      path: "/production"
    },
    {
      title: "Analytics & Reporting",
      icon: <BarChart2 className="h-6 w-6" />,
      description: "Monitor inventory movements and business performance",
      path: "/analytics"
    }
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventory Management System</h1>
        <p className="text-muted-foreground">
          A complete solution for managing your business inventory, sales, and production
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">{module.title}</CardTitle>
              <div className="text-primary">{module.icon}</div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">{module.description}</p>
              <Button asChild className="w-full">
                <Link to={module.path}>
                  Access {module.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Index;
