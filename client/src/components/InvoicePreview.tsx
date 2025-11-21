import { forwardRef } from 'react';

interface InvoicePreviewProps {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  preCode?: string;
  logoUrl?: string;
}

const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  ({
    invoiceNumber,
    date,
    customerName,
    customerPhone,
    customerAddress,
    preCode,
    logoUrl,
  }, ref) => {

  const addressLines = customerAddress.split('\n').filter(line => line.trim());
  // Truncate address to max 3 lines
  const truncatedAddressLines = addressLines.slice(0, 3);

  return (
    <div 
      ref={ref}
      className="relative bg-white border-2 border-muted shadow-lg rounded-md overflow-hidden"
      style={{ width: '827px', height: '591px' }}
      data-testid="invoice-preview"
    >
      <div className="absolute inset-0 px-3 pt-1 pb-3 flex flex-col">
        <div className="flex justify-between items-center mb-1">
          <div className="text-left">
            <div className="text-xs font-normal tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              INVOICE {invoiceNumber}
            </div>
            <div className="text-xs mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
              DATE: {date}
            </div>
          </div>
          
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt="Bu Luxury Hairs Logo" 
                className="h-20 w-auto object-contain"
                data-testid="invoice-logo"
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center px-4 overflow-hidden">
          <h1 
            className="text-base font-bold mb-2 tracking-wider whitespace-nowrap text-center"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.15em' }}
          >
            DELIVERY DETAILS
          </h1>

          <div className="text-sm text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="font-medium mb-2">{customerName}</div>
            <div className="font-normal mb-2">{customerPhone}</div>
            <div className="space-y-1">
              {truncatedAddressLines.map((line, index) => (
                <div key={index} className="font-normal">{line}</div>
              ))}
            </div>
          </div>
        </div>

        {preCode && (
          <div className="text-base font-bold text-left mb-1 px-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            PRE{preCode}
          </div>
        )}

        <div className="text-center pb-2">
          <div className="text-center text-xs tracking-wider overflow-hidden mb-0.5">
            ************************************************
          </div>
          <div className="whitespace-nowrap">
            <span className="text-xs tracking-wide px-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              Thank you for shopping with Bu.Hairs!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
