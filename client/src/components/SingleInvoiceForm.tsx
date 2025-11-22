import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Upload, Eye, Download } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { InvoiceNumberControl } from '@/components/InvoiceNumberControl';

interface SingleInvoiceFormProps {
  onGenerate: (data: {
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    preCode?: string;
  }, format: 'pdf' | 'jpeg') => void;
  onPreview: (data: {
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

export default function SingleInvoiceForm({ onGenerate, onPreview, logoUrl, onLogoUpload }: SingleInvoiceFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [hasPreCode, setHasPreCode] = useState(false);
  const [preCode, setPreCode] = useState('');
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'jpeg'>('pdf');

  const { data: invoiceData, refetch: refetchInvoiceNumber } = useQuery<{ lastInvoiceNumber: number }>({
    queryKey: ['/api/settings/last-invoice'],
  });

  useEffect(() => {
    if (invoiceData?.lastInvoiceNumber !== undefined) {
      const nextNumber = invoiceData.lastInvoiceNumber + 1;
      setInvoiceNumber(`BLH#${nextNumber}`);
    } else {
      setInvoiceNumber('BLH#2799');
    }
  }, [invoiceData]);

  const handleRefreshInvoiceNumber = () => {
    refetchInvoiceNumber();
  };

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

  const getFormData = () => ({
    invoiceNumber,
    date: format(date, 'dd/MM/yyyy'),
    customerName,
    customerPhone,
    customerAddress,
    preCode: hasPreCode ? preCode : undefined,
  });

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }
    onPreview(getFormData());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(getFormData(), downloadFormat);
    
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setPreCode('');
    setHasPreCode(false);
  };

  const isFormValid = customerName && customerPhone && customerAddress && (!hasPreCode || preCode);

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
        <div className="flex items-center gap-2">
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            readOnly
            className="bg-muted flex-1"
            data-testid="input-invoice-number"
          />
          <InvoiceNumberControl 
            currentNumber={invoiceData?.lastInvoiceNumber || 2799}
            onRefresh={handleRefreshInvoiceNumber}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Click refresh to see the latest invoice number or edit to update it manually
        </p>
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
          <Label htmlFor="preCodeInput">PRE Code (numbers only, max 7 digits)</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground pointer-events-none">
              PRE
            </div>
            <Input
              id="preCodeInput"
              value={preCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 7) {
                  setPreCode(value);
                }
              }}
              placeholder="1234567"
              className="pl-14"
              required
              maxLength={7}
              data-testid="input-pre-code"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {preCode.length}/7 digits
          </p>
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
        <div className="flex justify-between items-center">
          <Label htmlFor="customerAddress">Delivery Address</Label>
          <span className={cn(
            "text-xs",
            customerAddress.length > 120 ? "text-destructive font-medium" : "text-muted-foreground"
          )}>
            {customerAddress.length}/120
          </span>
        </div>
        <Textarea
          id="customerAddress"
          value={customerAddress}
          onChange={(e) => {
            if (e.target.value.length <= 120) {
              setCustomerAddress(e.target.value);
            }
          }}
          placeholder="Full delivery address"
          required
          rows={3}
          data-testid="textarea-customer-address"
        />
        {customerAddress.length > 90 && (
          <p className="text-xs text-muted-foreground">
            {120 - customerAddress.length} characters remaining
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Download Format</Label>
        <RadioGroup value={downloadFormat} onValueChange={(value) => setDownloadFormat(value as 'pdf' | 'jpeg')} data-testid="radio-download-format">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pdf" id="format-pdf" data-testid="radio-format-pdf" />
            <Label htmlFor="format-pdf" className="font-normal cursor-pointer">PDF</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="jpeg" id="format-jpeg" data-testid="radio-format-jpeg" />
            <Label htmlFor="format-jpeg" className="font-normal cursor-pointer">JPEG</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1" 
          size="lg"
          onClick={handlePreview}
          disabled={!isFormValid}
          data-testid="button-preview"
        >
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          size="lg"
          disabled={!isFormValid}
          data-testid="button-generate-download"
        >
          <Download className="h-4 w-4 mr-2" />
          Download {downloadFormat.toUpperCase()}
        </Button>
      </div>
    </form>
  );
}
