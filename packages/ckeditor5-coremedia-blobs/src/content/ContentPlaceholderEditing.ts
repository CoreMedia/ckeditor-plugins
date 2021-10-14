import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import Element from "@ckeditor/ckeditor5-engine/src/model/element";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { Item } from "@ckeditor/ckeditor5-engine/src/model/item";
import TreeWalker from "@ckeditor/ckeditor5-engine/src/model/treewalker";
import { requireContentCkeModelUri } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import BlobRichtextServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextServiceDescriptor";
import BlobRichtextService from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextService";
import RootElement from "@ckeditor/ckeditor5-engine/src/model/rootelement";
import Node from "@ckeditor/ckeditor5-engine/src/model/node";
import BatchCache from "../batchcache/BatchCache";
import Batch from "@ckeditor/ckeditor5-engine/src/model/batch";

export default class ContentPlaceholderEditing extends Plugin {
  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [];
  }

  init(): Promise<void> | null {
    this.#defineSchema();
    this.#defineConverters();
    return null;
  }

  #defineSchema(): void {
    const schema = this.editor.model.schema;
    schema.register("content-placeholder", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["contentUri", "isLinkable", "isEmbeddable", "placeholderId", "inline"],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;
    const editor = this.editor;

    conversion.for("editingDowncast").elementToElement({
      model: "content-placeholder",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return ContentPlaceholderEditing.#createContentPlaceholder(modelItem, viewWriter, editor);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "content-placeholder",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return ContentPlaceholderEditing.#createContentPlaceholder(modelItem, viewWriter, editor);
      },
    });
  }

  static #createContentPlaceholder(modelItem: ModelElement, viewWriter: DowncastWriter, editor: Editor): ViewElement {
    const contentUri = modelItem.getAttribute("contentUri");
    const isLinkable = modelItem.getAttribute("isLinkable");
    const isEmbeddable = modelItem.getAttribute("isEmbeddable");
    const inline = modelItem.getAttribute("inline");
    const placeholderId = modelItem.getAttribute("placeholderId");

    if (isLinkable && !isEmbeddable) {
      ContentPlaceholderEditing.#requestLinkDetails(editor, contentUri, placeholderId);
    } else if (isEmbeddable) {
      ContentPlaceholderEditing.#requestBlobProperty(editor, contentUri, inline, placeholderId);
    }

    return viewWriter.createContainerElement("p");
  }

  static #requestLinkDetails(editor: Editor, contentUri: string, placeholderId: string): void {
    serviceAgent.fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor()).then((service): void => {
      service.name(contentUri).then((contentName): void => {
        ContentPlaceholderEditing.replaceWithLink(editor, contentUri, contentName, placeholderId);
      });
    });
  }

  static #requestBlobProperty(editor: Editor, contentUri: string, inline: boolean, placeholderId: string): void {
    serviceAgent
      .fetchService<BlobRichtextService>(new BlobRichtextServiceDescriptor())
      .then((service: BlobRichtextService): void => {
        service.findImageBlobProperty(contentUri).then((blobProperty): void => {
          if (!blobProperty) {
            return;
          }
          ContentPlaceholderEditing.#replaceWithEmbeddedBlob(editor, contentUri, blobProperty, inline, placeholderId);
        });
      });
  }

  static #replaceWithEmbeddedBlob(
    editor: Editor,
    contentUri: string,
    property: string,
    inline: boolean,
    placeholderId: string
  ): void {
    const batch = BatchCache.lookupBatch(placeholderId);
    BatchCache.removeBatch(placeholderId);
    const batchOrType: Batch | string = batch ? batch : "default";
    editor.model.enqueueChange(batchOrType, (writer: Writer): void => {
      const embeddedBlob = writer.createElement("embeddedBlob", {
        contentUri: contentUri,
        property: property,
        inline: inline,
      });

      const root = editor.model.document.getRoot();
      ContentPlaceholderEditing.replaceNode(writer, root, contentUri, placeholderId, embeddedBlob);
    });
  }

  static replaceWithLink(editor: Editor, contentUri: string, contentName: string, placeholderId: string): void {
    const root = editor.model.document.getRoot();
    const contentNameRespectingRoot = contentName ? contentName : "<root>";
    const batch = BatchCache.lookupBatch(placeholderId);
    BatchCache.removeBatch(placeholderId);
    const batchOrType: Batch | string = batch ? batch : "default";
    editor.model.enqueueChange(batchOrType, (writer: Writer): void => {
      const text = writer.createText(contentNameRespectingRoot, {
        linkHref: requireContentCkeModelUri(contentUri),
      });
      ContentPlaceholderEditing.replaceNode(writer, root, contentUri, placeholderId, text);
    });
  }

  static replaceNode(
    writer: Writer,
    root: RootElement,
    contentUri: string,
    placeholderId: string,
    element: Node
  ): void {
    //lookup the node because we are in the view context but have to create a model node
    const node: Item | null = ContentPlaceholderEditing.findNode(writer, root, contentUri, placeholderId);
    if (node === null) {
      return;
    }
    if (node.parent === null) {
      return;
    }
    if (node.parent) {
      writer.insert(element, node.parent as unknown as Element, node.startOffset ? node.startOffset : 0);
      writer.remove(node);
    }
  }

  static findNode(writer: Writer, root: RootElement, contentUri: string, placeholderId: string): Item | null {
    const range = writer.createRangeIn(root);

    const walker: TreeWalker = range.getWalker({ ignoreElementEnd: true });
    let treeWalkerValue = walker.next();
    while (!treeWalkerValue.done) {
      const item = treeWalkerValue.value.item;
      if (item.getAttribute("contentUri") === contentUri && item.getAttribute("placeholderId") === placeholderId) {
        return item;
      }
      treeWalkerValue = walker.next();
    }
    return null;
  }
}
