import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateInvoicePDF(
  element: HTMLElement,
  invoiceNumber: string,
  format: 'pdf' | 'jpeg' = 'pdf'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  if (format === 'jpeg') {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.download = `${invoiceNumber}.jpg`;
    link.href = imgData;
    link.click();
  } else {
    const imgWidth = 70;
    const imgHeight = 50;
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [imgWidth, imgHeight],
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    pdf.save(`${invoiceNumber}.pdf`);
  }
}
