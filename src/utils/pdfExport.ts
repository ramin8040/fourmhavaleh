import { domToCanvas } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import { PageOrientation, PaperSize } from '../types/form';

export interface PdfPageDimensionsMm {
  widthMm: number;
  heightMm: number;
  format: 'a4' | 'a5' | 'letter';
}

export interface PdfImagePlacement {
  drawWidthMm: number;
  drawHeightMm: number;
  offsetXMm: number;
  offsetYMm: number;
  pageCount: number;
}

const PAPER_MM_PORTRAIT: Record<PaperSize, { w: number; h: number; format: 'a4' | 'a5' | 'letter' }> = {
  A4: { w: 210, h: 297, format: 'a4' },
  A5: { w: 148, h: 210, format: 'a5' },
  Letter: { w: 215.9, h: 279.4, format: 'letter' },
};

const PAPER_PX_WIDTH: Record<PaperSize, { portrait: number; landscape: number }> = {
  A4: { portrait: 794, landscape: 1123 },
  A5: { portrait: 559, landscape: 794 },
  Letter: { portrait: 816, landscape: 1056 },
};

/**
 * Returns exact physical page dimensions in millimeters for jsPDF.
 */
export function getPdfPageDimensionsMm(
  paperSize: PaperSize,
  orientation: PageOrientation
): PdfPageDimensionsMm {
  const base = PAPER_MM_PORTRAIT[paperSize] || PAPER_MM_PORTRAIT.A4;
  if (orientation === 'landscape') {
    return {
      widthMm: base.h,
      heightMm: base.w,
      format: base.format,
    };
  }
  return {
    widthMm: base.w,
    heightMm: base.h,
    format: base.format,
  };
}

/**
 * Returns crisp reference width in CSS pixels matching the target paper & orientation.
 */
export function getPdfReferenceWidthPx(
  paperSize: PaperSize,
  orientation: PageOrientation
): number {
  const entry = PAPER_PX_WIDTH[paperSize] || PAPER_PX_WIDTH.A4;
  return orientation === 'landscape' ? entry.landscape : entry.portrait;
}

/**
 * Builds a clean, OS-safe `.pdf` filename from document title, doc number, and optional record number.
 */
export function buildPdfFileName(
  title?: string,
  docNumber?: string,
  recordNumber?: string
): string {
  const rawTitle = (title || 'سند_اداری')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const parts: string[] = [rawTitle || 'سند_اداری'];
  const cleanRec = recordNumber?.trim().replace(/[\\/:*?"<>|\s]+/g, '-');
  const cleanDoc = docNumber?.trim().replace(/[\\/:*?"<>|\s]+/g, '-');

  if (cleanRec) {
    parts.push(cleanRec);
  } else if (cleanDoc) {
    parts.push(cleanDoc);
  }

  return `${parts.join('_')}.pdf`;
}

/**
 * Computes scaled image placement inside printable page area and estimates multi-page count.
 */
export function calculatePdfImagePlacement(
  imgWidthPx: number,
  imgHeightPx: number,
  pageWidthMm: number,
  pageHeightMm: number,
  marginMm = 6
): PdfImagePlacement {
  const safeImgW = Math.max(1, imgWidthPx);
  const safeImgH = Math.max(1, imgHeightPx);
  const usableWidthMm = Math.max(20, pageWidthMm - marginMm * 2);
  const usableHeightMm = Math.max(20, pageHeightMm - marginMm * 2);

  const aspect = safeImgH / safeImgW;
  let drawWidthMm = usableWidthMm;
  let drawHeightMm = drawWidthMm * aspect;

  // If the rendered sheet overflows by <= 8% (minor border/padding variance),
  // fit gracefully onto a single clean official page rather than creating a nearly blank page 2.
  if (drawHeightMm > usableHeightMm && drawHeightMm <= usableHeightMm * 1.08) {
    const scaleFactor = usableHeightMm / drawHeightMm;
    drawWidthMm = drawWidthMm * scaleFactor;
    drawHeightMm = usableHeightMm;
  }

  const pageCount = Math.max(1, Math.ceil((drawHeightMm - 0.5) / usableHeightMm));
  const offsetXMm = (pageWidthMm - drawWidthMm) / 2;
  const offsetYMm = marginMm;

  return {
    drawWidthMm: Number(drawWidthMm.toFixed(2)),
    drawHeightMm: Number(drawHeightMm.toFixed(2)),
    offsetXMm: Number(offsetXMm.toFixed(2)),
    offsetYMm: Number(offsetYMm.toFixed(2)),
    pageCount,
  };
}

export interface ExportDomToPdfOptions {
  paperSize: PaperSize;
  orientation: PageOrientation;
  fileName: string;
  scale?: number;
  marginMm?: number;
}

/**
 * Captures a rendered official print DOM element at high resolution and saves it as a real PDF.
 */
export async function exportDomElementToPdf(
  element: HTMLElement,
  options: ExportDomToPdfOptions
): Promise<{ pageCount: number; fileName: string }> {
  const { paperSize, orientation, fileName, scale = 2, marginMm = 6 } = options;

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue even if remote font promise settles with warning
    }
  }

  // Wait two animation frames to ensure images/logos/styles are painted
  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  );

  const canvas = await domToCanvas(element, {
    scale,
    backgroundColor: '#ffffff',
  });

  const dims = getPdfPageDimensionsMm(paperSize, orientation);
  const placement = calculatePdfImagePlacement(
    canvas.width,
    canvas.height,
    dims.widthMm,
    dims.heightMm,
    marginMm
  );

  const pdf = new jsPDF({
    orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
    unit: 'mm',
    format: dims.format,
    compress: true,
  });

  const usableHeightMm = dims.heightMm - marginMm * 2;
  const imgData = canvas.toDataURL('image/png');

  if (placement.pageCount <= 1) {
    pdf.addImage(
      imgData,
      'PNG',
      placement.offsetXMm,
      placement.offsetYMm,
      placement.drawWidthMm,
      placement.drawHeightMm,
      undefined,
      'FAST'
    );
  } else {
    // Slice vertically across pages without clipping content
    const pxPerMm = canvas.height / placement.drawHeightMm;
    const sliceHeightPx = Math.max(1, Math.floor(usableHeightMm * pxPerMm));

    for (let pageIdx = 0; pageIdx < placement.pageCount; pageIdx++) {
      if (pageIdx > 0) {
        pdf.addPage(dims.format, orientation === 'landscape' ? 'landscape' : 'portrait');
      }
      const sourceY = pageIdx * sliceHeightPx;
      const remainingPx = Math.max(1, canvas.height - sourceY);
      const currentSlicePx = Math.min(sliceHeightPx, remainingPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSlicePx;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          currentSlicePx,
          0,
          0,
          canvas.width,
          currentSlicePx
        );
      }

      const sliceHeightMm = currentSlicePx / pxPerMm;
      const sliceData = pageCanvas.toDataURL('image/png');
      pdf.addImage(
        sliceData,
        'PNG',
        placement.offsetXMm,
        placement.offsetYMm,
        placement.drawWidthMm,
        sliceHeightMm,
        undefined,
        'FAST'
      );
    }
  }

  pdf.save(fileName);
  return { pageCount: placement.pageCount, fileName };
}
