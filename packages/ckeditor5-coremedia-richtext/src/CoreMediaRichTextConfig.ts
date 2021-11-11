import RichTextSchema, { Strictness } from "./RichTextSchema";
import CKEditorConfig from "@ckeditor/ckeditor5-utils/src/config";

import { allFilterRules, ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { FilterRuleSet } from "@coremedia/ckeditor5-dataprocessor-support/HtmlFilter";
import {
  FilterRuleSetConfiguration,
  parseFilterRuleSetConfigurations,
  ToDataAndViewElementConfiguration,
} from "@coremedia/ckeditor5-dataprocessor-support/Rules";

import { replaceBy, replaceByElementAndClassBackAndForth, replaceElementAndClassBy } from "./rules/ReplaceBy";
import { headingRules, paragraphToHeading } from "./rules/Heading";
import { handleAnchor } from "./rules/Anchor";
import { tableRules } from "./rules/Table";
import { getSchema, schemaRules } from "./rules/Schema";
import { langDataFilterRule, langMapperConfiguration, langViewFilterRule } from "./rules/Lang";

export const COREMEDIA_RICHTEXT_CONFIG_KEY = "coremedia:richtext";

/**
 * Configuration as given at CKEditor initialization.
 */
export default interface CoreMediaRichTextConfig {
  /**
   * The strictness when validating against CoreMedia RichText 1.0 DTD.
   */
  readonly strictness?: Strictness;
  readonly rules?: FilterRuleSetConfiguration;
}

/**
 * Configuration options for CoreMedia RichText Data Processing.
 */
export interface ParsedConfig {
  readonly schema: RichTextSchema;
  readonly toData: FilterRuleSet;
  readonly toView: FilterRuleSet;
}

// Workaround/Fix for CMS-10539 (Error while Saving when deleting in Lists, MSIE11)
const removeInvalidList: ElementFilterRule = (params) => {
  params.node.remove = params.node.empty || !params.node.findFirst("li");
};

/**
 * Rule to transform several representations of strikeout-state. As CKEditor
 * represents strikeout as `<s>` by default, all of them will be re-transformed
 * to `<s>` on toView mapping.
 */
const strike: ToDataAndViewElementConfiguration = {
  toData: allFilterRules(replaceBy("span", "strike")),
  // The default CKEditor 5 representation of strikethrough is `<s>`.
  toView: replaceElementAndClassBy("span", "strike", "s"),
};

/**
 * Coremedia Richtext Filter, that are applied before writing it back to the server. Some details about filter
 * execution: (see especially <code>core/htmlparser/params.el.js</code>)
 *
 * <ul>
 * <li>If an element name changes, filtering will be restarted at that node.</li>
 * <li>If a new element is returned, it will replace the current one and processing will be restarted for that node.</li>
 * <li>If false is returned, the element and all its children will be removed.</li>
 * <li>If element name changes to empty, only the element itself will be removed and the children appended to the parent</li>
 * <li>An element is processed first, then its attributes and afterwards its children (if any)</li>
 * <li>Text nodes only support to be changed or removed... but not to be wrapped into some other params.el.</li>
 * <li><code>$</code> and <code>$$</code> are so called generic element rules which are applied after element
 * processing. <code>$</code> is applied prior to filtering the children, while <code>$$</code> is applied
 * after the element and all its children have been processed.
 * The opposite handler is <code>'^'</code> which would be applied before all other element handlers.</li>
 * </ul>
 */
const defaultRules: FilterRuleSetConfiguration = {
  text: (params) => {
    if (!getSchema(params).isTextAllowedAtParent(params.node)) {
      params.node.remove = true;
    } else {
      params.node.decodeHtmlEntities();
    }
  },
  elements: {
    ...schemaRules,
    a: handleAnchor,
    ol: {
      toData: allFilterRules(langDataFilterRule, removeInvalidList),
      toView: langViewFilterRule,
    },
    ul: {
      toData: allFilterRules(langDataFilterRule, removeInvalidList),
      toView: langViewFilterRule,
    },
    li: langMapperConfiguration,
    p: {
      toData: langDataFilterRule,
      // paragraphToHeading: While we could do this per heading level, this
      // approach spares some nested calls.
      toView: {
        p: allFilterRules(langViewFilterRule, paragraphToHeading),
      },
    },
    ...headingRules,
    // Failsafe approach. CKEditor 5 uses <strong> by default, thus no need to remap.
    b: replaceBy("strong"),
    strong: langMapperConfiguration,
    em: langMapperConfiguration,
    sub: langMapperConfiguration,
    sup: langMapperConfiguration,
    i: {
      toData: replaceBy("em"),
      toView: {
        // Note, that this assumes a default CKEditor. It needs to be changed, if
        // a downcast has been installed, so that the view uses `em` instead.
        // See https://github.com/ckeditor/ckeditor5/issues/1394.
        em: replaceBy("i"),
      },
    },
    code: replaceByElementAndClassBackAndForth("code", "span", "code"),
    u: replaceByElementAndClassBackAndForth("u", "span", "underline"),
    br: (params) => {
      // Remove obsolete BR, if only element on block level params.el.
      const parent = params.node.parentElement;
      const parentName = parent?.name || "";
      let remove = false;
      if (!parent || parentName === "div") {
        // somehow, a top-level <br> has been introduced, which is not valid:
        remove = true;
      } else if (["td", "p"].indexOf(parentName) >= 0) {
        // Only checking td, p here, as it was for CKEditor 4. You may argue, that other
        // block level elements should be respected too, though. Change it, if you think so.
        remove = params.node.lastNode;
      }
      params.node.remove = remove;
    },
    del: strike,
    s: strike,
    strike: strike,
    // We are not applied to root-div. Thus, we have a nested div here, which
    // is not allowed in CoreMedia RichText 1.0.
    div: replaceBy("p"),
    ...tableRules,
    span: langMapperConfiguration,
    pre: langMapperConfiguration,
    "xdiff:span": (params) => {
      params.node.replaceByChildren = true;
    },
  },
};

export function getConfig(config?: CKEditorConfig): ParsedConfig {
  const customConfig: CoreMediaRichTextConfig =
    <CoreMediaRichTextConfig>config?.get(COREMEDIA_RICHTEXT_CONFIG_KEY) || {};

  const { toData, toView } = parseFilterRuleSetConfigurations(customConfig.rules, defaultRules);

  const schema = new RichTextSchema(customConfig.strictness || Strictness.STRICT);

  return {
    toData,
    toView,
    schema,
  };
}
