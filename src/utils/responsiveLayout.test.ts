import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getViewportCategory,
  getPaperPixelWidth,
  calculateFitPreviewScale,
  calculateCanvasAutoScale,
  shouldShowHoverPreview,
} from './responsiveLayout';

test('getViewportCategory classifies mobile, tablet, and desktop breakpoints', () => {
  assert.equal(getViewportCategory(320), 'mobile');
  assert.equal(getViewportCategory(390), 'mobile');
  assert.equal(getViewportCategory(767), 'mobile');
  assert.equal(getViewportCategory(768), 'tablet');
  assert.equal(getViewportCategory(1023), 'tablet');
  assert.equal(getViewportCategory(1024), 'desktop');
  assert.equal(getViewportCategory(1440), 'desktop');
});

test('getPaperPixelWidth resolves portrait and landscape paper dimensions', () => {
  assert.equal(getPaperPixelWidth('A4', 'portrait'), 794);
  assert.equal(getPaperPixelWidth('A4', 'landscape'), 1123);
  assert.equal(getPaperPixelWidth('A5', 'portrait'), 559);
  assert.equal(getPaperPixelWidth('Letter', 'landscape'), 1056);
});

test('calculateFitPreviewScale fits wide sheets on narrow screens without shrinking on wide screens', () => {
  const mobileLandscape = calculateFitPreviewScale(390, 'A4', 'landscape', 24);
  assert.ok(mobileLandscape >= 0.32 && mobileLandscape < 0.5);

  const mobilePortrait = calculateFitPreviewScale(390, 'A4', 'portrait', 24);
  assert.ok(mobilePortrait > mobileLandscape && mobilePortrait < 0.7);

  const desktopScale = calculateFitPreviewScale(1100, 'A4', 'landscape', 32);
  assert.equal(desktopScale, 1);
});

test('calculateCanvasAutoScale scales physical canvas down cleanly for 390px and 768px viewports', () => {
  const mobileScale = calculateCanvasAutoScale(390, 'A4', 'landscape', 32);
  assert.ok(mobileScale >= 0.3 && mobileScale <= 0.35);

  const tabletScale = calculateCanvasAutoScale(768, 'A4', 'portrait', 32);
  assert.ok(tabletScale > 0.85 && tabletScale < 1);

  const desktopScale = calculateCanvasAutoScale(1200, 'A4', 'landscape', 32);
  assert.equal(desktopScale, 1);
});

test('shouldShowHoverPreview enables hover preview only on tablet/desktop with fine pointer', () => {
  assert.equal(shouldShowHoverPreview(390, true), false);
  assert.equal(shouldShowHoverPreview(768, false), false);
  assert.equal(shouldShowHoverPreview(768, true), true);
  assert.equal(shouldShowHoverPreview(1440, true), true);
});
