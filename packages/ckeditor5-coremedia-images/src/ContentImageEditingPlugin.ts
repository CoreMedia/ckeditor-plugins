import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Image from "@ckeditor/ckeditor5-image/src/image";
import UpcastDispatcher, { UpcastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import { Item } from "@ckeditor/ckeditor5-engine/src/view/item";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import first from "@ckeditor/ckeditor5-utils/src/first";

export default class ContentImageEditingPlugin extends Plugin {
  static readonly pluginName: string = "ContentImageEditingPlugin";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [Image];
  }

  init(): null {
    this.editor.model.schema.extend("imageInline", {
      allowAttributes: ["xlink:href", "xlink:show"],
    });
    //this.editor.conversion.attributeToAttribute({ model: "xlink:show", view: "data-xlink-show" });
    this.editor.conversion.attributeToAttribute({ model: "xlink:href", view: "data-xlink-href" });
    this.editor.conversion.for("upcast").add(
      (() => {
        return (dispatcher: UpcastDispatcher) => {
          dispatcher.on("element:img", this.converterFunction);
        };
      })()
    );
    return null;
  }

  converterFunction(
    event: EventInfo,
    data: { viewItem: Item; modelCursor: Position },
    conversionApi: UpcastConversionApi
  ): void {
    if (!conversionApi.consumable.consume(data.viewItem, { attributes: "data-xlink-show" })) {
      return;
    }

    const conversionResult = conversionApi.convertItem(data.viewItem, data.modelCursor);
    const modelRange = conversionResult.modelRange;
    if (!modelRange) {
      conversionApi.consumable.revert(data.viewItem, { attributes: "data-xlink-show" });
      return;
    }
    const modelImage = first(modelRange.getItems());
    if (!modelImage) {
      conversionApi.consumable.revert(data.viewItem, { attributes: "data-xlink-show" });
      return;
    }
    conversionApi.writer.setAttribute("xlink:show", data.viewItem.getAttribute("data-xlink-show"), modelImage);
  }
}
