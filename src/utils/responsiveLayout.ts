import { PageOrientation, PaperSize } from '../types/form';

export type ViewportCategory = 'mobile' | 'tablet' | 'desktop';

export function getViewportCategory(width: number): ViewportCategory {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getPaperPixelWidth(
  paperSize: PaperSize,
  orientation: PageOrientation
): number {
  const portraitWidths: Record<PaperSize, number> = {
    A4: 794,
    A5: 559,
    Letter: 816,
  };
  const landscapeWidths: Record<PaperSize, number> = {
    A4: 1123,
    A5: 794,
    Letter: 1056,
  };

  return orientation === 'landscape'
    ? landscapeWidths[paperSize] || 1123
    : portraitWidths[paperSize] || 794;
}

export function getPreviewTargetMaxWidth(orientation: PageOrientation): number {
  return orientation === 'landscape' ? 960 : 680;
}

export function calculateFitPreviewScale(
  availableWidth: number,
  paperSize: PaperSize,
  orientation: PageOrientation,
  paddingPx = 24
): number {
  const usable = Math.max(240, availableWidth - paddingPx);
  const targetWidth = Math.min(getPaperPixelWidth(paperSize, orientation), getPreviewTargetMaxWidth(orientation));
  if (usable >= targetWidth) return 1;
  const raw = usable / targetWidth;
  return Math.max(0.32, Math.min(1, Math.round(raw * 100) / 100));
}

export function calculateCanvasAutoScale(
  availableWidth: number,
  paperSize: PaperSize,
  orientation: PageOrientation,
  paddingPx = 32
): number {
  const usable = Math.max(240, availableWidth - paddingPx);
  const paperWidth = getPaperPixelWidth(paperSize, orientation);
  if (usable >= paperWidth) return 1;
  const raw = usable / paperWidth;
  return Math.max(0.3, Math.min(1, Math.round(raw * 100) / 100));
}

export function shouldShowHoverPreview(
  viewportWidth: number,
  hasFinePointer: boolean
): boolean {
  return viewportWidth >= 768 && hasFinePointer;
}
