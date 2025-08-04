import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface PDFGenerationOptions {
  elementId: string; // ID of the React component element to convert to PDF
  filename?: string;
}

/**
 * Generates a PDF from a React component that's currently rendered in the DOM
 * @param options - Configuration for PDF generation
 */
export const generatePDFFromElement = async ({
  elementId,
  filename = "ticket.pdf",
}: PDFGenerationOptions): Promise<void> => {
  try {
    const element = document.getElementById(elementId);

    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`);
    }

    // Wait for any images to load
    await waitForImages(element);

    // Get the actual element dimensions
    const rect = element.getBoundingClientRect();
    const elementWidth = rect.width;
    const elementHeight = rect.height;

    // Calculate the scale needed to fit A4 properly
    // A4 dimensions: 210mm x 297mm = 794px x 1123px at 96 DPI
    const a4WidthPx = 794;
    const a4HeightPx = 1123;

    // Use higher scale for better quality
    const scale = 3;

    // Generate canvas from the element with proper dimensions
    const canvas = await html2canvas(element, {
      width: elementWidth,
      height: elementHeight,
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      logging: false,
      imageTimeout: 15000,
      removeContainer: true,
    });

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // A4 dimensions in mm
    const a4WidthMm = 210;
    const a4HeightMm = 297;

    // Calculate aspect ratios
    const canvasAspectRatio = canvas.width / canvas.height;
    const a4AspectRatio = a4WidthMm / a4HeightMm;

    let imgWidth,
      imgHeight,
      offsetX = 0,
      offsetY = 0;

    if (canvasAspectRatio > a4AspectRatio) {
      // Canvas is wider relative to A4, fit to width
      imgWidth = a4WidthMm;
      imgHeight = a4WidthMm / canvasAspectRatio;
      offsetY = (a4HeightMm - imgHeight) / 2;
    } else {
      // Canvas is taller relative to A4, fit to height
      imgHeight = a4HeightMm;
      imgWidth = a4HeightMm * canvasAspectRatio;
      offsetX = (a4WidthMm - imgWidth) / 2;
    }

    // Convert canvas to image and add to PDF
    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", offsetX, offsetY, imgWidth, imgHeight);

    // Download the PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("Failed to generate PDF ticket");
  }
};

/**
 * Utility function to wait for all images in an element to load
 */
const waitForImages = (element: HTMLElement): Promise<void> => {
  return new Promise((resolve) => {
    const images = element.querySelectorAll("img");

    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete && img.naturalHeight !== 0) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded; // Continue even if image fails to load
      }
    });
  });
};
