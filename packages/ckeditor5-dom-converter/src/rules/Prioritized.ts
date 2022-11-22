/**
 * Represents an object having a priority.
 */
export interface Prioritized {
  readonly priority: number;
}

/**
 * Method to compare two prioritized objects to sort them by ascending priority
 * (thus descending number). Note, that the sort order adapts the number
 * representation for high and low priorities as defined by
 * CKEditor's `PriorityString`.
 *
 * @example
 * ```typescript
 * const objs: Prioritized[] = [
 *   {priority: -2},
 *   {priority: 2},
 *   {priority: -1},
 *   {priority: 1},
 *   {priority: 0},
 * ];
 *
 * objs.sort(byPriority);
 * // [2, 1, 0, -1, -2]
 * ```
 *
 * @param a - first prioritized object
 * @param b - second prioritized object
 */
const byPriority = (a: Prioritized, b: Prioritized) => b.priority - a.priority;
