import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "@/pages/HomePage";
import BulkResultsPage from "@/pages/BulkResultsPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/bulk-results" component={BulkResultsPageWrapper} />
      <Route component={NotFound} />
    </Switch>
  );
}

function BulkResultsPageWrapper() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<{ invoices: any[]; format: 'pdf' | 'jpeg'; logo?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const bulkResultsData = sessionStorage.getItem('bulk_results');
    
    if (!bulkResultsData) {
      setLocation('/');
      setIsLoading(false);
      return;
    }
    
    try {
      const parsedData = JSON.parse(bulkResultsData);
      setData(parsedData);
      // Clear sessionStorage after successfully loading the data
      sessionStorage.removeItem('bulk_results');
    } catch (error) {
      console.error('Failed to parse bulk results:', error);
      sessionStorage.removeItem('bulk_results');
      setLocation('/');
    } finally {
      setIsLoading(false);
    }
  }, [setLocation]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!data) {
    return null;
  }
  
  return <BulkResultsPage invoices={data.invoices} format={data.format} logo={data.logo} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
