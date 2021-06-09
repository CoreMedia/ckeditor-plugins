import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { ElementsFilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";

export const HEADING_NUMBER_PATTERN = /^h(\d+)$/;
export const HEADING_BY_CLASS_NUMBER_PATTERN = /^p--heading-(\d+)$/;

/**
 * Transforms a heading from view to a paragraph having a class attribute
 * denoting the heading level.
 */
export const headingToParagraph: ElementFilterRule = ({ node }) => {
  const match = HEADING_NUMBER_PATTERN.exec(node.name || "");
  if (!match) {
    // Some other rule may have already changed the name. Nothing to do.
    return;
  }
  const headingLevel = match[1];
  node.name = "p";
  node.attributes["class"] = `p--heading-${headingLevel}`;
};

/**
 * Transforms a paragraph with class attribute from data to a corresponding
 * heading. Denoting class attribute will be removed.
 *
 * Node won't be changed for unmatched heading classes.
 */
export const paragraphToHeading: ElementFilterRule = ({ node }) => {
  const match = HEADING_BY_CLASS_NUMBER_PATTERN.exec(node.attributes["class"] || "");
  if (!match) {
    // Cannot determine number. Perhaps someone already removed the class.
    return;
  }
  const headingLevel: number = +match[1];
  if (headingLevel < 1 || headingLevel > 6) {
    // Someone "messed" with our classes. Just do nothing.
    return;
  }
  node.name = `h${headingLevel}`;
  delete node.attributes["class"];
};

export const headingRules: ElementsFilterRuleSetConfiguration = {
  h1: headingToParagraph,
  h2: headingToParagraph,
  h3: headingToParagraph,
  h4: headingToParagraph,
  h5: headingToParagraph,
  h6: headingToParagraph,
};
