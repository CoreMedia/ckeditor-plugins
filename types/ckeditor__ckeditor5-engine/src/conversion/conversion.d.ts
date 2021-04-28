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

  attributeToAttribute(definition: {
    model: string | Object,
    view: string | Object,
    upcastAlso?: MatcherPattern | MatcherPattern[],
  }): void;

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
