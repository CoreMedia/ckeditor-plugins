import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import RichTextDataProcessor from "./RichTextDataProcessor";
import { COREMEDIA_RICHTEXT_PLUGIN_NAME } from "./Constants";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";

export default class CoreMediaRichText extends Plugin {
  static readonly pluginName: string = COREMEDIA_RICHTEXT_PLUGIN_NAME;

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    // @ts-expect-error Bad Typing, DefinitelyTyped/DefinitelyTyped#60965
    this.editor.data.processor = new RichTextDataProcessor(this.editor);

    reportInitEnd(initInformation);
  }
}
