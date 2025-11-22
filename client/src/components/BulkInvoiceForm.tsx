import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { InvoiceNumberControl } from '@/components/InvoiceNumberControl';
import { Input } from '@/components/ui/input';

interface BulkInvoiceFormProps {
  onGenerate: (data: { date: string; rawData: string; includePre: boolean; format: 'pdf' | 'jpeg' }) => void;
  isProcessing?: boolean;
}

export default function BulkInvoiceForm({ onGenerate, isProcessing = false }: BulkInvoiceFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [rawData, setRawData] = useState('');
  const [includePre, setIncludePre] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { data: invoiceData, refetch: refetchInvoiceNumber } = useQuery<{ lastInvoiceNumber: number }>({
    queryKey: ['/api/settings/last-invoice'],
  });

  const handleRefreshInvoiceNumber = () => {
    refetchInvoiceNumber();
  };

  const validateAndGenerate = (formatType: 'pdf' | 'jpeg') => {
    setValidationError('');
    
    // Count number of lines (customers)
    const lines = rawData.trim().split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      setValidationError('Please enter at least one customer');
      return;
    }
    
    if (lines.length > 20) {
      setValidationError('Maximum 20 customers allowed per bulk upload');
      return;
    }
    
    onGenerate({
      date: format(date, 'dd/MM/yyyy'),
      rawData,
      includePre,
      format: formatType,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-accent/50">
        <h3 className="text-lg font-semibold mb-3">How to use bulk upload</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Paste customer data in the following format (one customer per line):
        </p>
        <code className="text-sm bg-background p-3 rounded-md block">
          {includePre ? (
            <>
              Name : Phone Number : Address : PRE Code<br/>
              John Doe : 08012345678 : 123 Main Street, Lagos : 7812344<br/>
              Jane Smith : 09087654321 : 456 Park Avenue, Abuja : 7923456
            </>
          ) : (
            <>
              Name : Phone Number : Address<br/>
              John Doe : 08012345678 : 123 Main Street, Lagos<br/>
              Jane Smith : 09087654321 : 456 Park Avenue, Abuja
            </>
          )}
        </code>
        <p className="text-xs text-muted-foreground mt-2">
          Maximum 20 customers per upload
        </p>
      </Card>

      <div className="space-y-6" data-testid="form-bulk-invoice">
        <div className="space-y-2">
          <Label htmlFor="lastInvoiceNumber">Last Invoice Number</Label>
          <div className="flex items-center gap-2">
            <Input
              id="lastInvoiceNumber"
              value={`BLH#${invoiceData?.lastInvoiceNumber || 2799}`}
              readOnly
              className="bg-muted flex-1"
              data-testid="input-last-invoice-number"
            />
            <InvoiceNumberControl 
              currentNumber={invoiceData?.lastInvoiceNumber || 2799}
              onRefresh={handleRefreshInvoiceNumber}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Next batch will start from BLH#{(invoiceData?.lastInvoiceNumber || 2799) + 1}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Invoice Date (for all invoices)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
                data-testid="button-bulk-date-picker"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="include-pre" className="text-base font-medium">
              Include PRE Code
            </Label>
            <p className="text-sm text-muted-foreground">
              Extract PRE codes from customer data
            </p>
          </div>
          <Switch
            id="include-pre"
            checked={includePre}
            onCheckedChange={setIncludePre}
            data-testid="switch-include-pre"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rawData">Customer Data</Label>
          <Textarea
            id="rawData"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Paste customer data here..."
            required
            rows={12}
            className="font-mono text-sm"
            data-testid="textarea-bulk-data"
          />
        </div>

        {validationError && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {validationError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={() => validateAndGenerate('pdf')}
            className="w-full" 
            size="lg" 
            disabled={isProcessing}
            data-testid="button-process-bulk-pdf"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process & Generate (PDF)'
            )}
          </Button>

          <Button 
            onClick={() => validateAndGenerate('jpeg')}
            className="w-full" 
            size="lg" 
            variant="outline"
            disabled={isProcessing}
            data-testid="button-process-bulk-jpeg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process & Generate (JPEG)'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
