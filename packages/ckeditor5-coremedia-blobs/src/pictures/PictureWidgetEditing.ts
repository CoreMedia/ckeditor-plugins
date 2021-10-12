import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ModelElement from "@ckeditor/ckeditor5-engine/src/model/element";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import { UpcastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import { DowncastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";
import DowncastWriter from "@ckeditor/ckeditor5-engine/src/view/downcastwriter";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import { toWidget } from "@ckeditor/ckeditor5-widget/src/utils";
import PictureWidgetCommand from "./PictureWidgetCommand";
import "../../theme/picture.css";
import { serviceAgent } from "@coremedia/service-agent";
import BlobRichtextServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextServiceDescriptor";
import { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import BlobRichtextService from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/BlobRichtextService";
import EmbeddedBlobRenderInformation from "@coremedia/ckeditor5-coremedia-studio-integration/content/blobrichtextservice/EmbeddedBlobRenderInformation";
import ContainerElement from "@ckeditor/ckeditor5-engine/src/view/containerelement";

export default class PictureWidgetEditing extends Plugin {
  static get requires() {
    return [Widget];
  }

  init(): Promise<void> | null {
    this.#defineSchema();
    this.#defineConverters();
    this.editor.commands.add("placeholder", new PictureWidgetCommand(this.editor));
    return null;
  }

  #defineSchema(): void {
    const schema = this.editor.model.schema;
    schema.register("placeholder", {
      allowWhere: "$text",
      isInline: true,
      isObject: true,
      allowAttributes: ["contentId", "property"],
    });
  }

  #defineConverters(): void {
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "p",
        classes: ["placeholder"],
      },
      model: (viewElement: ViewElement, { writer: modelWriter }: UpcastConversionApi): ModelElement => {
        const src = viewElement.getAttribute("src");

        return modelWriter.createElement("placeholder", { src });
      },
    });

    conversion.for("editingDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        const widgetElement = createPlaceholderView(modelItem, viewWriter);

        // Enable widget handling on a placeholder element inside the editing view.
        return toWidget(widgetElement, viewWriter);
      },
    });
    conversion.for("dataDowncast").elementToElement({
      model: "placeholder",
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi): ViewElement => {
        return createPlaceholderView(modelItem, viewWriter);
      },
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem: ModelElement, viewWriter: DowncastWriter): ViewElement {
      const contentId = modelItem.getAttribute("contentId");
      const property = modelItem.getAttribute("property");

      const container = viewWriter.createContainerElement(
        "p",
        {
          class: "placeholder",
        },
        { isAllowedInsideAttributeElement: true }
      );
      PictureWidgetEditing.#createImageElement(viewWriter, container, contentId, property);
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
        PictureWidgetEditing.#onNewBlobRenderInformation(viewWriter, container, value);
      });
    });
  }

  static #onNewBlobRenderInformation(
    viewWriter: DowncastWriter,
    container: ContainerElement,
    value: EmbeddedBlobRenderInformation
  ): void {
    const existingImageElement = PictureWidgetEditing.#lookupImageElement(container);
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
