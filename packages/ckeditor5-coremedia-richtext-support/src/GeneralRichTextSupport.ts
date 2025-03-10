import { Plugin, GeneralHtmlSupport } from "ckeditor5";
import RichTextDataFilter from "./RichTextDataFilter";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

/**
 * Wrapper plugin to enable GeneralRichTextSupport based on CKEditor's
 * General HTML Support feature.
 */
class GeneralRichTextSupport extends Plugin {
  public static readonly pluginName = "GeneralRichTextSupport" as const;
  static readonly requires = [GeneralHtmlSupport, RichTextDataFilter];

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);
    reportInitEnd(initInformation);
  }
}

export default GeneralRichTextSupport;
