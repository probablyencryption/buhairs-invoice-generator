import SingleInvoiceForm from '../SingleInvoiceForm';

export default function SingleInvoiceFormExample() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <SingleInvoiceForm
        onGenerate={(data) => console.log('Generate invoice:', data)}
        onLogoUpload={(dataUrl) => console.log('Logo uploaded:', dataUrl)}
      />
    </div>
  );
}
