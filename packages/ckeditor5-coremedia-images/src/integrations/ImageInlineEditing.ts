import { Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import { downcastImageAttribute } from "@ckeditor/ckeditor5-image/src/image/converters";

/**
 * Integration to CKEditor 5 `ImageInlineEditing` plugin.
 */
export class ImageInlineEditing extends Plugin {
  static readonly pluginName = "CoreMediaImageInlineEditingIntegration";
  static readonly requires = [ImageUtils];

  /**
   * Initializes the plugin. Using `afterInit`, as we need to ensure that
   * a possibly installed `ImageInlineEditing` plugin got initialized first.
   */
  afterInit(): void {
    const initInformation = reportInitStart(this);
    const {
      editor: { plugins },
    } = this;

    if (plugins.has("ImageInlineEditing")) {
      this.#conditionalAfterInit();
    }

    reportInitEnd(initInformation);
  }

  #conditionalAfterInit(): void {
    const {
      editor: {
        model: { schema },
      },
    } = this;

    schema.extend("imageInline", {
      allowAttributes: ["data-xlink-href"],
    });

    this.#setupConversion();
  }

  #setupConversion() {
    const {
      editor: { conversion, plugins },
    } = this;

    const imageUtils = plugins.get(ImageUtils);

    conversion.for("downcast").add(downcastImageAttribute(imageUtils, "imageInline", "data-xlink-href"));
  }
}
