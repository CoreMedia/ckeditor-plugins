import type { Locator } from "playwright-core";

/**
 * Object providing access to its representation as locator.
 */
export interface Locatable {
  /**
   * Locator for element.
   */
  get locator(): Locator;

  /**
   * Whether the element is currently visible.
   */
  get visible(): Promise<boolean>;
}

export const visible = (locatable: Pick<Locatable, "locator">): Promise<boolean> => locatable.locator.isVisible();
