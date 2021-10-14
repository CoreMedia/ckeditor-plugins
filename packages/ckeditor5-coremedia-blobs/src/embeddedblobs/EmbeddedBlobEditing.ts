import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import "../../theme/blob.css";
import { serviceAgent } from "@coremedia/service-agent";
import BlobRichtextServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextServiceDescriptor";
import EmbeddedBlobRenderInformation from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/EmbeddedBlobRenderInformation";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export default class EmbeddedBlobEditing extends Plugin {
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
    schema.register("embeddedBlob", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["contentUri", "property", "inline"],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;

    conversion.for("editingDowncast").elementToElement({
      model: "embeddedBlob",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return EmbeddedBlobEditing.#createEmbeddedBlobView(modelItem, viewWriter);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "embeddedBlob",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return EmbeddedBlobEditing.#createEmbeddedBlobView(modelItem, viewWriter);
      },
    });
  }

  static #createEmbeddedBlobView(modelItem: ModelElement, viewWriter: DowncastWriter): ViewElement {
    const contentUri = modelItem.getAttribute("contentUri");
    const property = modelItem.getAttribute("property");
    const inline = modelItem.getAttribute("inline");

    if (inline) {
      const containerElement = viewWriter.createContainerElement("p", { isAllowedInsideAttributeElement: true });
      const pictureView = viewWriter.createEmptyElement("img");
      const positionAt = viewWriter.createPositionAt(containerElement, 0);
      viewWriter.insert(positionAt, pictureView);
      EmbeddedBlobEditing.#fillImageTag(viewWriter, pictureView, contentUri, property);

      return containerElement;
    }
    const pictureView = viewWriter.createEmptyElement("img");
    EmbeddedBlobEditing.#fillImageTag(viewWriter, pictureView, contentUri, property);
    return pictureView;
  }

  static #fillImageTag(viewWriter: DowncastWriter, imageTag: ViewElement, contentUri: string, property: string): void {
    serviceAgent.fetchService(new BlobRichtextServiceDescriptor()).then((service): void => {
      service
        .observe_embeddedBlobInformation(contentUri, property)
        .subscribe((value: EmbeddedBlobRenderInformation) => {
          viewWriter.setAttribute("src", value.url, imageTag);
        });
    });
  }
}
