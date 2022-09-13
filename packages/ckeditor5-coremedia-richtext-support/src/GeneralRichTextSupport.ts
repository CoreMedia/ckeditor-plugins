import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import RichTextDataFilter from "./RichTextDataFilter";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

/**
 * Wrapper plugin to enable GeneralRichTextSupport based on CKEditor's
 * General HTML Support feature.
 */
class GeneralRichTextSupport extends Plugin {
  static readonly pluginName: string = "GeneralRichTextSupport";

  static readonly requires = [GeneralHtmlSupport, RichTextDataFilter];

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);
    reportInitEnd(initInformation);
  }
}

export default GeneralRichTextSupport;
