import { Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";

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
        key: "data-xlink-href",
      },
      model: "data-xlink-href",
    });
  }
}
