import Range from "@ckeditor/ckeditor5-engine/src/model/range";

export class DropCondition {
  initialDropAtEndOfParagraph: boolean;
  initialDropAtStartOfParagraph: boolean;
  multipleContentDrop: boolean;
  targetRange: Range | null;
  selectedAttributes: Array<[string, string | number | boolean]>;

  constructor(
    multipleContentDrop: boolean,
    initialDropAtEndOfParagraph: boolean,
    initialDropAtStartOfParagraph: boolean,
    targetRange: Range | null,
    selectedAttributes: Array<[string, string | number | boolean]>
  ) {
    this.multipleContentDrop = multipleContentDrop;
    this.initialDropAtEndOfParagraph = initialDropAtEndOfParagraph;
    this.initialDropAtStartOfParagraph = initialDropAtStartOfParagraph;
    this.targetRange = targetRange;
    this.selectedAttributes = selectedAttributes;
  }
}
