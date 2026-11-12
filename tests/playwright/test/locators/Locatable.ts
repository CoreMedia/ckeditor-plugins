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

/**
 * Adapts a plain Playwright {@link Locator} into a {@link Locatable}, so it can
 * serve as the root of the pure locator-based view-wrapper chain (balloon
 * panel, link views, ...) without requiring a handle-based wrapper.
 *
 * @param locator - locator to adapt
 */
export const fromLocator = (locator: Locator): Locatable => ({
  get locator(): Locator {
    return locator;
  },
  get visible(): Promise<boolean> {
    return locator.isVisible();
  },
});
