
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DataProvider, useData } from "@/context/DataContext";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import BOQPage from "@/pages/BOQPage";
import Production from "@/pages/Production";
import Analytics from "@/pages/Analytics";
import NotFound from "@/pages/NotFound";
import MobileBottomNav from "@/components/MobileBottomNav";
import Index from "@/pages/Index";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

const queryClient = new QueryClient();

// App routes component that includes loading state
const AppRoutes = () => {
  const { isLoading } = useData();
  
  // Log platform info
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      console.log('Running on native platform:', Capacitor.getPlatform());
    } else {
      console.log('Running on web');
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading application data..." />;
  }

  return (
    <>
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/boq" element={<BOQPage />} />
          <Route path="/production" element={<Production />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <MobileBottomNav />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <DataProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <div className="flex flex-col min-h-screen bg-background">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </DataProvider>
  </QueryClientProvider>
);

export default App;
