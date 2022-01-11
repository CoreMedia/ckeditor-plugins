import Range from "@ckeditor/ckeditor5-engine/src/model/range";

/**
 * Meta-data on drop.
 */
export class DropCondition {
  constructor(
    /**
     * The target drop ranges, if existing. `null` otherwise.
     */
    readonly targetRange: Range | null,
  ) {}
}
