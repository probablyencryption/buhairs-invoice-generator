import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface BulkInvoiceFormProps {
  onGenerate: (data: { date: string; rawData: string }) => void;
  isProcessing?: boolean;
}

export default function BulkInvoiceForm({ onGenerate, isProcessing = false }: BulkInvoiceFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [rawData, setRawData] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      date: format(date, 'dd/MM/yyyy'),
      rawData,
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
          Name, Phone Number, Address<br/>
          John Doe, 08012345678, 123 Main Street Lagos<br/>
          Jane Smith, 09087654321, 456 Park Avenue Abuja
        </code>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-bulk-invoice">
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

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={isProcessing}
          data-testid="button-process-bulk"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing with AI...
            </>
          ) : (
            'Process & Generate Invoices'
          )}
        </Button>
      </form>
    </div>
  );
}
