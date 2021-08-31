import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import LinkCommand from "@ckeditor/ckeditor5-link/src/linkcommand";
import { createDecoratorHook } from "../utils";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";

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
    const linkCommand = <LinkCommand>editor.commands.get("link");
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);
    ContentLinks.#removeInitialMouseDownListener(linkUI);
    this.#addMouseEventListenerToHideDialog(linkUI);
    createDecoratorHook(
      linkUI,
      "_hideUI",
      () => {
        const commandValue: string = <string>linkCommand?.value;
        const value = CONTENT_CKE_MODEL_URI_REGEXP.test(commandValue) ? commandValue : undefined;
        linkUI.formView.set({ contentUriPath: value });
        linkUI.actionsView.set({ contentUriPath: value });
      },
      this
    );
    return null;
  }

  static #removeInitialMouseDownListener(linkUI: LinkUI): void {
    linkUI.formView.stopListening(<Emitter>(<unknown>document), "mousedown");
  }

  /*
   * This function listens to mousedown events to hide the balloon.
   * The linkUI balloon used to hide as soon as we "mousedown" anywhere in the document.
   * This behaviour was removed above. Now we need to reactivate it.
   * The difference between the former event listener and this one:
   * We now check if "mousedown" was performed on a draggable element. We will not hide the balloon if this is the case.
   * In this case, we will also listen and react to click events.
   *
   * Why not always listen to click events?
   * The CKEditor5 performs other actions on mousedown. Listening to click events would be too late.
   * E.g. if you listen to click events, clicking on an existing link does not work. CKEditor would open the link's actions view
   * before this listener would receive the click event. This could be too late to work if the activator param checks if the UI panel already exists.
   * In that case, the ui would be closed again.
   */
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
  }): void {
    const EDITOR_CLASS = "ck-editor";
    emitter.listenTo(
      <Emitter>(<unknown>document),
      "mousedown",
      (evt: unknown, domEvt: { composedPath: () => Array<Element>; target: HTMLElement }) => {
        if (!activator()) {
          return;
        }

        // Check if `composedPath` is `undefined` in case the browser does not support native shadow DOM.
        // Can be removed when all supported browsers support native shadow DOM.
        const path: Array<Element> = typeof domEvt.composedPath == "function" ? domEvt.composedPath() : [];

        // Do not close balloon if user clicked on draggable outside of any editor component
        const editorElements = document.getElementsByClassName(EDITOR_CLASS);
        let pathIncludesAnyEditor = false;
        for (const editorElement of editorElements) {
          if (path.includes(editorElement)) {
            pathIncludesAnyEditor = true;
          }
        }

        if (domEvt.target.draggable && !pathIncludesAnyEditor) {
          return;
        }

        // Do not close balloon if user clicked on balloon
        for (const contextElement of contextElements) {
          if (contextElement.contains(domEvt.target) || path.includes(contextElement)) {
            return;
          }
        }

        callback();
      }
    );
    emitter.listenTo(
      <Emitter>(<unknown>document),
      "click",
      (evt: unknown, domEvt: { composedPath: () => Array<Element>; target: HTMLElement }) => {
        if (!activator()) {
          return;
        }

        const path = typeof domEvt.composedPath == "function" ? domEvt.composedPath() : [];
        const editorElements = document.getElementsByClassName(EDITOR_CLASS);

        for (const editorElement of editorElements) {
          if (editorElement.contains(domEvt.target) || path.includes(editorElement)) {
            return;
          }
        }

        for (const contextElement of contextElements) {
          if (contextElement.contains(domEvt.target) || path.includes(contextElement)) {
            return;
          }
        }
        callback();
      }
    );
  }

  #addMouseEventListenerToHideDialog(linkUI: LinkUI): void {
    this.#addCustomClickOutsideHandler({
      emitter: <Emitter>(<unknown>linkUI.formView),
      activator: () => linkUI._isUIInPanel,
      contextElements: [linkUI._balloon.view.element],
      callback: () => {
        linkUI._hideUI();
      },
    });
  }
}
