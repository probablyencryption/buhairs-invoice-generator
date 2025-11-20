import BulkInvoiceForm from '../BulkInvoiceForm';

export default function BulkInvoiceFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <BulkInvoiceForm
        onGenerate={(data) => console.log('Generate bulk invoices:', data)}
        isProcessing={false}
      />
    </div>
  );
}
