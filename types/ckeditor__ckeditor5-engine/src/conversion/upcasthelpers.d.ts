import ConversionHelpers from './conversionhelpers';
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import ModelElement from "../model/element";
import ViewElement from "../view/element";
import { UpcastConversionApi } from "./upcastdispatcher";
import { MatcherPattern } from "../view/matcher";
import Element from "../view/element";

/**
 * Upcast conversion helper functions.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_upcasthelpers-UpcastHelpers.html">Class UpcastHelpers (engine/conversion/upcasthelpers~UpcastHelpers) - CKEditor 5 API docs</a>
 */
export default class UpcastHelpers extends ConversionHelpers {
  attributeToAttribute(config: {
    model: string | {
      key: string,
      value?: string | ((viewElement: ViewElement, conversionApi: UpcastConversionApi) => string),
    },
    view: string | {
      key: string,
      name?: string,
      value?: string | RegExp | ((value: string) => boolean),
    },
    converterPriority?: PriorityString,
  }): UpcastHelpers;

  dataToMarker(config: {
    model?: Function,
    view: string,
    converterPriority?: PriorityString,
  }): UpcastHelpers;

  elementToAttribute(config: {
    model: string | {
      key: string,
      value: string | ((viewElement: Element, conversionApi: UpcastConversionApi) => string | null),
    },
    view: MatcherPattern,
    converterPriority?: PriorityString,
  }): UpcastHelpers;

  elementToElement(config: {
    model: string | ModelElement | Function,
    view?: MatcherPattern,
    converterPriority?: PriorityString,
  }): UpcastHelpers;
}
