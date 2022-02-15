import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Image from "@ckeditor/ckeditor5-image/src/image";
import {
  dataDowncastCustomClasses,
  editingDowncastCustomClasses,
  editingDowncastXlinkHref,
  upcastCustomClasses,
} from "./converters";

export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageEditingPlugin";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Image];
  }

  afterInit(): null {
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-role", "data-xlink-role");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-show", "data-xlink-show");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-actuate", "data-xlink-actuate");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-type", "data-xlink-type");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "title", "title");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "dir", "dir");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "lang", "lang");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "height", "height");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "width", "width");
    ContentImageEditingPlugin.#setupXlinkHrefConversion(this.editor, "xlink-href", "data-xlink-href");
    ContentImageEditingPlugin.#setupCustomClassConversion(this.editor, "img", "imageInline");
    return null;
  }

  static #setupXlinkHrefConversion(editor: Editor, modelAttributeName: string, dataAttributeName: string): void {
    editor.model.schema.extend("imageInline", {
      allowAttributes: [modelAttributeName],
    });
    editor.conversion.for("upcast").attributeToAttribute({
      model: modelAttributeName,
      view: { name: "img", key: dataAttributeName },
    });
    editor.conversion.for("dataDowncast").attributeToAttribute({
      model: modelAttributeName,
      view: dataAttributeName,
    });
    editor.conversion.for("editingDowncast").add(editingDowncastXlinkHref(editor, "imageInline", modelAttributeName));
  }

  static #setupAttribute(editor: Editor, model: string, view: string): void {
    editor.model.schema.extend("imageInline", {
      allowAttributes: [model],
    });
    editor.conversion.attributeToAttribute({
      model: { name: "imageInline", key: model },
      view: { name: "img", key: view },
    });
  }

  static #setupCustomClassConversion(editor: Editor, viewElementName: string, modelElementName: string): void {
    editor.model.schema.extend(modelElementName, { allowAttributes: ["cmClass"] });
    editor.conversion.for("upcast").add(upcastCustomClasses(viewElementName));
    editor.conversion
      .for("editingDowncast")
      .add(editingDowncastCustomClasses(editor, viewElementName, modelElementName));
    editor.conversion.for("dataDowncast").add(dataDowncastCustomClasses(viewElementName, modelElementName));
  }
}
