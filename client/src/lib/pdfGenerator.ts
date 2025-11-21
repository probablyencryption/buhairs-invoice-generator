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
  
  // Force a reflow to ensure all inline styles are applied
  element.offsetHeight;
  
  // Wait for styles to be fully computed and applied
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Calculate scale factor to render at print resolution
  // We want to render at 3x scale for high quality, then resize to target dimensions
  const scale = 3;
  
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.offsetWidth,
    height: element.offsetHeight,
    windowWidth: element.offsetWidth,
    windowHeight: element.offsetHeight,
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
