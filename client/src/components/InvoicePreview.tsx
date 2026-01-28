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
        style={{
          width: '827px',
          height: '591px',
          backgroundColor: '#ffffff',
          color: '#1A1A1A',
          fontFamily: 'Helvetica, Arial, sans-serif',
          position: 'relative',
          border: 'none',
          boxShadow: 'none'
        }}
        data-testid="invoice-preview"
      >
        {/* Header Section - Invoice/Date and Logo */}
        <div style={{
          padding: '24px 24px 0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          {/* Invoice and Date - Top Left */}
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              lineHeight: '1.3'
            }}>
              INVOICE {invoiceNumber}
            </div>
            <div style={{
              fontSize: '20px',
              fontWeight: 200,
              marginTop: '4px',
              letterSpacing: '0.15em',
              lineHeight: '1.3'
            }}>
              DATE: {date}
            </div>
          </div>

          {/* Logo - Top Right */}
          {logoUrl && (
            <div style={{ flexShrink: 0, marginTop: '-14px' }}>
              <img
                src={logoUrl}
                alt="BU HAIRS Logo"
                style={{
                  height: '170px',
                  width: '280px',
                  objectFit: 'contain',
                  display: 'block'
                }}
                data-testid="invoice-logo"
              />
            </div>
          )}
        </div>

        {/* Main Content - Delivery Details */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: '-8px'
        }}>
          <h1 style={{
            fontSize: '38px',
            fontWeight: 300,
            letterSpacing: '0.2em',
            marginBottom: '18px',
            textAlign: 'center'
          }}>
            DELIVERY DETAILS
          </h1>

          {/* Customer Information */}
          <div style={{
            fontSize: '32px',
            lineHeight: '1.4',
            letterSpacing: '0.15em',
            textAlign: 'center'
          }}>
            <div style={{
              fontWeight: 200,
              marginBottom: '10px'
            }}>
              {customerName}
            </div>
            <div style={{
              fontWeight: 200,
              marginBottom: '10px'
            }}>
              {customerPhone}
            </div>
            <div>
              {truncatedAddressLines.map((line, index) => (
                <div
                  key={index}
                  style={{
                    fontWeight: 200,
                    marginBottom: index < truncatedAddressLines.length - 1 ? '8px' : '0'
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Section - PRE Code, Asterisks, Thank You */}
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '0 24px 24px 24px'
        }}>
          {preCode && (
            <div style={{
              fontSize: '28px',
              fontWeight: 300,
              letterSpacing: '0.15em',
              textAlign: 'right',
              marginBottom: '8px'
            }}>
              PRE{preCode}
            </div>
          )}
          <div style={{
            fontSize: '20px',
            fontWeight: 200,
            letterSpacing: '0.15em',
            marginBottom: '8px',
            textAlign: 'center',
            overflow: 'hidden'
          }}>
            ************************************************
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontSize: '20px',
              fontWeight: 200,
              letterSpacing: '0.15em'
            }}>
              Thank you for shopping with BU HAIRS!
            </span>
          </div>
        </div>
      </div>
    );
  });

InvoicePreview.displayName = 'InvoicePreview';

export default InvoicePreview;
