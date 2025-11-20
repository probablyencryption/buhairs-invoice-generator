import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { invoiceStorage } from '@/lib/invoiceStorage';
import { cn } from '@/lib/utils';

interface SingleInvoiceFormProps {
  onGenerate: (data: {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    preCode?: string;
  }) => void;
  logoUrl?: string;
  onLogoUpload: (dataUrl: string) => void;
}

export default function SingleInvoiceForm({ onGenerate, logoUrl, onLogoUpload }: SingleInvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [hasPreCode, setHasPreCode] = useState(false);
  const [preCode, setPreCode] = useState('');

  useEffect(() => {
    const nextNumber = invoiceStorage.getNextInvoiceNumber();
    setInvoiceNumber(nextNumber);
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onLogoUpload(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      invoiceNumber,
      date: format(date, 'dd/MM/yyyy'),
      customerName,
      customerPhone,
      customerAddress,
      preCode: hasPreCode ? preCode : undefined,
    });
    
    invoiceStorage.incrementInvoiceNumber();
    const nextNumber = invoiceStorage.getNextInvoiceNumber();
    setInvoiceNumber(nextNumber);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setPreCode('');
    setHasPreCode(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-single-invoice">
      <div className="space-y-2">
        <Label htmlFor="logo">Brand Logo</Label>
        <div className="flex items-center gap-4">
          {logoUrl && (
            <img src={logoUrl} alt="Logo preview" className="h-16 w-auto object-contain" data-testid="img-logo-preview" />
          )}
          <label htmlFor="logo-upload">
            <Button type="button" variant="outline" size="sm" asChild data-testid="button-upload-logo">
              <span className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {logoUrl ? 'Change Logo' : 'Upload Logo'}
              </span>
            </Button>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="invoiceNumber">Invoice Number</Label>
        <Input
          id="invoiceNumber"
          value={invoiceNumber}
          readOnly
          className="bg-muted"
          data-testid="input-invoice-number"
        />
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
              data-testid="button-date-picker"
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

      <div className="flex items-center space-x-2">
        <Switch
          id="preCode"
          checked={hasPreCode}
          onCheckedChange={setHasPreCode}
          data-testid="switch-pre-code"
        />
        <Label htmlFor="preCode">Include PRE Code</Label>
      </div>

      {hasPreCode && (
        <div className="space-y-2">
          <Label htmlFor="preCodeInput">PRE Code</Label>
          <Input
            id="preCodeInput"
            value={preCode}
            onChange={(e) => setPreCode(e.target.value)}
            placeholder="Enter PRE code"
            data-testid="input-pre-code"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input
          id="customerName"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Full name"
          required
          data-testid="input-customer-name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input
          id="customerPhone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="Phone number"
          required
          data-testid="input-customer-phone"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customerAddress">Delivery Address</Label>
        <Textarea
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          placeholder="Full delivery address"
          required
          rows={3}
          data-testid="textarea-customer-address"
        />
      </div>

      <Button type="submit" className="w-full" size="lg" data-testid="button-generate-pdf">
        Generate & Download PDF
      </Button>
    </form>
  );
}
