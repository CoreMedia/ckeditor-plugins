export default class Rect {
  static getDomRangeRects(range: Range): Rect[];
  static getBoundingRect(rects: Iterable<Rect>): Rect | null;
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
  constructor(
    source:
      | HTMLElement
      | Range
      | Window
      | ClientRect
      | DOMRect
      | Rect
      | { top: number; right: number; bottom: number; left: number; width: number; height: number },
  );
  clone(): Rect;
  contains(anotherRect: Rect): boolean;
  excludeScrollbarsAndBorders(): Rect;
  getArea(): number;
  getIntersection(anotherRect: Rect): Rect;
  getIntersectionArea(anotherRect: Rect): number;
  getVisible(): Rect | null;
  isEqual(anotherRect: Rect): boolean;
  moveTo(x: number, y: number): Rect;
  moveBy(x: number, y: number): Rect;
}
