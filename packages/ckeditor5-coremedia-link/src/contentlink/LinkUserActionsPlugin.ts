import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import {
  EditingView,
  ViewDocumentFragment,
  ViewElement,
  TextProxy,
  Element as ModelElement,
  Node as ModelNode,
} from "@ckeditor/ckeditor5-engine";
import { serviceAgent } from "@coremedia/service-agent";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/WorkAreaServiceDescriptor";
import { openLink } from "@ckeditor/ckeditor5-link/src/utils";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import Logger from "@coremedia/ckeditor5-logging/src/logging/Logger";
import {
  isModelUriPath,
  requireContentUriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/UriPath";
import { env, keyCodes } from "@ckeditor/ckeditor5-utils";

/**
 * A Plugin to override default behavior for user action on links in CKEditor.
 *
 * CKEditor default for ctrl + click or alt + enter opens the underlying link
 * in a new browser tab. For external links it is fine, but content links should
 * be opened in a new work area tab, because browsers do not know how to handle them.
 *
 * Per default, in read only mode links are clickable (but not selectable for keyboard events)
 * and are opened in the same tab. For content links nothing happens as # is loaded
 * as the same page but external links are opened and users lose the CMS context.
 * Therefore, this plugin overrides the behavior and opens external links in a new
 * browser tab instead of the same tab and content links in a new work area tab.
 */
export default class LinkUserActionsPlugin extends Plugin {
  public static readonly pluginName = "LinkUserActionsPlugin" as const;
  static readonly LOG: Logger = LoggerProvider.getLogger(LinkUserActionsPlugin.pluginName);
  static readonly requires = [];

  init(): void {
    this.#handleLinkClicksInReadOnly();
    this.#handleContentLinkClicksInReadOnly();
  }

  /**
   * Overrides the link clicks in read only mode.
   * External links will be opened in new browser tab, content links in new
   * work area tab.
   *
   * @private
   */
  #handleLinkClicksInReadOnly() {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.listenTo(
      viewDocument,
      "click",
      (evt, data: { domTarget: Element; preventDefault: () => void; view: EditingView }) => {
        if (!editor.isReadOnly) {
          return;
        }
        let clickedElement: Element | null = (data as { domTarget: Element }).domTarget;
        if (clickedElement.tagName.toLowerCase() !== "a") {
          clickedElement = clickedElement.closest("a");
        }
        if (!clickedElement) {
          return;
        }

        evt.stop();
        data.preventDefault();
        this.#onReadOnlyLinkClicked(editor, data.view, clickedElement);
      },
      //@ts-expect-error context is not part of the types but in ckeditor5-link/src/linkediting the event is caught in capture phase
      { priority: "high", context: "$capture" },
    );
  }

  #onReadOnlyLinkClicked(editor: Editor, view: EditingView, domElement: Element): void {
    const modelElement: TextProxy | undefined = this.#resolveAnchorModelElement(editor, view, domElement);
    if (!modelElement) {
      return;
    }
    const linkHref: string = modelElement.getAttribute("linkHref") as string;
    if (isModelUriPath(linkHref)) {
      this.#openInWorkAreaTab(linkHref);
    } else {
      openLink(linkHref);
    }
  }

  /**
   * Prevents CKEditor from opening content links in new browser tab and instead
   * opens the content links in the work area.
   *
   * @private
   */
  #handleContentLinkClicksInReadOnly() {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.listenTo(
      viewDocument,
      "click",
      (
        evt,
        data: {
          domEvent: { metaKey: boolean; ctrlKey: boolean };
          domTarget: Element;
          preventDefault: () => void;
          view: EditingView;
        },
      ) => {
        if (editor.isReadOnly) {
          return;
        }
        const shouldOpen: boolean = env.isMac ? data.domEvent.metaKey : data.domEvent.ctrlKey;
        if (!shouldOpen) {
          return;
        }

        let clickedElement: Element | null = (data as { domTarget: Element }).domTarget;
        if (clickedElement.tagName.toLowerCase() !== "a") {
          clickedElement = clickedElement.closest("a");
        }
        if (!clickedElement) {
          return;
        }

        const anchorModelElement = this.#resolveAnchorModelElement(editor, view, clickedElement);
        if (!anchorModelElement) {
          return;
        }

        if (anchorModelElement.hasAttribute("linkHref")) {
          const linkHref = anchorModelElement.getAttribute("linkHref");
          if (isModelUriPath(linkHref)) {
            evt.stop();
            data.preventDefault();
            this.#openInWorkAreaTab(requireContentUriPath(linkHref));
          }
        }
      },
      //@ts-expect-error context is not part of the types but in ckeditor5-link/src/linkediting the event is caught in capture phase
      { priority: "high", context: "$capture" },
    );

    this.listenTo(
      viewDocument,
      "keydown",
      (evt, data: { keyCode: number; altKey: boolean }) => {
        if (editor.isReadOnly) {
          return;
        }
        const url = editor.commands?.get("link")?.value;
        if (!url) {
          return;
        }
        const shouldOpen: boolean = data.keyCode === keyCodes.enter && data.altKey;
        if (!shouldOpen) {
          return;
        }
        if (isModelUriPath(url)) {
          evt.stop();
          this.#openInWorkAreaTab(requireContentUriPath(url));
        }
      },
      { priority: "high" },
    );
  }

  #resolveAnchorModelElement(editor: Editor, view: EditingView, domElement: Element): TextProxy | undefined {
    //@ts-expect-error bad typings, mapDomToView parameter is typed as model.element, but it should be the typescript element.
    const viewElement: ViewElement | ViewDocumentFragment | undefined = view.domConverter.mapDomToView(domElement);
    if (!viewElement || viewElement instanceof ViewDocumentFragment) {
      return undefined;
    }
    const viewRange = view.createRangeIn(viewElement);
    const modelRange = editor.editing.mapper.toModelRange(viewRange);
    const modelItemsInRange = Array.from(modelRange.getItems());
    const textProxies: TextProxy[] = modelItemsInRange
      .filter((item: ModelNode | ModelElement | Text | TextProxy) => item instanceof TextProxy)
      .map((textProxy) => textProxy as TextProxy)
      .filter((textProxy) => textProxy.hasAttribute("linkHref"));
    if (textProxies.length < 1) {
      LinkUserActionsPlugin.LOG.debug("No links found after click");
      return undefined;
    }
    if (textProxies.length > 1) {
      LinkUserActionsPlugin.LOG.debug("Found multiple clicked links, taking the first to open.");
    }

    return textProxies[0];
  }

  #openInWorkAreaTab(uri: string): void {
    serviceAgent
      .fetchService(createWorkAreaServiceDescriptor())
      .then((workAreaService) => workAreaService.openEntitiesInTabs([requireContentUriPath(uri)]))
      .catch((reason) => {
        LinkUserActionsPlugin.LOG.warn(reason);
      });
  }
}
