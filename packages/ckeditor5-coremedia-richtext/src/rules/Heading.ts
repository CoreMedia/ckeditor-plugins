import { ElementFilterRule } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import { ElementsFilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import { langMapper } from "./Lang";

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
  console.error("headingToParagraph, before", {
    classList: [...node.classList],
  });
  node.classList.add(`p--heading-${headingLevel}`);
  console.error("headingToParagraph, after", {
    classList: [...node.classList],
  });
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
    // Cannot determine number. Perhaps someone already removed the class.
    return;
  }
  const match = HEADING_BY_CLASS_NUMBER_PATTERN.exec(matchedHeading);
  if (!match) {
    // Should not happen, as we matched before.
    return;
  }
  const headingLevel: number = +match[1];
  if (headingLevel < 1 || headingLevel > 6) {
    // Someone "messed" with our classes. Just do nothing.
    return;
  }
  node.name = `h${headingLevel}`;
  console.error("paragraphToHeading, before", {
    classList: [...node.classList],
  });
  // Now remove any heading-related classes.
  HEADING_CLASSES.forEach((c) => node.classList.remove(c));
  console.error("paragraphToHeading, after", {
    classList: [...node.classList],
  });
};

export const headingRules: ElementsFilterRuleSetConfiguration = {
  h1: headingToParagraph,
  h2: headingToParagraph,
  h3: headingToParagraph,
  h4: headingToParagraph,
  h5: headingToParagraph,
  h6: headingToParagraph,
};
