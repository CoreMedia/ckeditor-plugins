import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import View from "@ckeditor/ckeditor5-engine/src/view/view";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import { serviceAgent } from "@coremedia/service-agent";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import { openLink } from "@ckeditor/ckeditor5-link/src/utils";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import TextProxy from "@ckeditor/ckeditor5-engine/src/model/textproxy";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import ModelNode from "@ckeditor/ckeditor5-engine/src/model/node";
import {
  isModelUriPath,
  requireContentUriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

export default class LinkReadOnlyPlugin extends Plugin {
  static readonly pluginName: string = "LinkReadOnlyPlugin";
  static readonly LOG: Logger = LoggerProvider.getLogger(LinkReadOnlyPlugin.pluginName);
  static readonly requires = [];

  init(): void {
    this.handleLinkClicksInReadOnly();
  }

  handleLinkClicksInReadOnly() {
    const editor = this.editor;
    const view = editor.editing.view;
    const viewDocument = view.document;

    this.listenTo(
      viewDocument,
      "click",
      (evt, data: { domTarget: Element; preventDefault: () => void; view: View }) => {
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
        this.onReadOnlyLinkActivated(editor, data.view, clickedElement);
      },
      //@ts-expect-error context is not part of the types but in ckeditor5-link/src/linkediting the event is caught in capture phase
      { priority: "high", context: "$capture" }
    );
  }

  onReadOnlyLinkActivated(editor: Editor, view: View, domElement: Element): void {
    //@ts-expect-error bad typings, mapDomToView parameter is typed as model.element, but it should be the typescript element.
    const viewElement: ViewElement | ViewDocumentFragment | undefined = view.domConverter.mapDomToView(domElement);
    if (!viewElement || viewElement instanceof ViewDocumentFragment) {
      return;
    }

    const viewRange = view.createRangeIn(viewElement);
    const modelRange = editor.editing.mapper.toModelRange(viewRange);
    const modelItemsInRange = Array.from(modelRange.getItems());
    const textProxies: TextProxy[] = modelItemsInRange
      .filter((item: ModelNode | ModelElement | Text | TextProxy) => item instanceof TextProxy)
      .map((textProxy) => textProxy as TextProxy)
      .filter((textProxy) => textProxy.hasAttribute("linkHref"));
    if (textProxies.length < 1) {
      LinkReadOnlyPlugin.LOG.debug("No links found after click");
      return;
    }
    if (textProxies.length > 1) {
      LinkReadOnlyPlugin.LOG.debug("Found multiple clicked links, taking the first to open.");
    }

    const modelElement = textProxies[0];
    const linkHref: string = modelElement.getAttribute("linkHref") as string;
    if (isModelUriPath(linkHref)) {
      serviceAgent
        .fetchService(createWorkAreaServiceDescriptor())
        .then((workAreaService) => workAreaService.openEntitiesInTabs([requireContentUriPath(linkHref)]))
        .catch((reason) => {
          LinkReadOnlyPlugin.LOG.warn(reason);
        });
    } else {
      openLink(linkHref);
    }
  }
}
