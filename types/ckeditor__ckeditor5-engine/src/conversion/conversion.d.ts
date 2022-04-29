import DowncastDispatcher from "./downcastdispatcher";
import UpcastDispatcher from "./upcastdispatcher";
import { MatcherPattern } from "../view/matcher";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { ElementDefinition } from "../view/elementdefinition";
import DowncastHelpers from "./downcasthelpers";
import UpcastHelpers from "./upcasthelpers";

/**
 * A utility class that helps add converters to upcast and downcast dispatchers.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_conversion-Conversion.html">Class Conversion (engine/conversion/conversion~Conversion) - CKEditor 5 API docs</a>
 */
export default class Conversion {
  constructor(
    downcastDispatchers: DowncastDispatcher | DowncastDispatcher[],
    upcastDispatchers: UpcastDispatcher | UpcastDispatcher[]
  );

  addAlias(alias: string, dispatcher: DowncastDispatcher | UpcastDispatcher): void;

  attributeToAttribute(definition: AttributeToAttributeDefinition): void;

  attributeToElement(definition: ConverterDefinition): void;

  elementToElement(definition: ConverterDefinition): void;

  for<N extends string>(groupName: N): N extends "upcast"
    ? UpcastHelpers
    : N extends "downcast"
      ? DowncastHelpers
      : N extends "editingDowncast"
        ? DowncastHelpers
        : N extends "dataDowncast"
          ? DowncastHelpers
          : DowncastHelpers | UpcastHelpers
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_conversion-ConverterDefinition.html">Typedef ConverterDefinition (engine/conversion/conversion~ConverterDefinition) - CKEditor 5 API docs</a>
 */
export type ConverterDefinition = {
  converterPriority: PriorityString,
  model: any,
  upcastAlso: MatcherPattern | MatcherPattern[],
  view: ElementDefinition | Object,
};
export type AttributeToAttributeDefinition = {
  model: string | AttributeModelDefinition,
  view: string | Object,
  upcastAlso?: MatcherPattern | MatcherPattern[],
}

export type AttributeModelDefinition = {
  key: string,
  name?: string,
  values?: Array<string>
}

/**
 * The `definition.view` parameter specifies, which view attribute should be
 * converted from and to.
 *
 * It can be a { key, value, [ name ] } object or a String, which will be
 * treated like `{ key: definition.view }`.
 *
 * The **key** property is the view attribute key to convert from and to.
 *
 * The **value** is the view attribute value to convert from and to.
 *
 * If `definition.value` is not set, the view attribute value will be the same
 * as the model attribute value.
 *
 * If key is 'class', value can be a String or an array of Strings.
 *
 * If key is 'style', value is an object with key-value pairs. In other cases,
 * value is a String.
 *
 * If name is set, the conversion will be set up only for model elements with
 * the given name.
 *
 * If `definition.model.values` is set, `definition.view` is an object that
 * assigns values from definition.model.values to `{ key, value, [ name ] }`
 * objects.
 */
export type AttributeViewDefinition = {
  key: string,
  name?: string,
  value?: string | Array<string> | Object
}
