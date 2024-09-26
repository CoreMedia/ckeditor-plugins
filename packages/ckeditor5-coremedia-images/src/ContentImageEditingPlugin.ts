import { Plugin } from "@ckeditor/ckeditor5-core";
import { preventUpcastImageSrc } from "./converters";
// ImageUtils: See ckeditor/ckeditor5#12027.
import ImageUtils from "@ckeditor/ckeditor5-image/src/imageutils";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import {
  openImageInTabCommandName,
  registerOpenImageInTabCommand,
} from "./contentImageOpenInTab/OpenImageInTabCommand";
import { Image } from "@ckeditor/ckeditor5-image";
import { ImageInlineEditing } from "./integrations/ImageInlineEditing";
import { ImageBlockEditing } from "./integrations/ImageBlockEditing";
import { ImageEditing } from "./integrations/ImageEditing";

/**
 * Plugin to support images from CoreMedia RichText.
 *
 * The plugin takes the `xlink:href` represented in the data-view by
 * `data-xlink-href` and writes it to the model.
 *
 * The model attribute afterward will be downcast to the editing-view where it
 * is represented by the src-attribute of the `img`-tag.
 */
export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName = "ContentImageEditingPlugin" as const;
  /**
   * Command name for bound `openImageInTab`.
   */
  static readonly openImageInTab = openImageInTabCommandName;

  static readonly requires = [
    Image,
    ImageUtils,
    ModelBoundSubscriptionPlugin,
    ImageEditing,
    ImageBlockEditing,
    ImageInlineEditing,
  ];

  init(): void {
    const editor = this.editor;
    const initInformation = reportInitStart(this);
    registerOpenImageInTabCommand(editor);
    reportInitEnd(initInformation);
  }

  afterInit(): void {
    this.editor.conversion.for("upcast").add(preventUpcastImageSrc());
  }
}
