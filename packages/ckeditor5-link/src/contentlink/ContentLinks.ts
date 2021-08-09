import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 *
 */
export default class ContentLinks extends Plugin {
  static readonly pluginName: string = "ContentLinks";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, LinkEditing, ContentLinkActionsViewExtension, ContentLinkFormViewExtension, ContentLinkCommandHook];
  }

  init(): Promise<void> | null {
    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.#removeInitialMouseDownListener(linkUI);
    this.#addMouseDownListenerForNotDraggables(linkUI);
    return null;
  }

  #removeInitialMouseDownListener(linkUI: LinkUI) {
    linkUI.formView.stopListening(<Emitter>(<unknown>document), "mousedown");
  }

  #addCustomClickOutsideHandler({
    emitter,
    activator,
    callback,
    contextElements,
  }: {
    emitter: Emitter;
    activator: () => boolean;
    callback: () => void;
    contextElements: HTMLElement[];
  }) {
    emitter.listenTo(
      <Emitter>(<unknown>document),
      "mousedown",
      (evt: any, domEvt: { composedPath: () => any; target: any }) => {
        if (!activator()) {
          return;
        }

        // Check if `composedPath` is `undefined` in case the browser does not support native shadow DOM.
        // Can be removed when all supported browsers support native shadow DOM.
        const path = typeof domEvt.composedPath == "function" ? domEvt.composedPath() : [];

        for (const contextElement of contextElements) {
          if (domEvt.target.draggable || contextElement.contains(domEvt.target) || path.includes(contextElement)) {
            return;
          }
        }

        callback();
      }
    );
  }

  #addMouseDownListenerForNotDraggables(linkUI: LinkUI) {
    this.#addCustomClickOutsideHandler({
      emitter: <Emitter>(<unknown>linkUI.formView),
      activator: () => linkUI._isUIInPanel,
      contextElements: [linkUI._balloon.view.element],
      callback: () => linkUI._hideUI(),
    });
  }
}
