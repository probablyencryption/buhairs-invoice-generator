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

  return (
    <div 
      ref={ref}
      className="relative bg-white w-full aspect-[7/5] border-2 border-muted shadow-lg rounded-md overflow-hidden"
      style={{ maxWidth: '700px' }}
      data-testid="invoice-preview"
    >
      <div className="absolute inset-0 px-6 pt-2 pb-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="text-left">
            <div className="text-sm font-normal tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              INVOICE {invoiceNumber}
            </div>
            <div className="text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              DATE: {date}
            </div>
          </div>
          
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt="Bu Luxury Hairs Logo" 
                className="h-44 w-auto object-contain"
                data-testid="invoice-logo"
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center px-8 pt-2 overflow-hidden">
          <h1 
            className="text-3xl font-bold mb-8 tracking-wider whitespace-nowrap text-center"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.15em' }}
          >
            DELIVERY DETAILS
          </h1>

          <div className="space-y-2 text-xl text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="font-medium">{customerName}</div>
            <div className="font-normal">{customerPhone}</div>
            {addressLines.map((line, index) => (
              <div key={index} className="font-normal">{line}</div>
            ))}
          </div>
          
          {preCode && (
            <div className="mt-4 text-2xl font-bold text-left w-full pl-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              PRE{preCode}
            </div>
          )}
        </div>

        <div className="text-center pb-3">
          <div className="text-center text-sm tracking-wider overflow-hidden mb-1">
            ************************************************
          </div>
          <div className="whitespace-nowrap">
            <span className="text-sm tracking-wide px-2" style={{ fontFamily: 'Inter, sans-serif' }}>
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
