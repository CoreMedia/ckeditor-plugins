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
     * The target drop ranges, if existing. `null` otherwise.
     */
    readonly targetRange: Range | null,
  ) {}
}
