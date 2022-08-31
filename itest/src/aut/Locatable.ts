import { Locator } from "playwright";

/**
 * Object providing access to its representation as locator.
 */
export interface Locatable {
  /**
   * Locator for element.
   */
  get locator(): Locator;
}
