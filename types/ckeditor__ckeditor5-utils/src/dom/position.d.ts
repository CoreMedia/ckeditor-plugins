import Rect from "./rect";

export function getOptimalPosition(options: Options): Position;

export interface Position {
  top: number;
  left: number;
  name: string;
}

export interface Options {
  element?: HTMLElement | undefined;
  target: ConstructorParameters<typeof Rect>[number] | (() => ConstructorParameters<typeof Rect>[number]);
  positions: Array<(targetRect: Rect, elementRect: Rect) => Position | null>;
  limiter?: ConstructorParameters<typeof Rect>[number] | (() => ConstructorParameters<typeof Rect>[number]);
  fitInViewport?: boolean;
}
