import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { ImageElementSupport } from "./integrations/Image";

export const XDIFF_ATTRIBUTES = {
  "xdiff:changetype": "changeType",
  "xdiff:changes": "changes",
  "xdiff:class": "class",
  "xdiff:id": "id",
  "xdiff:next": "next",
  "xdiff:previous": "previous",
};

export class Differencing extends Plugin {
  static readonly pluginName: string = "Differencing";
  static readonly requires = [ImageElementSupport];

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

    conversion.for("upcast").elementToElement({
      view: "xdiff:span",
      model: `xdiff-span`,
    });
    conversion.for("editingDowncast").elementToElement({
      view: "xdiff:span",
      model: `xdiff-span`,
    });
    // TODO: Preferred to remove instead. If not possible, merge with editingDowncat
    conversion.for("dataDowncast").elementToElement({
      view: "xdiff:span",
      model: `xdiff-span`,
    });
    Object.entries(XDIFF_ATTRIBUTES).forEach(([view, model]) => {
      conversion.for("upcast").attributeToAttribute({
        view,
        model,
      });
      conversion.for("editingDowncast").attributeToAttribute({
        view,
        model,
      });
      // TODO: Preferred to remove instead. If not possible, merge with editingDowncat
      conversion.for("dataDowncast").attributeToAttribute({
        view,
        model,
      });
    });
  }
}
