import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { ImageElementSupport } from "./integrations/Image";
import { HtmlImageElementSupport } from "./integrations/HtmlSupportImage";

/**
 * Attributes used by server-side differencing.
 *
 * * **Key:** Name of attributes in data and editing view.
 * * **Value:** Name of attribute in model.
 */
export const XDIFF_ATTRIBUTES = {
  /**
   * Attribute, applied to images for example.
   */
  "xdiff:changetype": "xdiff-change-type",
  /**
   * Verbose description of changes. Unused yet.
   */
  "xdiff:changes": "xdiff-changes",
  /**
   * UI-Class that categorizes the change type.
   */
  "xdiff:class": "xdiff-class",
  /**
   * ID of the difference, which may be used, to jump between
   * changes. Unused yet.
   */
  "xdiff:id": "xdiff-id",
  /**
   * Reference to next diff for diff-navigation. Unused yet.
   */
  "xdiff:next": "xdiff-next",
  /**
   * Reference to previous diff for diff-navigation. Unused yet.
   */
  "xdiff:previous": "xdiff-previous",
};

/**
 * Extra element, server-side differencing augments the original data with.
 */
export const XDIFF_SPAN_ELEMENT_CONFIG: {
  view: string;
  model: string;
} = {
  view: "xdiff:span",
  model: "xdiff-span",
};

/**
 * Plugin, which adds support for server-side data augmentation for
 * showing differences in data. This plugin is meant to be used in
 * read-only CKEditors that receive data from the server, which got augmented
 * by differencing hints.
 */
export class Differencing extends Plugin {
  static readonly pluginName: string = "Differencing";
  static readonly requires = [HtmlImageElementSupport, ImageElementSupport];

  init(): void {
    const editor = this.editor;
    const { model, conversion } = editor;
    const { schema } = model;

    schema.register("xdiff-span", {
      allowIn: ["$block", "$container"],
      allowChildren: ["$text", "$block", "$container"],
      allowAttributes: Object.values(XDIFF_ATTRIBUTES),
      isInline: true,
    });

    conversion.for("upcast").elementToElement(XDIFF_SPAN_ELEMENT_CONFIG);
    // dataDowncast: We also downcast back to data view, relying on other mechanisms
    // (like data-processing), that these changes are not written back to the
    // server, as these don't represent "real" data but augmented data, which are
    // not meant to be stored on server again.
    conversion.for("downcast").elementToElement(XDIFF_SPAN_ELEMENT_CONFIG);

    Object.entries(XDIFF_ATTRIBUTES).forEach(([view, model]) => {
      const config = { view, model };
      conversion.for("upcast").attributeToAttribute(config);
      conversion.for("downcast").attributeToAttribute(config);
    });
  }
}
