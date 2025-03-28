
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  Factory, 
  Menu,
  BarChart2,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileBottomNav = () => {
  // Wrap the useLocation in a try/catch to handle the case when it's rendered outside a Router
  let pathname = "/";
  try {
    const location = useLocation();
    pathname = location.pathname;
  } catch (error) {
    console.error("MobileBottomNav rendered outside Router context:", error);
  }
  
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  const routes = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Sales",
      path: "/sales",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    {
      name: "BOQ",
      path: "/boq",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "Production",
      path: "/production",
      icon: <Factory className="h-5 w-5" />,
    },
  ];
  
  const additionalRoutes = [
    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart2 className="h-5 w-5" />,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
  ];
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border flex justify-between items-center px-2">
        {routes.slice(0, 4).map((route) => (
          <Link
            key={route.path}
            to={route.path}
            className={`flex flex-col items-center justify-center py-1 px-2 ${
              isActive(route.path)
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            onClick={() => setOpen(false)}
          >
            {route.icon}
            <span className="text-xs mt-1">{route.name}</span>
          </Link>
        ))}
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="flex flex-col items-center justify-center h-full py-1"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto rounded-t-xl pb-8">
            <div className="grid grid-cols-3 gap-4 py-4">
              {[...routes.slice(4), ...additionalRoutes].map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="flex flex-col items-center justify-center p-3 rounded-md bg-accent text-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  {route.icon}
                  <span className="text-sm mt-2">{route.name}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="pb-16"></div> {/* Spacer to account for fixed bottom nav */}
    </>
  );
};

export default MobileBottomNav;
