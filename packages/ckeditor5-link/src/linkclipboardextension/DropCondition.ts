import Range from "@ckeditor/ckeditor5-engine/src/model/range";

export class DropCondition {
  constructor(
    readonly multipleContentDrop: boolean,
    readonly initialDropAtEndOfParagraph: boolean,
    readonly initialDropAtStartOfParagraph: boolean,
    readonly targetRange: Range | null,
    readonly selectedAttributes: Array<[string, string | number | boolean]>
  ) {}
}
