import { Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

export const IMAGE_INLINE_MODEL_ELEMENT_NAME = "imageInline";
export const IMAGE_BLOCK_MODEL_ELEMENT_NAME = "imageBlock";
export const XLINK_HREF_MODEL_ATTRIBUTE_NAME = "xlink-href";
export const XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME = "data-xlink-href";

/**
 * Integration to CKEditor 5 `ImageEditing` plugin.
 */
export class ImageEditing extends Plugin {
  static readonly pluginName = "CoreMediaImageEditingIntegration";
  static readonly requires = [];

  init(): void {
    const initInformation = reportInitStart(this);
    const {
      editor: { plugins },
    } = this;

    if (plugins.has("ImageEditing")) {
      this.#conditionalInit();
    }

    reportInitEnd(initInformation);
  }

  #conditionalInit(): void {
    const {
      editor: { conversion },
    } = this;
    conversion.for("upcast").attributeToAttribute({
      view: {
        name: "img",
        key: XLINK_HREF_DATA_VIEW_ATTRIBUTE_NAME,
      },
      model: XLINK_HREF_MODEL_ATTRIBUTE_NAME,
    });
  }
}
