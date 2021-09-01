import Range from "@ckeditor/ckeditor5-engine/src/model/range";

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
     * Signals, if the the drop position is at the end of its parent.
     */
    readonly dropAtEnd: boolean,
    /**
     * Signals, if the the drop position is at the start of its parent.
     */
    readonly dropAtStart: boolean,
    /**
     * The target drop ranges, if existing. `null` otherwise.
     */
    readonly targetRange: Range | null,
    /**
     * Model attributes at drop position to possibly apply to dropped text.
     */
    readonly selectedAttributes: Array<[string, string | number | boolean]>
  ) {}
}
