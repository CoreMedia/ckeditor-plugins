import ViewElement from "../view/element";
import ModelElement from "../model/element";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_mapper-Mapper.html
 */
export class Mapper {
  toViewElement(modelElement: ModelElement): ViewElement;
}
