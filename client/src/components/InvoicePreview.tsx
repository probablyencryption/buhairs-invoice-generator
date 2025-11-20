import { useRef } from 'react';

interface InvoicePreviewProps {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  preCode?: string;
  logoUrl?: string;
}

export default function InvoicePreview({
  invoiceNumber,
  date,
  customerName,
  customerPhone,
  customerAddress,
  preCode,
  logoUrl,
}: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const addressLines = customerAddress.split('\n').filter(line => line.trim());

  return (
    <div 
      ref={previewRef}
      className="relative bg-white w-full aspect-[7/5] border-2 border-muted shadow-lg rounded-md overflow-hidden"
      style={{ maxWidth: '700px' }}
      data-testid="invoice-preview"
    >
      <div className="absolute inset-0 p-8 flex flex-col">
        <div className="flex justify-between items-start mb-8">
          <div className="text-left">
            <div className="text-xl font-normal tracking-wide" style={{ fontFamily: 'Inter, sans-serif' }}>
              INVOICE {invoiceNumber}
            </div>
            <div className="text-base mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              DATE: {date}
            </div>
          </div>
          
          {logoUrl && (
            <div className="flex-shrink-0">
              <img 
                src={logoUrl} 
                alt="Bu Luxury Hairs Logo" 
                className="h-24 w-auto object-contain"
                data-testid="invoice-logo"
              />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center items-center text-center px-8">
          <h1 
            className="text-5xl font-bold mb-12 tracking-wider"
            style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}
          >
            DELIVERY DETAILS
          </h1>

          <div className="space-y-3 text-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
            <div className="font-medium">{customerName}</div>
            <div className="font-normal">{customerPhone}</div>
            {addressLines.map((line, index) => (
              <div key={index} className="font-normal">{line}</div>
            ))}
          </div>

          {preCode && (
            <div className="mt-8 text-lg font-normal" style={{ fontFamily: 'Inter, sans-serif' }}>
              PRE Code: {preCode}
            </div>
          )}
        </div>

        <div className="text-center pb-4">
          <div className="text-xl border-t-2 border-b-2 border-black py-2 inline-block px-8">
            <span className="tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
              Thank you for shopping with Bu.Hairs!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
