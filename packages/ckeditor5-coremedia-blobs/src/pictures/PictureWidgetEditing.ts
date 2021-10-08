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
      // Allow wherever text is allowed:
      allowWhere: "$text",

      // The placeholder will act as an inline node:
      isInline: true,

      // The inline widget is self-contained so it cannot be split by the caret and can be selected:
      isObject: true,

      // The placeholder can have many types, like date, name, surname, etc:
      allowAttributes: ["src"],
    });
  }

  #defineConverters(): void {
    // ADDED
    const conversion = this.editor.conversion;

    conversion.for("upcast").elementToElement({
      view: {
        name: "p",
        classes: ["placeholder"],
      },
      model: (viewElement: ViewElement, { writer: modelWriter }: UpcastConversionApi): ModelElement => {
        // Extract the "name" from "{name}".
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
      view: (modelItem: ModelElement, { writer: viewWriter }: DowncastConversionApi) =>
        createPlaceholderView(modelItem, viewWriter),
    });

    // Helper method for both downcast converters.
    function createPlaceholderView(modelItem: ModelElement, viewWriter: DowncastWriter): ViewElement {
      const src = modelItem.getAttribute("src");
      const container = viewWriter.createContainerElement(
        "p",
        { class: "placeholder" },
        { isAllowedInsideAttributeElement: true }
      );
      const pictureView = viewWriter.createEmptyElement("img", { src: src });
      // Insert the placeholder name (as a text).
      //const innerText = viewWriter.createUIElement("{" + name + "}");
      viewWriter.insert(viewWriter.createPositionAt(container, 0), pictureView);

      return container;
    }
  }
}
