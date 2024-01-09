import { Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import { downcastImageAttribute } from "@ckeditor/ckeditor5-image/src/image/converters";

/**
 * Integration to CKEditor 5 `ImageBlockEditing` plugin.
 */
export class ImageBlockEditing extends Plugin {
  static readonly pluginName = "CoreMediaImageBlockEditingIntegration";
  static readonly requires = [ImageUtils];

  /**
   * Initializes the plugin. Using `afterInit`, as we need to ensure that
   * a possibly installed `ImageBlockEditing` plugin got initialized first.
   */
  afterInit(): void {
    const initInformation = reportInitStart(this);
    const {
      editor: { plugins },
    } = this;

    if (plugins.has("ImageBlockEditing")) {
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

    schema.extend("imageBlock", {
      allowAttributes: ["data-xlink-href"],
    });

    this.#setupConversion();
  }

  #setupConversion() {
    const {
      editor: { conversion, plugins },
    } = this;

    const imageUtils = plugins.get(ImageUtils);

    conversion.for("downcast").add(downcastImageAttribute(imageUtils, "imageBlock", "data-xlink-href"));
  }
}
