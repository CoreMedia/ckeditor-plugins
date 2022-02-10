import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import UpcastDispatcher, {
  UpcastConversionApi,
  UpcastEventData,
} from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import {
  DowncastConversionHelperFunction,
  UpcastConversionHelperFunction,
} from "@ckeditor/ckeditor5-engine/src/conversion/conversionhelpers";
import DowncastDispatcher, {
  DowncastConversionApi,
  DowncastEventData,
} from "@ckeditor/ckeditor5-engine/src/conversion/downcastdispatcher";

export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageEditingPlugin";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Image];
  }

  afterInit(): null {
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-href", "data-xlink-href");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-role", "data-xlink-role");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-show", "data-xlink-show");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-actuate", "data-xlink-actuate");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "xlink-type", "data-xlink-type");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "title", "title");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "dir", "dir");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "lang", "lang");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "height", "height");
    ContentImageEditingPlugin.#setupAttribute(this.editor, "width", "width");
    ContentImageEditingPlugin.#setupCustomClassConversion(this.editor, "img", "imageInline");
    return null;
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
    editor.conversion.for("upcast").add(ContentImageEditingPlugin.#upcastCustomClasses(viewElementName));

    editor.conversion
      .for("downcast")
      .add(ContentImageEditingPlugin.#downcastCustomClasses(viewElementName, modelElementName));
  }

  /**
   * Creates an upcast converter that will pass all classes from the view element to the model element.
   */
  static #upcastCustomClasses(viewElementName: string): UpcastConversionHelperFunction {
    return (dispatcher: UpcastDispatcher): void =>
      dispatcher.on(`element:${viewElementName}`, ContentImageEditingPlugin.#onImgTagUpcast, { priority: "low" });
  }

  static #onImgTagUpcast(evt: EventInfo, data: UpcastEventData, conversionApi: UpcastConversionApi): void {
    const viewItem = data.viewItem;
    const modelRange = data.modelRange;

    const modelElement = modelRange && modelRange.start.nodeAfter;
    if (!modelElement) {
      return;
    }

    const currentAttributeValue = modelElement.getAttribute("cmClass") || [];

    currentAttributeValue.push(...viewItem.getClassNames());
    conversionApi.writer.setAttribute("cmClass", currentAttributeValue, modelElement);
  }

  static #downcastCustomClasses(viewElementName: string, modelElementName: string): DowncastConversionHelperFunction {
    return (dispatcher: DowncastDispatcher) =>
      dispatcher.on(
        `insert:${modelElementName}`,
        (evt: EventInfo, data: DowncastEventData, conversionApi: DowncastConversionApi) => {
          ContentImageEditingPlugin.#onImageInlineDowncast(viewElementName, data, conversionApi);
        },
        { priority: "low" }
      );
  }

  static #onImageInlineDowncast(
    viewElementName: string,
    data: DowncastEventData,
    conversionApi: DowncastConversionApi
  ): void {
    const modelElement = data.item;
    const viewSpan = conversionApi.mapper.toViewElement(modelElement);
    if (!viewSpan) {
      return;
    }

    //image inline consists of two elements (span, img) and therefore the method gets called once with the span element and once
    //The span element events are first, afterwards img events. I suppose something is happening between those events which is necessary
    //to make it work. Classes added to the img are ignored. => We don't do anything if it is not the span element.
    if (!viewSpan.is("element", "span")) {
      return;
    }

    const viewImageElement = ContentImageEditingPlugin.#findViewChild(viewSpan, viewElementName, conversionApi);
    if (!viewImageElement) {
      return;
    }
    conversionApi.writer.addClass(modelElement.getAttribute("cmClass"), viewImageElement);
  }

  static #findViewChild(viewElement: ViewElement, viewElementName: string, conversionApi: DowncastConversionApi) {
    const viewChildren = Array.from(conversionApi.writer.createRangeIn(viewElement).getItems());

    return viewChildren.find((item) => item.is("element", viewElementName));
  }
}
