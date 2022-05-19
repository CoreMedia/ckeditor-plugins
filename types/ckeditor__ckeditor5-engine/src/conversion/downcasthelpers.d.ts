import ConversionHelpers from './conversionhelpers';
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { DowncastConversionApi } from "./downcastdispatcher";
import { ElementDefinition } from "../view/elementdefinition";
import AttributeElement from "../view/attributeelement";

/**
 * Downcast conversion helper functions.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_downcasthelpers-DowncastHelpers.html">Class DowncastHelpers (engine/conversion/downcasthelpers~DowncastHelpers) - CKEditor 5 API docs</a>
 */
export default class DowncastHelpers extends ConversionHelpers {
  attributeToAttribute(config: {
    model: string | Object,
    view: string | Object | Function,
    converterPriority?: PriorityString,
  }): DowncastHelpers;

  attributeToElement(config: {
    model: string | {
      key: string,
      values?: string[],
    },
    view: ElementDefinition | ((modelAttributeValue: any, conversionApi: DowncastConversionApi) => AttributeElement) | {
      name: string,
      classes?: string[],
    },
    converterPriority?: PriorityString,
  }): DowncastHelpers;

  elementToElement(config: {
    model: string | Object,
    view: any | Function,
  }): DowncastHelpers;

  markerToData(config: {
    model: string,
    view?: Function,
    converterPriority?: PriorityString,
  }): DowncastHelpers;

  markerToElement(config: {
    model: string,
    view: Object | Function,
    converterPriority?: PriorityString,
  }): DowncastHelpers;

  markerToHighlight(config: {
    model: string,
    view: Object | Function,
    converterPriority?: PriorityString,
  }): DowncastHelpers;
}
