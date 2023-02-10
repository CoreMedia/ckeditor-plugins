import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import { Emitter } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { keepOpen } from "./LinkBalloonConfig";

/**
 * Removes the mousedown listener in the linkUI plugin.
 * Context: CKEditor closes contextual balloons when a mousedown outside
 * the editor is detected. If a different behavior is to be implemented,
 * this function should be used to remove the initial listeners.
 *
 * @param linkUI - the linkUI plugin
 */
export const removeInitialMouseDownListener = (linkUI: LinkUI): void => {
  const { formView } = linkUI;
  formView.stopListening(document as unknown as Emitter, "mousedown");
};

/**
 * This function listens to mousedown events to hide the balloon.
 *
 * The linkUI balloon used to hide as soon as we "mousedown" anywhere in the
 * document. This behaviour was removed above. Now we need to reactivate it.
 * The difference between the former event listener and this one:
 *
 * We now check if "mousedown" was performed on a draggable element. We will
 * not hide the balloon if this is the case. In this case, we will also listen
 * and react to click events.
 *
 * Why not always listen to click events?
 *
 * The CKEditor5 performs other actions on mousedown. Listening to click
 * events would be too late. E.g., if you listen to click events, clicking on
 * an existing link does not work. CKEditor would open the link's actions view
 * before this listener would receive the click event. This could be too late
 * to work if the activator param checks if the UI panel already exists. In
 * that case, the UI would be closed again.
 *
 * @param linkUI - the linkUI plugin
 */
export const addMouseEventListenerToHideDialog = (linkUI: LinkUI): void => {
  const { formView } = linkUI;

  addCustomClickOutsideHandler({
    emitter: formView,
    // @ts-expect-error TODO Fix Typings
    activator: () => linkUI._isUIInPanel as boolean,
    // @ts-expect-error TODO Fix Typings
    // eslint-disable-next-line
    contextElements: [linkUI._balloon.view.element],
    callback: () => {
      // @ts-expect-error TODO Fix Typings
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      linkUI._hideUI();
    },
  });
};

const addCustomClickOutsideHandler = ({
  emitter,
  activator,
  callback,
  contextElements,
}: {
  emitter: Emitter;
  activator: () => boolean;
  callback: () => void;
  contextElements: HTMLElement[];
}): void => {
  const EDITOR_CLASS = "ck-editor";
  emitter.listenTo(
    document as unknown as Emitter,
    "mousedown",
    (evt: unknown, domEvt: { composedPath: () => Element[]; target: HTMLElement }) => {
      if (!activator()) {
        return;
      }

      // Check if `composedPath` is `undefined` in case the browser does not support native shadow DOM.
      // Can be removed when all supported browsers support native shadow DOM.
      const path: Element[] = typeof domEvt.composedPath === "function" ? domEvt.composedPath() : [];

      // Do not close balloon if user clicked on draggable outside any editor component
      const editorElements = document.getElementsByClassName(EDITOR_CLASS);
      let pathIncludesAnyEditor = false;
      for (const editorElement of editorElements) {
        if (path.includes(editorElement)) {
          pathIncludesAnyEditor = true;
        }
      }

      if (keepOpen(path)) {
        return;
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
    document as unknown as Emitter,
    "click",
    (evt: unknown, domEvt: { composedPath: () => Element[]; target: HTMLElement }) => {
      if (!activator()) {
        return;
      }

      const path = typeof domEvt.composedPath === "function" ? domEvt.composedPath() : [];
      const editorElements = document.getElementsByClassName(EDITOR_CLASS);

      for (const editorElement of editorElements) {
        if (editorElement.contains(domEvt.target) || path.includes(editorElement)) {
          return;
        }
      }

      if (keepOpen(path)) {
        return;
      }

      for (const contextElement of contextElements) {
        if (contextElement.contains(domEvt.target) || path.includes(contextElement)) {
          return;
        }
      }
      callback();
    }
  );
};