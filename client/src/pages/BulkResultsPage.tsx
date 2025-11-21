import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Download, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import InvoicePreview from '@/components/InvoicePreview';
import { generateInvoicePDF } from '@/lib/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  preCode?: string;
}

interface BulkResultsPageProps {
  invoices: InvoiceData[];
  format: 'pdf' | 'jpeg';
  logo?: string;
}

export default function BulkResultsPage({ invoices, format, logo }: BulkResultsPageProps) {
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownload = async (invoice: InvoiceData) => {
    console.log('Download invoice data:', invoice);
    console.log('PRE code value:', invoice.preCode);
    setIsGenerating(true);
    setPreviewInvoice(invoice);
    
    // Wait for DOM to update and all styles to be applied
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
      if (!invoiceRef.current) {
        console.error('Invoice preview failed to render - ref is null after DOM update');
        throw new Error('Invoice preview failed to render');
      }

      // Generate PDF before clearing state
      await generateInvoicePDF(invoiceRef.current, invoice.invoiceNumber, format);

      toast({
        title: 'Success',
        description: `Invoice ${invoice.invoiceNumber} downloaded as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to generate ${format.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      // Only clear state after PDF generation completes (success or failure)
      setIsGenerating(false);
      setPreviewInvoice(null);
    }
  };

  const handlePreview = (invoice: InvoiceData) => {
    console.log('Preview invoice data:', invoice);
    console.log('PRE code value:', invoice.preCode);
    setPreviewInvoice(invoice);
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Bulk Invoice Results</h1>
          <p className="text-muted-foreground">
            {invoices.length} invoice{invoices.length !== 1 ? 's' : ''} generated successfully ({format.toUpperCase()})
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {invoices.map((invoice) => (
          <Card key={invoice.invoiceNumber} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg" data-testid={`text-invoice-${invoice.invoiceNumber}`}>
                  {invoice.invoiceNumber}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {invoice.customerName} • {invoice.customerPhone}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {invoice.customerAddress.split('\n').join(' • ')}
                </p>
                {invoice.preCode && (
                  <p className="text-xs text-muted-foreground mt-1">
                    PRE: {invoice.preCode}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePreview(invoice)}
                  data-testid={`button-preview-${invoice.invoiceNumber}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => handleDownload(invoice)}
                  disabled={isGenerating}
                  data-testid={`button-download-${invoice.invoiceNumber}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewInvoice && !isGenerating} onOpenChange={(open) => !open && setPreviewInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <div className="flex justify-center">
              <InvoicePreview
                invoiceNumber={previewInvoice.invoiceNumber}
                date={previewInvoice.date}
                customerName={previewInvoice.customerName}
                customerPhone={previewInvoice.customerPhone}
                customerAddress={previewInvoice.customerAddress}
                preCode={previewInvoice.preCode}
                logoUrl={logo}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden invoice for PDF/JPEG generation */}
      <div className="fixed -left-[9999px] top-0">
        {previewInvoice && isGenerating && (
          <InvoicePreview
            ref={invoiceRef}
            invoiceNumber={previewInvoice.invoiceNumber}
            date={previewInvoice.date}
            customerName={previewInvoice.customerName}
            customerPhone={previewInvoice.customerPhone}
            customerAddress={previewInvoice.customerAddress}
            preCode={previewInvoice.preCode}
            logoUrl={logo}
          />
        )}
      </div>
    </div>
  );
}
