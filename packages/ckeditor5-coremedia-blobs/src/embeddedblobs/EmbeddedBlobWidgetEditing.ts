import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import { UpcastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import EmbeddedBlobWidgetCommand from "./EmbeddedBlobWidgetCommand";
import "../../theme/blob.css";
import { serviceAgent } from "@coremedia/service-agent";
import BlobRichtextServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextServiceDescriptor";
import { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import BlobRichtextService from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextService";
import EmbeddedBlobRenderInformation from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/EmbeddedBlobRenderInformation";
import ContainerElement from "@ckeditor/ckeditor5-engine/src/view/containerelement";

export default class EmbeddedBlobWidgetEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init(): Promise<void> | null {
    this.#defineSchema();
    this.#defineConverters();
    this.editor.commands.add("embeddedBlob", new EmbeddedBlobWidgetCommand(this.editor));
    return null;
  }

  #defineSchema(): void {
    const schema = this.editor.model.schema;
    schema.register("embeddedBlob", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["contentUri", "property"],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "p",
        classes: ["embeddedBlob"],
      },
      model: (viewElement: ViewElement, { writer: modelWriter }: UpcastConversionApi): ModelElement => {
        const src = viewElement.getAttribute("src");

        return modelWriter.createElement("embeddedBlob", { src });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "embeddedBlob",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        const widgetElement = createEmbeddedBlobView(modelItem, viewWriter);

        // Enable widget handling on a embeddedBlob element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "embeddedBlob",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return createEmbeddedBlobView(modelItem, viewWriter);
      },
    });

    // Helper method for both downcast converters.
    function createEmbeddedBlobView(modelItem: ModelElement, viewWriter: DowncastWriter): ViewElement {
      const contentUri = modelItem.getAttribute("contentUri");
      const property = modelItem.getAttribute("property");

      const container = viewWriter.createContainerElement(
        "p",
        {
          class: "embeddedBlob",
        },
        { isAllowedInsideAttributeElement: true }
      );
      EmbeddedBlobWidgetEditing.#createImageElement(viewWriter, container, contentUri, property);
      return container;
    }
  }

  static #createImageElement(
    viewWriter: DowncastWriter,
    container: ContainerElement,
    uriPath: UriPath,
    property: string
  ): void {
    serviceAgent.fetchService(new BlobRichtextServiceDescriptor()).then((service): void => {
      if (!(service as BlobRichtextService)) {
        return;
      }
      const blobRichtextService = service as BlobRichtextService;
      blobRichtextService.observe_embeddedBlobInformation(uriPath, property).subscribe((value) => {
        EmbeddedBlobWidgetEditing.#onNewBlobRenderInformation(viewWriter, container, value);
      });
    });
  }

  static #onNewBlobRenderInformation(
    viewWriter: DowncastWriter,
    container: ContainerElement,
    value: EmbeddedBlobRenderInformation
  ): void {
    const existingImageElement = EmbeddedBlobWidgetEditing.#lookupImageElement(container);
    if (existingImageElement) {
      const containerRange = viewWriter.createRangeOn(container);
      viewWriter.clear(containerRange, existingImageElement);
    }
    const pictureView = viewWriter.createEmptyElement("img", {
      src: value.url,
    });
    viewWriter.insert(viewWriter.createPositionAt(container, 0), pictureView);
  }

  static #lookupImageElement(container: ContainerElement): Element | null {
    const children = Array.from(container.getChildren());
    if (!children) {
      return null;
    }

    for (const child of children) {
      if (child.is("element", "img")) {
        // cast to unknown is necessary as eslint is not able to understand child.is()
        return child as unknown as Element;
      }
    }
    return null;
  }
}
