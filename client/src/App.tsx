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
  const bulkResultsData = sessionStorage.getItem('bulk_results');
  
  if (!bulkResultsData) {
    setLocation('/');
    return null;
  }
  
  try {
    const data = JSON.parse(bulkResultsData);
    // Clear the session storage after consuming the data to prevent stale data
    sessionStorage.removeItem('bulk_results');
    return <BulkResultsPage invoices={data.invoices} format={data.format} logo={data.logo} />;
  } catch (error) {
    console.error('Failed to parse bulk results:', error);
    sessionStorage.removeItem('bulk_results');
    setLocation('/');
    return null;
  }
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
