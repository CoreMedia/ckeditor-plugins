import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/src/ElementProxy";
import { ElementsFilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/src/Rules";
import { langMapper } from "./Lang";
import { warnOnAmbiguousElementState } from "@coremedia/ckeditor5-dataprocessor-support/src/RulesLogger";

const HEADING_NUMBER_PATTERN = /^h(\d+)$/;
const HEADING_CLASSES = Array.from(Array(6).keys()).map((i) => `p--heading-${i + 1}`);
const HEADING_BY_CLASS_NUMBER_PATTERN = /^p--heading-(\d+)$/;

/**
 * Transforms a heading from view to a paragraph having a class attribute
 * denoting the heading level.
 */
export const headingToParagraph: ElementFilterRule = (params) => {
  const { node } = params;
  const match = HEADING_NUMBER_PATTERN.exec(node.name || "");
  if (!match) {
    // Some other rule may have already changed the name. Nothing to do.
    return;
  }
  const headingLevel = match[1];
  node.name = "p";
  node.classList.add(`p--heading-${headingLevel}`);
  langMapper.toData(params);
};

/**
 * Transforms a paragraph with class attribute from data to a corresponding
 * heading. Denoting class attribute will be removed.
 *
 * Node won't be changed for unmatched heading classes.
 */
export const paragraphToHeading: ElementFilterRule = (params) => {
  const { node } = params;
  const classes = [...node.classList];
  const matchedHeading = HEADING_CLASSES.find((c) => classes.includes(c));
  if (!matchedHeading) {
    // Cannot determine number. Perhaps someone has already removed the class.
    return;
  }
  const match = HEADING_BY_CLASS_NUMBER_PATTERN.exec(matchedHeading);
  if (!match) {
    // Should not happen, as we matched the array of headings before.
    return;
  }
  const headingLevel: number = +match[1];
  if (headingLevel < 1 || headingLevel > 6) {
    // Should not happen, as we matched the array of headings before.
    return;
  }
  node.name = `h${headingLevel}`;
  const ambiguousClasses: string[] = [];
  // Now remove any heading-related classes.
  // Similar to #101 we resolve ambiguity here. In contrast to #110 with
  // easy predictable behavior, as the higher heading will win.
  HEADING_CLASSES.forEach((c) => {
    if (c !== matchedHeading && node.classList.contains(c)) {
      ambiguousClasses.push(c);
    }
    node.classList.remove(c);
  });

  if (ambiguousClasses.length > 0) {
    warnOnAmbiguousElementState(
      `Paragraph already got mapped to ${node.name} according to corresponding class. Ignored ambiguous heading classes: ${ambiguousClasses}.`
    );
  }
};

export const headingRules: ElementsFilterRuleSetConfiguration = {
  h1: headingToParagraph,
  h2: headingToParagraph,
  h3: headingToParagraph,
  h4: headingToParagraph,
  h5: headingToParagraph,
  h6: headingToParagraph,
};
