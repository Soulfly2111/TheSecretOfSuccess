/** All navigation uses original world points; only presentation scales to the pixel raster. */
export const VIEW = Object.freeze({
  worldWidth: 960,
  worldHeight: 540,
  pixelWidth: 640,
  pixelHeight: 360,
});
export const worldToPixel = (value: number) => (value * VIEW.pixelWidth) / VIEW.worldWidth;
export interface ViewRect {
  left: number;
  top: number;
  width: number;
  height: number;
}
export function screenToWorld(x: number, y: number, rect: ViewRect, camera = 0) {
  return {
    x: ((x - rect.left) / rect.width) * VIEW.worldWidth + camera,
    y: ((y - rect.top) / rect.height) * VIEW.worldHeight,
  };
}
export const worldToPercentX = (x: number, camera = 0) => ((x - camera) / VIEW.worldWidth) * 100;
export const worldToPercentY = (y: number) => (y / VIEW.worldHeight) * 100;
export const followCamera = (x: number, width: number = VIEW.worldWidth) =>
  Math.round(Math.max(0, Math.min(width - VIEW.worldWidth, x - VIEW.worldWidth / 2)));
