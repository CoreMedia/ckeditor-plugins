import type { ModelRange } from "ckeditor5";

/**
 * Meta-data on drop.
 */
export class DropCondition {
  constructor(
    /**
     * Signals, if the drop contained multiple links, to possibly trigger
     * a different behavior on drop.
     */
    readonly multipleContentDrop: boolean,
    /**
     * Signals, if the drop position is at the end of its parent
     * block-element.
     */
    readonly dropAtEndOfBlock: boolean,
    /**
     * Signals, if the drop position is at the start of its parent
     * block-element.
     */
    readonly dropAtStartOfBlock: boolean,
    /**
     * The target drop ranges, if existing. `null` otherwise.
     */
    readonly targetRange: ModelRange | null,
    /**
     * Model attributes at drop position to possibly apply to dropped text.
     */
    readonly selectedAttributes: [string, string | number | boolean][],
  ) {}
}
