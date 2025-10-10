import {
  allFilterRules,
  FilterRuleSet,
  FilterRuleSetConfiguration,
  parseFilterRuleSetConfigurations,
  ToDataAndViewElementConfiguration,
} from "@coremedia/ckeditor5-dataprocessor-support";
import { EditorConfig, Config as CKEditorConfig } from "ckeditor5";
import { defaultStrictness, Strictness } from "../../Strictness";
import { getV10CoreMediaRichTextConfig } from "../../CoreMediaRichTextConfig";
import RichTextSchema, { V10Strictness } from "./RichTextSchema";
import { replaceBy, replaceByElementAndClassBackAndForth, replaceElementAndClassBy } from "./rules/ReplaceBy";
import { headingRules, paragraphToHeading } from "./rules/Heading";
import { handleAnchor } from "./rules/Anchor";
import { tableRules } from "./rules/Table";
import { getSchema, schemaRules } from "./rules/Schema";
import { langDataFilterRule, langMapperConfiguration, langViewFilterRule } from "./rules/Lang";
import { handleImage } from "./rules/Image";
import { listRules } from "./rules/List";

/**
 * Configuration options for CoreMedia RichText Data Processing.
 */
export interface ParsedConfig {
  readonly schema: RichTextSchema;
  readonly toData: FilterRuleSet;
  readonly toView: FilterRuleSet;
}

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
 * execution: (see especially `core/htmlparser/params.el.js`)
 *
 * * If an element name changes, filtering will be restarted at that node.
 * * If a new element is returned, it will replace the current one and processing will be restarted for that node.
 * * If false is returned, the element and all its children will be removed.
 * * If element name changes to empty, only the element itself will be removed and the children appended to the parent
 * * An element is processed first, then its attributes and afterwards its children (if any)
 * * Text nodes only support to be changed or removed… but not to be wrapped into some other params.el.
 * * `$` and `$$` are so-called generic element rules, which are applied after element
 *   processing. `$` is applied prior to filtering the children, while `$$` is applied
 *   after the element and all its children have been processed.
 *   The opposite handler is `'^'` which would be applied before all other element handlers.
 */
const defaultRules: FilterRuleSetConfiguration = {
  text: (params) => {
    if (!getSchema(params).isTextAllowedAtParent(params.node)) {
      params.node.remove = true;
    }
    // In CKEditor 4 we were used resolving entities here to their
    // UTF-8 characters. With CKEditor 5 this is unnecessary, as it
    // is the default behavior when it comes to storing data.
    // Not doing so here, fixes #39.
  },
  elements: {
    ...schemaRules,
    "a": handleAnchor,
    "img": handleImage,
    "p": {
      toData: langDataFilterRule,
      // paragraphToHeading: While we could do this per heading level, this
      // approach spares some nested calls.
      toView: {
        p: allFilterRules(langViewFilterRule, paragraphToHeading),
      },
    },
    ...headingRules,
    ...listRules,
    "blockquote": langMapperConfiguration,
    // Failsafe approach. CKEditor 5 uses <strong> by default, thus no need to remap.
    "b": replaceBy("strong"),
    "strong": langMapperConfiguration,
    "em": langMapperConfiguration,
    "sub": langMapperConfiguration,
    "sup": langMapperConfiguration,
    "i": {
      toData: replaceBy("em"),
      toView: {
        // Note, that this assumes a default CKEditor. It needs to be changed, if
        // a downcast has been installed, so that the view uses `em` instead.
        // See https://github.com/ckeditor/ckeditor5/issues/1394.
        em: replaceBy("i"),
      },
    },
    "code": replaceByElementAndClassBackAndForth("code", "span", "code"),
    "u": replaceByElementAndClassBackAndForth("u", "span", "underline"),
    "br": (params) => {
      // Remove obsolete BR, if only element on block level params.el.
      const parent = params.node.parentElement;
      const parentName = parent?.name ?? "";
      let remove = false;
      if (!parent || parentName === "div") {
        // somehow, a top-level <br> has been introduced, which is not valid:
        remove = true;
      } else if (["td", "p"].includes(parentName)) {
        // Only checking td, p here, as it was for CKEditor 4. You may argue, that other
        // block level elements should be respected too, though. Change it, if you think so.
        remove = params.node.lastNode;
      }
      params.node.remove = remove;
    },
    "del": strike,
    "s": strike,
    strike,
    // We are not applied to root-div. Thus, we have a nested div here, which
    // is not allowed in CoreMedia RichText 1.0.
    "div": replaceBy("p"),
    ...tableRules,
    "span": langMapperConfiguration,
    "pre": langMapperConfiguration,
    /*
     * DevNote: This should better be done by Differencing plugin. A
     * corresponding API is missing in `RichTextDataProcessor` yet.
     */
    "xdiff:span": {
      toView: (params) => {
        const { node } = params;
        // Later, in model, we cannot distinguish `<xdiff:span/>` representing
        // a newline (added, removed, changed) from `<xdiff:span> </xdiff:span>`
        // which is some whitespace change. Because of that, we introduce a
        // virtual new element here, which signals a newline change.
        if (node.isEmpty()) {
          node.name = "xdiff:br";
        }
        // Whitespace-Only contents: Instead of applying corresponding processing
        // here, we handle this in `RichTextDataProcessor` by declaring
        // `xdiff:span` to be a `preElement`.
        // See also: ckeditor/ckeditor5#12324
      },
    },
  },
};

/**
 * Get the parsed configuration, ready for data-processing.
 *
 * @param config - configuration to parse
 */
export const getConfig = (config?: CKEditorConfig<EditorConfig>): ParsedConfig => {
  const customConfig = getV10CoreMediaRichTextConfig(config);
  const { toData, toView } = parseFilterRuleSetConfigurations(customConfig.rules, defaultRules);
  const { strictness } = customConfig;
  let compatStrictness: V10Strictness;
  if (strictness === undefined) {
    compatStrictness = defaultStrictness;
  } else {
    switch (strictness) {
      case Strictness.STRICT:
      case Strictness.LOOSE:
      case Strictness.LEGACY:
        compatStrictness = strictness;
        break;
      case Strictness.NONE:
        compatStrictness = Strictness.LEGACY;
        break;
      default:
        throw new Error(`Incompatible strictness level ${strictness} without compatibility handling.`);
    }
  }
  const schema = new RichTextSchema(compatStrictness);
  return {
    toData,
    toView,
    schema,
  };
};
