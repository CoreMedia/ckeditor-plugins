import { Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { BBCodeDataProcessor } from "./BBCodeDataProcessor";

/**
 * Applies a data-processor for BBCode.
 */
export class BBCode extends Plugin {
  public static readonly pluginName = "BBCodeDataProcessor";

  init(): void {
    const initInformation = reportInitStart(this);

    this.editor.data.processor = new BBCodeDataProcessor(this.editor.data.viewDocument);

    reportInitEnd(initInformation);
  }
}
