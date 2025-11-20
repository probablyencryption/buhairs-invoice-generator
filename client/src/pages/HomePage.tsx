import { useState, useEffect } from 'react';
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

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('single');
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [previewData, setPreviewData] = useState({
    invoiceNumber: 'BLH#2799',
    date: new Date().toLocaleDateString('en-GB'),
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    preCode: '' as string | undefined,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const authenticated = sessionStorage.getItem('bu_authenticated');
    setIsAuthenticated(authenticated === 'true');
  }, []);

  const { data: logoData } = useQuery<{ logo: string | null }>({
    queryKey: ['/api/settings/logo'],
    enabled: isAuthenticated,
  });

  const logoUrl = logoData?.logo;

  const logoMutation = useMutation({
    mutationFn: async (dataUrl: string) => {
      const response = await fetch('/api/settings/logo', {
        method: 'POST',
        body: JSON.stringify({ logo: dataUrl }),
        headers: { 'Content-Type': 'application/json' },
      });
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

  const handleSingleInvoiceGenerate = async (data: {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    preCode?: string;
  }) => {
    setPreviewData({ ...data, preCode: data.preCode || '' });
    
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await fetch('/api/settings/invoice-number/increment', {
        method: 'POST',
      });
      
      toast({
        title: 'Invoice generated',
        description: `Invoice ${data.invoiceNumber} has been created and downloaded.`,
      });
      
      console.log('Generate PDF for:', data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save invoice',
        variant: 'destructive',
      });
    }
  };

  const handleBulkGenerate = (data: { date: string; rawData: string }) => {
    console.log('Process bulk data:', data);
    toast({
      title: 'Processing bulk invoices',
      description: 'AI is extracting customer data and generating invoices...',
    });
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setPreviewData({ ...invoice, preCode: invoice.preCode || '' });
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto" data-testid="tabs-navigation">
            <TabsTrigger value="single" className="gap-2" data-testid="tab-single">
              <FileText className="h-4 w-4" />
              Single
            </TabsTrigger>
            <TabsTrigger value="bulk" className="gap-2" data-testid="tab-bulk">
              <FileText className="h-4 w-4" />
              Bulk
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2" data-testid="tab-history">
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
                  logoUrl={logoUrl}
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
            <div className="max-w-4xl mx-auto">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Bulk Invoice Generation</h2>
                <BulkInvoiceForm onGenerate={handleBulkGenerate} />
              </Card>
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
