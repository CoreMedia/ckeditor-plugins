import RichTextSchema, { Strictness } from "./RichTextSchema";
import CKEditorConfig from "@ckeditor/ckeditor5-utils/src/config";
import {
  ElementFilterParams,
  ElementFilterRule,
  FilterRuleSet,
  FilterRuleSetConfiguration,
  parseFilterRuleSetConfigurations,
  TextFilterParams,
  ToDataAndViewElementConfiguration,
} from "@coremedia/ckeditor5-dataprocessor-support/index";
import { replaceBy, replaceByElementAndClassBackAndForth, replaceElementAndClassBy } from "./rules/ReplaceBy";
import { headingRules, paragraphToHeading } from "./rules/Heading";
import { handleAnchor } from "./rules/Anchor";

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
  toData: replaceBy("span", "strike"),
  // The default CKEditor 5 representation of strikethrough is `<s>`.
  toView: replaceElementAndClassBy("span", "strike", "s"),
};

const defaultSchema = new RichTextSchema(Strictness.STRICT);

function getSchema(params: ElementFilterParams | TextFilterParams): RichTextSchema {
  const dataProcessor: any = params.editor?.data?.processor || {};
  return dataProcessor["richTextSchema"] as RichTextSchema ?? defaultSchema;
}

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
// TODO[cke] Review and move these rules, e. g. to configuration class documentation.
const defaultRules: FilterRuleSetConfiguration = {
  text: (params) => {
    if (!getSchema(params).isTextAllowedAtParent(params.node)) {
      params.node.remove = true;
    } else {
      params.node.decodeHtmlEntities();
    }
  },
  elements: {
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
    a: handleAnchor,
    ol: removeInvalidList,
    ul: removeInvalidList,
    p: {
      // While we could do this per heading level, this approach spares some
      // nested calls.
      toView: {
        p: paragraphToHeading,
      },
    },
    ...headingRules,
    // Failsafe approach. CKEditor 5 uses <strong> by default, thus no need to remap.
    b: replaceBy("strong"),
    i: {
      toData: replaceBy("em"),
      toView: {
        // Note, that this assumes a default CKEditor. It needs to be changed, if
        // a downcast has been installed, so that the view uses `em` instead.
        // See https://github.com/ckeditor/ckeditor5/issues/1394.
        em: replaceBy("i"),
      },
    },
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
    td: (params) => {
      params.node.removeChildren = params.node.isEmpty((el, idx, children) => {
        // !Reverted logic! `true` signals, that the element should be considered,
        //   when judging on "is empty".

        // Only filter, if there is only one child. While it may be argued, if this
        // is useful, this is the behavior as we had it for CKEditor 4.
        if (children.length !== 1) {
          return true;
        }
        // If the element has more than one child node, the following rules don't apply.
        if (el.childNodes.length > 1) {
          return true;
        }

        // Ignore, if only one br exists.
        if (el.nodeName.toLowerCase() === "br") {
          return false;
        }
        // Next gate: Further analysis only required, if current element is <p>
        if (el.nodeName.toLowerCase() !== "p") {
          return true;
        }
        // Only respect p-element, if it is considered non-empty.
        // Because of the check above, we already know, that, the element
        // has at maximum one child.
        return el.hasChildNodes() && el.firstChild?.nodeName.toLowerCase() !== "br";
      });
    },
    th: replaceByElementAndClassBackAndForth("th", "td", "td--heading"),
    /*
     * tr/tables rules:
     * ----------------
     *
     * In CKEditor 4 we also had to handle tr and table which may have been
     * emptied during the process. This behavior moved to the after-children
     * behavior, which checks for elements which must not be empty but now
     * are empty.
     */
    tbody: (params) => {
      // If there are more elements at parent than just this tbody, tbody must
      // be removed. Typical scenario: Unknown element <thead> got removed, leaving
      // a structure like <table><tr/><tbody><tr/></tbody></table>. We must now move
      // all nested trs up one level and remove the tbody params.el.
      params.node.replaceByChildren = !params.node.singleton;
    },
    span: (params) => {
      if (!params.node.attributes["class"]) {
        // drop element, but not children
        params.node.replaceByChildren = true;
      }
    },
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
