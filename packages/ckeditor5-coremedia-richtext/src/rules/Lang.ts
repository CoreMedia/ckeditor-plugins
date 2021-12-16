import {
  asDataFilterRule,
  asViewFilterRule,
  preserveAttributeAs,
} from "@coremedia/ckeditor5-dataprocessor-support/Attributes";
import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";

/**
 * Maps `xml:lang` and `lang` from data (CoreMedia RichText) to `lang`.
 * Just as in the [standard definition](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-lang),
 * `xml:lang` is preferred over `lang` when both are set in CoreMedia RichText.
 *
 * Note, that on transformation to data, the language will always be stored
 * in `xml:lang`.
 */
const langMapper = preserveAttributeAs("xml:lang", "lang", "lang");

const langDataFilterRule: ElementFilterRule = asDataFilterRule(langMapper);

const langViewFilterRule: ElementFilterRule = asViewFilterRule(langMapper);

const langMapperConfiguration: ToDataAndViewElementConfiguration = {
  toData: langDataFilterRule,
  toView: langViewFilterRule,
};

export { langMapper, langDataFilterRule, langViewFilterRule, langMapperConfiguration };
