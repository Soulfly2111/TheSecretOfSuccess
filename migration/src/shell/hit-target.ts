export type HitPoint = { x: number; y: number };

export type RankedHitTarget<T = HTMLElement> = {
  element: T;
  exact: boolean;
  zIndex: number;
  order: number;
  distance: number;
};

/**
 * Applies the shared visual hit priority used by mouse and touch input.
 * An exact painted hit always beats an enlarged touch-only hit. Exact hits
 * follow the paint order; touch-only ties favor the closest object.
 */
export function rankHitTargets<T>(targets: RankedHitTarget<T>[]): RankedHitTarget<T>[] {
  const exact = targets.filter((target) => target.exact);
  return (exact.length ? exact : targets).sort((a, b) => {
    if (!exact.length && a.distance !== b.distance) return a.distance - b.distance;
    if (a.zIndex !== b.zIndex) return b.zIndex - a.zIndex;
    if (a.order !== b.order) return b.order - a.order;
    return a.distance - b.distance;
  });
}

function numericZIndex(element: HTMLElement): number {
  const value = Number.parseInt(getComputedStyle(element).zIndex, 10);
  return Number.isFinite(value) ? value : 0;
}

export function resolveHitTarget(
  elements: Iterable<HTMLElement>,
  point: HitPoint,
  sceneRect: DOMRect,
  touch = false,
): HTMLElement | null {
  const ranked: RankedHitTarget[] = [];
  let order = 0;
  for (const element of elements) {
    const rect = element.getBoundingClientRect();
    const currentOrder = order++;
    if (
      element.hidden ||
      rect.right <= sceneRect.left ||
      rect.left >= sceneRect.right ||
      rect.bottom <= sceneRect.top ||
      rect.top >= sceneRect.bottom
    )
      continue;

    const exact =
      point.x >= Math.max(sceneRect.left, rect.left) &&
      point.x <= Math.min(sceneRect.right, rect.right) &&
      point.y >= Math.max(sceneRect.top, rect.top) &&
      point.y <= Math.min(sceneRect.bottom, rect.bottom);
    const growX = touch ? Math.max(0, (44 - rect.width) / 2) : 0;
    const growY = touch ? Math.max(0, (44 - rect.height) / 2) : 0;
    const expanded =
      point.x >= Math.max(sceneRect.left, rect.left - growX) &&
      point.x <= Math.min(sceneRect.right, rect.right + growX) &&
      point.y >= Math.max(sceneRect.top, rect.top - growY) &&
      point.y <= Math.min(sceneRect.bottom, rect.bottom + growY);
    if (!exact && !expanded) continue;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    ranked.push({
      element,
      exact,
      zIndex: numericZIndex(element),
      order: currentOrder,
      distance: Math.hypot(point.x - centerX, point.y - centerY),
    });
  }
  return rankHitTargets(ranked)[0]?.element ?? null;
}
