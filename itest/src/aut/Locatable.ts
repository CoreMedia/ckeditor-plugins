import { Locator } from "playwright";
import { HasVisible } from "../expect/IsVisible/HasVisible";

export const visible = (locatable: Locatable): Promise<boolean> => locatable.locator.isVisible();

/**
 * Object providing access to its representation as locator.
 */
export interface Locatable extends HasVisible {
  /**
   * Locator for element.
   */
  get locator(): Locator;
}
