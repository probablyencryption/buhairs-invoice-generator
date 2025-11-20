import InvoiceHistory from '../InvoiceHistory';

export default function InvoiceHistoryExample() {
  const mockInvoices = [
    {
      id: '1',
      invoiceNumber: 'BLH#2799',
      date: '19/11/2025',
      customerName: 'Adeyemi Emmanuel',
      customerPhone: '09168518900',
      customerAddress: '6 Bailey street Abule Ijesha Yaba',
    },
    {
      id: '2',
      invoiceNumber: 'BLH#2800',
      date: '20/11/2025',
      customerName: 'Chioma Okafor',
      customerPhone: '08012345678',
      customerAddress: '15 Victoria Island Lagos',
    },
    {
      id: '3',
      invoiceNumber: 'BLH#2801',
      date: '20/11/2025',
      customerName: 'Ibrahim Musa',
      customerPhone: '07087654321',
      customerAddress: '22 Wuse Zone 4 Abuja',
    },
  ];

  return (
    <div className="p-6">
      <InvoiceHistory
        invoices={mockInvoices}
        onView={(invoice) => console.log('View invoice:', invoice)}
        onDownload={(invoice) => console.log('Download invoice:', invoice)}
      />
    </div>
  );
}
