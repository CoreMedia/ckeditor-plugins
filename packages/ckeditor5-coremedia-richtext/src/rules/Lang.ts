import {
  asDataFilterRule,
  asViewFilterRule,
  preserveAttributeAs,
} from "@coremedia/ckeditor5-dataprocessor-support/Attributes";
import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";

const langMapper = preserveAttributeAs("lang", "lang", "xml:lang");

const langDataFilterRule: ElementFilterRule = asDataFilterRule(langMapper);

const langViewFilterRule: ElementFilterRule = asViewFilterRule(langMapper);

const langMapperConfiguration: ToDataAndViewElementConfiguration = {
  toData: langDataFilterRule,
  toView: langViewFilterRule,
};

export { langMapper, langDataFilterRule, langViewFilterRule, langMapperConfiguration };
