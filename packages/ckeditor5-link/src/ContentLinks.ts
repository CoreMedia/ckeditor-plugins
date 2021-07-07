import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";
import createInternalLinkView from "./ui/InternalLinkView";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import ContentView from "./ui/ContentView";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 *
 */
export default class ContentLinks extends Plugin {
  static readonly pluginName: string = "ContentLinks";
  private readonly logger: Logger = LoggerProvider.getLogger(ContentLinks.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, LinkEditing];
  }

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.debug(`Initializing ${ContentLinks.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this._extendFormView(linkUI);

    this.logger.debug(`Initialized ${ContentLinks.pluginName} within ${performance.now() - startTimestamp} ms.`);
    return null;
  }

  private _extendFormView(linkUI: LinkUI): void {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const formView = linkUI.formView;
    const internalLinkView = createInternalLinkView(this.editor.locale, formView, linkCommand);

    formView.once("render", () => this._render(internalLinkView, formView));

    /*
     * Workaround to reset the values of linkBehavior and target fields if modal
     * is canceled and reopened after changes have been made. See related issues:
     * ckeditor/ckeditor5-link#78 (now: ckeditor/ckeditor5#4765) and
     * ckeditor/ckeditor5-link#123 (now: ckeditor/ckeditor5#4793)
     */

    if (!(linkUI as any)["_events"] || !(linkUI as any)["_events"].hasOwnProperty("_addFormView")) {
      //@ts-ignore
      linkUI.decorate("_addFormView");
    }

    this.listenTo(linkUI, "_addFormView", () => {
      const { value: href } = <HTMLInputElement>formView.urlInputView.fieldView.element;

      internalLinkView.fieldView.set({
        value: CONTENT_CKE_MODEL_URI_REGEXP.test(href) ? href : null,
      });
    });
  }

  private _render(internalLinkView: LabeledFieldView<ContentView>, formView: LinkFormView): void {
    formView.registerChild(internalLinkView);
    if (!internalLinkView.isRendered) {
      internalLinkView.render();
    }
    formView.element.insertBefore(internalLinkView.element, formView.urlInputView.element.nextSibling);
  }
}
