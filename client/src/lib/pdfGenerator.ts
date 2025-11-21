import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateInvoicePDF(
  element: HTMLElement,
  invoiceNumber: string,
  format: 'pdf' | 'jpeg' = 'pdf'
): Promise<void> {
  // Print dimensions: 70mm x 50mm at 300 DPI
  // 70mm = 2.7559 inches * 300 DPI = 827 px
  // 50mm = 1.9685 inches * 300 DPI = 591 px
  const printWidth = 827;
  const printHeight = 591;
  
  // Calculate scale factor to render at print resolution
  // Current preview is 1414 x 1007, scale to 827 x 591
  const scaleX = printWidth / element.offsetWidth;
  const scaleY = printHeight / element.offsetHeight;
  const scale = Math.max(scaleX, scaleY);
  
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.offsetWidth,
    height: element.offsetHeight,
  });

  if (format === 'jpeg') {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const link = document.createElement('a');
    link.download = `${invoiceNumber}.jpg`;
    link.href = imgData;
    link.click();
  } else {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [printWidth, printHeight],
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, printWidth, printHeight);

    pdf.save(`${invoiceNumber}.pdf`);
  }
}
