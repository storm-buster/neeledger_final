import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converts an HTML string into a PDF Blob.
 * It creates a temporary hidden container to render the HTML,
 * captures it with html2canvas, and adds it to a jsPDF instance.
 */
export async function generatePdfBlobFromHtml(htmlContent: string): Promise<Blob> {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; // Standard width for decent resolution
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Wait for any images or styles to load if necessary
    // html2canvas handles most of this
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width / 2, canvas.height / 2] // Match canvas size roughly
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    const blob = pdf.output('blob');
    return blob;
  } finally {
    // Cleanup
    document.body.removeChild(container);
  }
}
