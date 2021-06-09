import { ElementFilterParams } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { TextFilterParams } from "@coremedia/ckeditor5-dataprocessor-support/TextProxy";
import RichTextSchema, { Strictness } from "../RichTextSchema";
import { ElementsFilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";

export const defaultSchema = new RichTextSchema(Strictness.STRICT);

export function getSchema(params: ElementFilterParams | TextFilterParams): RichTextSchema {
  const dataProcessor: any = params.editor?.data?.processor || {};
  return dataProcessor["richTextSchema"] as RichTextSchema ?? defaultSchema;
}

/**
 * Rules meant as final check for schema validity. The task is to prevent any
 * data which cannot be stored on the CoreMedia CMS Server.
 */
export const schemaRules: ElementsFilterRuleSetConfiguration = {
  $: (params) => {
    getSchema(params).adjustHierarchy(params.node);
  },
  "$$": (params) => {
    const schema = getSchema(params);
    // The hierarchy may have changed after processing children. Thus, we
    // need to check again.
    schema.adjustHierarchy(params.node);
    // We only expect the element to be possibly removed. replaceByChildren
    // should have been triggered by "before-children" rule.
    if (!params.node.remove) {
      schema.adjustAttributes(params.node);
    }
  },
};
