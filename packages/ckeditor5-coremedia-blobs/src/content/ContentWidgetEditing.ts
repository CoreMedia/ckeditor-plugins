import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import { UpcastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import Element from "@ckeditor/ckeditor5-engine/src/model/element";
import { Item } from "@ckeditor/ckeditor5-engine/src/model/item";
import TreeWalker from "@ckeditor/ckeditor5-engine/src/model/treewalker";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export default class ContentWidgetEditing extends Plugin {
  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Widget];
  }

  init(): Promise<void> | null {
    this.#defineSchema();
    this.#defineConverters();
    return null;
  }

  #defineSchema(): void {
    const schema = this.editor.model.schema;
    schema.register("coremedia-content", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["contentUri", "isLinkable"],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;
    const editor = this.editor;

    conversion.for("upcast").elementToElement({
      view: {
        name: "p",
        classes: ["coremedia-content"],
      },
      model: (viewElement: ViewElement, { writer: modelWriter }: UpcastConversionApi): ModelElement => {
        const src = viewElement.getAttribute("src");

        return modelWriter.createElement("coremedia-content", { src });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "coremedia-content",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        const widgetElement = createEmbeddedBlobView(modelItem, viewWriter);

        // Enable widget handling on a embeddedBlob element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "coremedia-content",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return createEmbeddedBlobView(modelItem, viewWriter);
      },
    });

    // Helper method for both downcast converters.
    function createEmbeddedBlobView(modelItem: ModelElement, viewWriter: DowncastWriter): ViewElement {
      const contentUri = modelItem.getAttribute("contentUri");
      const isLinkable = modelItem.getAttribute("isLinkable");
      const container = viewWriter.createContainerElement(
        "p",
        {
          class: "coremedia-content",
          "data-contentUri": contentUri,
          "data-isLinkable": isLinkable,
        },
        { isAllowedInsideAttributeElement: true }
      );
      serviceAgent.fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor()).then((service): void => {
        service.name(contentUri).then((contentName): void => {
          ContentWidgetEditing.replaceCoreMediaContentWidget(editor, contentUri, contentName);
        });
      });

      return container;
    }
  }

  static replaceCoreMediaContentWidget(editor: Editor, contentUri: string, contentName: string): void {
    editor.model.change((writer): void => {
      const root = editor.model.document.getRoot();
      //lookup the node because we are in the view context but have to create a model node
      const node: Item | null = ContentWidgetEditing.findNode(writer, contentUri, root);
      if (node === null) {
        return;
      }
      if (node.parent === null) {
        return;
      }

      const contentNameRespectingRoot = contentName ? contentName : "<root>";
      const text = writer.createText(contentNameRespectingRoot, {
        linkHref: requireContentCkeModelUri(contentUri),
      });
      if (node.parent) {
        writer.insert(text, node.parent as unknown as Element, node.startOffset ? node.startOffset : 0);
        writer.remove(node);
      }
    });
  }

  static findNode(writer: Writer, contentUri: string, root: Element): Item | null {
    const range = writer.createRangeIn(root);

    const walker: TreeWalker = range.getWalker({ ignoreElementEnd: true });
    let treeWalkerValue = walker.next();
    while (!treeWalkerValue.done) {
      const item = treeWalkerValue.value.item;
      if (item.getAttribute("contentUri") === contentUri) {
        return item;
      }
      treeWalkerValue = walker.next();
    }
    return null;
  }
}
