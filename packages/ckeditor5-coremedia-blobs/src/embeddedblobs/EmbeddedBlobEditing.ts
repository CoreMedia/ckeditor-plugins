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
import Element from "@ckeditor/ckeditor5-engine/src/view/element";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";

export default class EmbeddedBlobEditing extends Plugin {
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
    schema.register("embeddedBlob", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["contentUri", "property", "inline"],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;
    const editor = this.editor;
    conversion.for("editingDowncast").elementToElement({
      model: "embeddedBlob",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        const widgetView = EmbeddedBlobEditing.#createEmbeddedBlobView(editor, modelItem, viewWriter);
        return toWidget(widgetView, viewWriter);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "embeddedBlob",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return toWidget(EmbeddedBlobEditing.#createEmbeddedBlobView(editor, modelItem, viewWriter), viewWriter);
      },
    });
  }

  static #createEmbeddedBlobView(editor: Editor, modelItem: ModelElement, viewWriter: DowncastWriter): ViewElement {
    const contentUri = modelItem.getAttribute("contentUri");
    const property = modelItem.getAttribute("property");
    const pictureView = viewWriter.createEmptyElement("img");
    const containerElement = viewWriter.createContainerElement("span", { class: "embedded-blob-widget" });
    viewWriter.insert(viewWriter.createPositionAt(containerElement, 0), pictureView);
    EmbeddedBlobEditing.#fillImageTag(viewWriter, pictureView, contentUri, property);
    return containerElement;
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
