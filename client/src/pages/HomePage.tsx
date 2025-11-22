import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import SingleInvoiceForm from '@/components/SingleInvoiceForm';
import BulkInvoiceForm from '@/components/BulkInvoiceForm';
import InvoicePreview from '@/components/InvoicePreview';
import InvoiceHistory from '@/components/InvoiceHistory';
import PasswordPrompt from '@/components/PasswordPrompt';
import { type InvoiceData } from '@/lib/invoiceStorage';
import { useToast } from '@/hooks/use-toast';
import { FileText, History } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { useLocation } from 'wouter';

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [previewData, setPreviewData] = useState({
    invoiceNumber: 'BLH#2799',
    date: new Date().toLocaleDateString('en-GB'),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    preCode: undefined as string | undefined,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const invoicePreviewRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const validateSession = async () => {
      const authenticated = sessionStorage.getItem('bu_authenticated');
      const sessionToken = sessionStorage.getItem('bu_session');
      
      if (authenticated === 'true' && sessionToken) {
        try {
          const response = await fetch('/api/auth/session', {
            headers: {
              'x-app-session': sessionToken,
            },
          });
          
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            // Session is invalid, clear auth state
            sessionStorage.removeItem('bu_authenticated');
            sessionStorage.removeItem('bu_session');
            setIsAuthenticated(false);
          }
        } catch (error) {
          // Network error or server down, clear auth state
          sessionStorage.removeItem('bu_authenticated');
          sessionStorage.removeItem('bu_session');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    };
    
    validateSession();
  }, []);

  const { data: logoData } = useQuery<{ logo: string | null }>({
    queryKey: ['/api/settings/logo'],
    enabled: isAuthenticated,
  });

  const { data: invoicesData } = useQuery<InvoiceData[]>({
    queryKey: ['/api/invoices'],
    enabled: isAuthenticated,
  });

  const invoices = invoicesData || [];
  const logoUrl = logoData?.logo;

  const logoMutation = useMutation({
    mutationFn: async (dataUrl: string) => {
      const response = await apiRequest('POST', '/api/settings/logo', { logo: dataUrl });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings/logo'] });
      toast({
        title: 'Logo uploaded',
        description: 'Your brand logo has been saved successfully.',
      });
    },
  });

  const handleLogoUpload = (dataUrl: string) => {
    logoMutation.mutate(dataUrl);
  };

  const handlePreview = (data: {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    preCode?: string;
  }) => {
    setPreviewData({ ...data, preCode: data.preCode || undefined });
  };

  const handleSingleInvoiceGenerate = async (
    data: {
      invoiceNumber: string;
      date: string;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      preCode?: string;
    },
    format: 'pdf' | 'jpeg'
  ) => {
    setPreviewData({ ...data, preCode: data.preCode || undefined });
    
    if (!invoicePreviewRef.current) {
      toast({
        title: 'Error',
        description: 'Invoice preview not ready. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const invoiceResponse = await apiRequest('POST', '/api/invoices', data);
      const responseData = await invoiceResponse.json();
      
      await queryClient.invalidateQueries({ queryKey: ['/api/settings/invoice-number'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      
      // Wait for DOM to update and all styles to be applied
      await new Promise(resolve => setTimeout(resolve, 150));

      if (invoicePreviewRef.current) {
        try {
          await generateInvoicePDF(invoicePreviewRef.current, data.invoiceNumber, format);
          toast({
            title: 'Invoice generated',
            description: `Invoice ${data.invoiceNumber} has been downloaded as ${format.toUpperCase()}.`,
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast({
            title: 'PDF generation failed',
            description: `Failed to generate ${format.toUpperCase()} for invoice ${data.invoiceNumber}: ${errorMessage}`,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save invoice';
      toast({
        title: 'Error',
        description: `Failed to create invoice ${data.invoiceNumber}: ${message}`,
        variant: 'destructive',
      });
    }
  };

  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleBulkGenerate = async (data: { date: string; rawData: string; includePre: boolean; format: 'pdf' | 'jpeg' }) => {
    setIsBulkProcessing(true);
    
    try {
      toast({
        title: 'Processing...',
        description: 'AI is extracting customer data and creating invoices...',
      });

      const response = await apiRequest('POST', '/api/invoices/bulk-process', {
        rawData: data.rawData,
        includePre: data.includePre,
        date: data.date,
        format: data.format,
      });

      const result = await response.json();
      
      if (!result.invoices || result.invoices.length === 0) {
        toast({
          title: 'No invoices created',
          description: 'Could not extract customer data. Please check the format.',
          variant: 'destructive',
        });
        setIsBulkProcessing(false);
        return;
      }

      const successfulInvoices = result.invoices.filter((inv: any) => inv.success);
      const failedInvoices = result.invoices.filter((inv: any) => !inv.success);

      if (failedInvoices.length > 0) {
        toast({
          title: 'Some invoices failed',
          description: `${failedInvoices.length} of ${result.invoices.length} invoices failed to create. Check console for details.`,
          variant: 'destructive',
        });
        console.error('Failed invoices:', failedInvoices);
      }

      if (successfulInvoices.length === 0) {
        toast({
          title: 'All invoices failed',
          description: 'Could not create any invoices. Please try again.',
          variant: 'destructive',
        });
        setIsBulkProcessing(false);
        return;
      }

      // Invalidate queries to refresh invoice history
      await queryClient.invalidateQueries({ queryKey: ['/api/settings/invoice-number'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });

      // Store results in sessionStorage and navigate to results page
      const bulkResultsData = {
        invoices: successfulInvoices,
        format: data.format,
        logo: logoUrl || null,
      };
      
      sessionStorage.setItem('bulk_results', JSON.stringify(bulkResultsData));

      toast({
        title: 'Success!',
        description: `${successfulInvoices.length} invoice${successfulInvoices.length !== 1 ? 's' : ''} created successfully`,
      });

      // Navigate to results page
      setLocation('/bulk-results');

    } catch (error: any) {
      console.error('Bulk generation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to process bulk invoices',
        variant: 'destructive',
      });
      setIsBulkProcessing(false);
    }
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    const cleanPreCode = invoice.preCode && invoice.preCode.trim() !== '' ? invoice.preCode : undefined;
    setPreviewData({ ...invoice, preCode: cleanPreCode });
    setActiveTab('single');
    toast({
      title: 'Invoice loaded',
      description: `Viewing invoice ${invoice.invoiceNumber}`,
    });
  };

  const handleDownloadInvoice = (invoice: InvoiceData) => {
    console.log('Download invoice:', invoice);
    toast({
      title: 'Downloading invoice',
      description: `Generating PDF for invoice ${invoice.invoiceNumber}`,
    });
  };

  if (!isAuthenticated) {
    return <PasswordPrompt onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {logoUrl && logoUrl !== null && (
                <img src={logoUrl} alt="Bu Luxury Hairs" className="h-12 w-auto" />
              )}
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Bu Luxury Hairs</h1>
                <p className="text-sm text-muted-foreground">Invoice Generation System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="fixed opacity-0 pointer-events-none -z-50" style={{ width: '827px', height: '591px' }}>
          <InvoicePreview ref={invoicePreviewRef} {...previewData} logoUrl={logoUrl || undefined} />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => {
          if (!isBulkProcessing) {
            setActiveTab(value);
          }
        }} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto" data-testid="tabs-navigation">
            <TabsTrigger value="single" className="gap-2" data-testid="tab-single" disabled={isBulkProcessing}>
              <FileText className="h-4 w-4" />
              Single
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2" data-testid="tab-bulk" disabled={isBulkProcessing}>
              <FileText className="h-4 w-4" />
              Bulk
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2" data-testid="tab-history" disabled={isBulkProcessing}>
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Create Invoice</h2>
                <SingleInvoiceForm
                  onGenerate={handleSingleInvoiceGenerate}
                  onPreview={handlePreview}
                  logoUrl={logoUrl || undefined}
                  onLogoUpload={handleLogoUpload}
                />
              </Card>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Preview</h2>
                <div className="flex justify-center">
                  <InvoicePreview {...previewData} logoUrl={logoUrl || undefined} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bulk">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Bulk Invoice Generation</h2>
                <BulkInvoiceForm onGenerate={handleBulkGenerate} isProcessing={isBulkProcessing} />
              </Card>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Preview (Last Generated)</h2>
                <div className="flex justify-center">
                  <InvoicePreview {...previewData} logoUrl={logoUrl || undefined} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-xl font-semibold mb-6">Invoice History</h2>
              <InvoiceHistory
                invoices={invoices}
                onView={handleViewInvoice}
                onDownload={handleDownloadInvoice}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
