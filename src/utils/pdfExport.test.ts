import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPdfPageDimensionsMm,
  getPdfReferenceWidthPx,
  buildPdfFileName,
  calculatePdfImagePlacement,
} from './pdfExport';

test('getPdfPageDimensionsMm returns accurate mm sizes for A4, A5, and Letter', () => {
  const a4Portrait = getPdfPageDimensionsMm('A4', 'portrait');
  assert.deepEqual(a4Portrait, { widthMm: 210, heightMm: 297, format: 'a4' });

  const a4Landscape = getPdfPageDimensionsMm('A4', 'landscape');
  assert.deepEqual(a4Landscape, { widthMm: 297, heightMm: 210, format: 'a4' });

  const a5Landscape = getPdfPageDimensionsMm('A5', 'landscape');
  assert.deepEqual(a5Landscape, { widthMm: 210, heightMm: 148, format: 'a5' });

  const letterPortrait = getPdfPageDimensionsMm('Letter', 'portrait');
  assert.deepEqual(letterPortrait, { widthMm: 215.9, heightMm: 279.4, format: 'letter' });
});

test('getPdfReferenceWidthPx returns crisp reference pixel widths', () => {
  assert.equal(getPdfReferenceWidthPx('A4', 'portrait'), 794);
  assert.equal(getPdfReferenceWidthPx('A4', 'landscape'), 1123);
  assert.equal(getPdfReferenceWidthPx('A5', 'portrait'), 559);
});

test('buildPdfFileName sanitizes invalid filename characters and appends record/doc identifier', () => {
  assert.equal(
    buildPdfFileName('حواله خروج محصول', '۱', 'DOC-1403-0001'),
    'حواله_خروج_محصول_DOC-1403-0001.pdf'
  );
  assert.equal(
    buildPdfFileName('رسید / کالا: انبار*', '12'),
    'رسید_کالا_انبار_12.pdf'
  );
  assert.equal(buildPdfFileName(''), 'سند_اداری.pdf');
});

test('calculatePdfImagePlacement fits single-page documents cleanly and slices tall documents', () => {
  // Standard A4 landscape aspect ~ 1123x760 fits on 1 page
  const single = calculatePdfImagePlacement(1123, 760, 297, 210, 6);
  assert.equal(single.pageCount, 1);
  assert.equal(single.drawWidthMm, 285);
  assert.ok(single.drawHeightMm < 198);

  // Minor overflow within 8% tolerance shrinks slightly onto 1 clean page
  const nearFit = calculatePdfImagePlacement(1000, 1450, 210, 297, 6);
  assert.equal(nearFit.pageCount, 1);
  assert.equal(nearFit.drawHeightMm, 285);

  // Very tall multi-page document splits cleanly into >= 2 pages
  const tall = calculatePdfImagePlacement(1000, 2800, 210, 297, 6);
  assert.ok(tall.pageCount >= 2);
});
