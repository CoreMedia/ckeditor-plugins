// ImageUtils: See ckeditor/ckeditor5#12027.
// ImageInline: See ckeditor/ckeditor5#12027.
import type { Editor } from "ckeditor5";
import { ImageInline, ImageUtils, Plugin } from "ckeditor5";
import { getOptionalPlugin, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import type { Logger } from "@coremedia/ckeditor5-logging";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import ModelBoundSubscriptionPlugin from "./ModelBoundSubscriptionPlugin";
import { editingDowncastXlinkHref, preventUpcastImageSrc, upcastContentImageAsInline } from "./converters";
import {
  openImageInTabCommandName,
  registerOpenImageInTabCommand,
} from "./contentImageOpenInTab/OpenImageInTabCommand";

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
  static readonly #logger: Logger = LoggerProvider.getLogger("ContentImageEditingPlugin");
  static readonly IMAGE_INLINE_MODEL_ELEMENT_NAME = "imageInline";
  static readonly IMAGE_INLINE_VIEW_ELEMENT_NAME = "img";
  static readonly XLINK_HREF_MODEL_ATTRIBUTE_NAME = "xlink-href";
  static readonly XLINK_HREF_DATA_ATTRIBUTE_NAME = "data-xlink-href";
  static readonly requires = [ImageInline, ImageUtils, ModelBoundSubscriptionPlugin];

  init(): void {
    const editor = this.editor;
    const initInformation = reportInitStart(this);
    registerOpenImageInTabCommand(editor);
    reportInitEnd(initInformation);
  }

  /**
   * Registers support for the `xlink:href` attribute for element `img` in
   * RichText.
   *
   * `xlink:href` is represented in the data-view as `data-xlink-href` and in
   * model as `xlink-href`. When downcast to the editing-view, it will be
   * resolved to the image src-attribute by fetching the URL from the
   * `BlobDisplayService`
   */
  afterInit(): void {
    ContentImageEditingPlugin.#initializeModelBoundSubscriptionPlugin(this.editor);
    ContentImageEditingPlugin.#setupXlinkHrefConversion(
      this.editor,
      ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME,
      ContentImageEditingPlugin.XLINK_HREF_DATA_ATTRIBUTE_NAME,
    );

    // We have to prevent writing src-attribute to model because we fetch the
    // src attribute for the editing view asynchronously.
    // If not prevented, the src-attribute from GRS would be written to the model.
    this.editor.conversion.for("upcast").add(preventUpcastImageSrc());

    // Force content images to become imageInline when dropped inside a
    // paragraph (inline context). This prevents ImageBlockEditing from
    // splitting the host paragraph. Runs at high priority, before
    // ImageBlockEditing's normal-priority converter.
    this.editor.conversion.for("upcast").add(upcastContentImageAsInline());

    // When a content image is dragged and dropped between block elements,
    // CKEditor's image upcasting may create imageBlock instead of imageInline
    // (because the drop target is a block-level position). The post-fixer
    // registered here converts any such imageBlock back to a paragraph
    // containing an imageInline, which is the correct model representation
    // for CoreMedia content images.
    ContentImageEditingPlugin.#setupImageBlockToInlinePostFixer(this.editor);
  }

  static #setupXlinkHrefConversion(editor: Editor, modelAttributeName: string, dataAttributeName: string): void {
    ContentImageEditingPlugin.#setupXlinkHrefConversionDowncast(
      editor,
      ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME,
      modelAttributeName,
      dataAttributeName,
    );
    editor.conversion.for("upcast").attributeToAttribute({
      model: modelAttributeName,
      view: {
        name: ContentImageEditingPlugin.IMAGE_INLINE_VIEW_ELEMENT_NAME,
        key: dataAttributeName,
      },
    });
  }

  static #setupXlinkHrefConversionDowncast(
    editor: Editor,
    modelElementName: "imageInline",
    modelAttributeName: string,
    dataAttributeName: string,
  ): void {
    editor.model.schema.extend(modelElementName, {
      allowAttributes: [modelAttributeName],
    });
    editor.conversion.for("dataDowncast").attributeToAttribute({
      model: {
        name: modelElementName,
        key: modelAttributeName,
      },
      view: dataAttributeName,
    });

    // For editing-view, the xlink-href attribute has to be converted to a src-attribute.
    editor.conversion
      .for("editingDowncast")
      .add(editingDowncastXlinkHref(editor, modelElementName, ContentImageEditingPlugin.#logger));
  }

  /**
   * Ensures that content images dropped between block elements remain as
   * `imageInline` in the model.
   *
   * When dragging a content image and dropping it between two paragraphs,
   * CKEditor's image upcast pipeline detects a block-level drop position and
   * creates an `imageBlock` model element instead of `imageInline`.  Because
   * `xlink-href` was not allowed on `imageBlock`, the attribute was silently
   * dropped and GHS captured `data-xlink-href` into `htmlImgAttributes`,
   * making the image disappear from the editing view.
   *
   * This method:
   * 1. Extends the `imageBlock` schema to allow `xlink-href` so that the
   *    existing `attributeToAttribute` upcast converter sets the attribute
   *    correctly (and GHS no longer captures it).
   * 2. Registers a model post-fixer that converts every `imageBlock` carrying
   *    a `xlink-href` attribute into a `<paragraph>` containing an
   *    `imageInline`, which is the correct CoreMedia RichText representation.
   *
   * @param editor - Editor instance
   */
  static #setupImageBlockToInlinePostFixer(editor: Editor): void {
    const { model } = editor;
    const { schema } = model;

    if (!schema.isRegistered("imageBlock")) {
      return;
    }

    // Allow xlink-href on imageBlock so the upcast can set the attribute
    // (preventing GHS from capturing data-xlink-href into htmlImgAttributes).
    schema.extend("imageBlock", {
      allowAttributes: [ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME],
    });

    const xlinkHrefAttr = ContentImageEditingPlugin.XLINK_HREF_MODEL_ATTRIBUTE_NAME;
    const imageInlineName = ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME;

    model.document.registerPostFixer((writer) => {
      let changed = false;

      for (const change of model.document.differ.getChanges()) {
        if (change.type === "insert" && change.name === "imageBlock") {
          const item = change.position.nodeAfter;
          if (!item || !item.is("element", "imageBlock")) {
            continue;
          }

          const xlinkHref = item.getAttribute(xlinkHrefAttr);
          if (!xlinkHref) {
            continue;
          }

          // Replace the imageBlock with a paragraph containing an imageInline.
          const paragraph = writer.createElement("paragraph");
          const imageInline = writer.createElement(imageInlineName, {
            [xlinkHrefAttr]: xlinkHref,
          });
          writer.append(imageInline, paragraph);
          writer.insert(paragraph, item, "before");
          writer.remove(item);
          changed = true;
        }

        // When a content image is moved (drag-and-drop) out of a paragraph
        // that contained only that image, the source paragraph becomes empty.
        // CKEditor does not remove it automatically, so we clean it up here.
        if (change.type === "remove" && change.name === "imageInline") {
          const parent = change.position.parent;
          if (parent.is("element", "paragraph") && parent.childCount === 0 && parent.parent !== null) {
            writer.remove(parent);
            changed = true;
          }
        }
      }

      return changed;
    });
  }

  /**
   * Register `imageInline` model elements for subscription cleanup
   * on model changes.
   *
   * @param editor - Editor
   */
  static #initializeModelBoundSubscriptionPlugin(editor: Editor): void {
    getOptionalPlugin(editor, ModelBoundSubscriptionPlugin)?.registerModelElement(
      ContentImageEditingPlugin.IMAGE_INLINE_MODEL_ELEMENT_NAME,
    );
  }
}
