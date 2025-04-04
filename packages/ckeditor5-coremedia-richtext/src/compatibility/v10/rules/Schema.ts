/* eslint no-null/no-null: off */

import {
  ElementFilterParams,
  TextFilterParams,
  ElementsFilterRuleSetConfiguration,
} from "@coremedia/ckeditor5-dataprocessor-support";
import RichTextSchema from "../RichTextSchema";
import { DataProcessor } from "ckeditor5";
import V10RichTextDataProcessor from "../V10RichTextDataProcessor";
import { Strictness } from "../../../Strictness";

export const defaultSchema = new RichTextSchema(Strictness.STRICT);

/**
 * Get the schema set for the data processor of the given editor.
 *
 * @param editor - parameters to retrieve editor instance from
 * @param editor.editor - the editor instance to query for schema
 */
export const getSchema = ({ editor }: ElementFilterParams | TextFilterParams): RichTextSchema => {
  const dataProcessor: DataProcessor | null = editor?.data?.processor || null;
  if (dataProcessor === null) {
    return defaultSchema;
  }
  const richTextDataProcessor: V10RichTextDataProcessor = dataProcessor as V10RichTextDataProcessor;
  if (!richTextDataProcessor) {
    return defaultSchema;
  }
  return richTextDataProcessor.richTextSchema ?? defaultSchema;
};

/**
 * Rules meant as final check for schema validity. The task is to prevent any
 * data that cannot be stored on the CoreMedia CMS Server.
 */
export const schemaRules: ElementsFilterRuleSetConfiguration = {
  $: (params) => {
    getSchema(params).adjustHierarchy(params.node);
  },
  $$: (params) => {
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
