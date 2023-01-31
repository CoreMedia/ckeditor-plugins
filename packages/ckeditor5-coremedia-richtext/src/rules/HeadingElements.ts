import { replaceHeadingsByElementAndClass } from "./ReplaceHeadingsByElementAndClass";

/**
 * Provides mappings for heading elements.
 *
 * * **Heading N = 1 - 6**
 *
 *   * **Reserved Class:** `p--heading-N`
 *   * **Data View.** `<hN>`
 *   * **Data:** `<p class="p--heading-N>`
 */
export const headingElements = replaceHeadingsByElementAndClass();
