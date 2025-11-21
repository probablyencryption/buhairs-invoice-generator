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
      className="relative bg-white border-2 border-gray-300 shadow-lg"
      style={{ 
        width: '2646px',
        height: '1890px',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
      data-testid="invoice-preview"
    >
      <div className="flex flex-col h-full">
        <div className="px-16 pt-12 pb-8">
          <div className="flex justify-between items-start">
            <div className="text-left">
              <div className="text-5xl font-bold mb-3" style={{ fontSize: '48px', lineHeight: '1.2' }}>
                INVOICE {invoiceNumber}
              </div>
              <div className="text-4xl" style={{ fontSize: '36px', lineHeight: '1.2' }}>
                DATE: {date}
              </div>
            </div>
            
            {logoUrl && (
              <div 
                className="flex items-center justify-center bg-white"
                style={{
                  width: '660px',
                  height: '380px',
                  border: '12px solid #B22222',
                  padding: '20px'
                }}
              >
                <img 
                  src={logoUrl} 
                  alt="Bu Luxury Hairs Logo" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                  data-testid="invoice-logo"
                />
              </div>
            )}
          </div>
        </div>

        <div 
          className="w-full"
          style={{
            borderBottom: '10px solid #3BB143',
            marginBottom: '60px'
          }}
        />

        <div className="flex-1 flex flex-col items-center px-16">
          <h1 
            className="text-center font-bold uppercase mb-16"
            style={{ 
              fontSize: '120px',
              letterSpacing: '0.2em',
              lineHeight: '1.2'
            }}
          >
            DELIVERY DETAILS
          </h1>

          <div className="text-center space-y-6" style={{ fontSize: '56px', lineHeight: '1.4' }}>
            <div className="font-bold">{customerName}</div>
            <div className="font-normal">{customerPhone}</div>
            {addressLines.map((line, index) => (
              <div key={index} className="font-normal">{line}</div>
            ))}
          </div>
          
          {preCode && (
            <div 
              className="mt-12 font-bold text-left w-full"
              style={{ 
                fontSize: '64px',
                paddingLeft: '120px'
              }}
            >
              PRE{preCode}
            </div>
          )}
        </div>

        <div className="text-center pb-12 mt-auto px-16">
          <div 
            className="text-center tracking-wider mb-4"
            style={{ 
              fontSize: '32px',
              letterSpacing: '0.05em'
            }}
          >
            ************************************************
          </div>
          <div 
            className="font-normal"
            style={{ fontSize: '40px' }}
          >
            Thank you for shopping with Bu.Hairs!
          </div>
        </div>
      </div>
    </div>
  );
});

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
