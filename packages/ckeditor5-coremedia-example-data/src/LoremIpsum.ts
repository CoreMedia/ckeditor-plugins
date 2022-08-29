import { p, richtext } from "./RichText";

// noinspection SpellCheckingInspection
/**
 * Raw Lorem Ipsum text as provided by [loremipsum.de](https://loremipsum.de/).
 */
export const LOREM_IPSUM_RAW = `\
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd \
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd \
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd \
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Duis autem vel eum iriure dolor in hendrerit in \
vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto \
odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. \
Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore \
magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl \
ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie \
consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit \
praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend \
option congue nihil imperdiet doming id quod mazim placerat facer possim assum. \
Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore \
magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl \
ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie \
consequat, vel illum dolore eu feugiat nulla facilisis. At vero eos et accusam et justo duo dolores et ea rebum. Stet \
clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd \
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos \
erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed \
takimata ut vero voluptua. est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat. Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna \
aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no \
sea takimata sanctus est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd \
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \
Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore \
magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd \
gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.`;

/**
 * All words of the standard Lorem Ipsum text.
 */
export const LOREM_IPSUM_WORDS = LOREM_IPSUM_RAW.trim().split(/\s+/);

/**
 * Number of words contained in standard Lorem Ipsum text.
 */
export const LOREM_IPSUM_WORD_COUNT = LOREM_IPSUM_WORDS.length;

/**
 * Type for formatting blocks in generated Lorem Ipsum.
 */
export type FormatTextFunction = (text: string) => string;

/**
 * Configuration for Lorem Ipsum Generation.
 */
export interface LoremIpsumConfig {
  /**
   * Number of words in total to use in Lorem Ipsum.
   */
  words?: number;
  /**
   * Number of paragraphs to create. Words will be (almost) evenly spread
   * across all paragraphs.
   *
   * Zero (0) paragraphs will generate all words concatenated without applying
   * `formatParagraph`.
   */
  paragraphs?: number;
  /**
   * How to format paragraphs. Possibly ignored, if paragraph count is set
   * to 0 (zero).
   */
  formatParagraph?: FormatTextFunction;
  /**
   * How to format the overall result.
   */
  formatResult?: FormatTextFunction;
}

/**
 * Internal representation of parsed configuration, with all optional attributes
 * being set.
 */
type ParsedConfig = Required<LoremIpsumConfig>;

/**
 * Default configuration for Lorem Ipsum:
 *
 * * 5 words
 * * 0 paragraphs (which means all words without applying `formatParagraph`.
 * * separate paragraphs by two newlines
 * * do not apply any formatting to the overall result
 */
export const DEFAULT_CONFIG: ParsedConfig = {
  words: 5,
  paragraphs: 0,
  formatParagraph: (text: string): string => `${text}\n\n`,
  formatResult: (text: string): string => text,
};

/**
 * Splits the given array into chunks of given size.
 *
 * @param arr - array to split
 * @param chunkSize - size of chunks
 */
const chunks = <T = unknown>(arr: T[], chunkSize: number): Array<T[]> => {
  const result: Array<T[]> = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    result.push(arr.slice(i, i + chunkSize));
  }
  return result;
};

/**
 * Formats a paragraph, ensures that the first word is in uppercase and that
 * it always ends with a dot.
 *
 * @param words - words to join in paragraph
 * @param formatParagraph - formatter for paragraph
 */
const paragraph = (words: Array<string>, formatParagraph: FormatTextFunction): string => {
  const paragraphText = words
    .join(" ")
    .trim()
    // Start each paragraph with upper case.
    .replace(/^\w/, (c) => c.toUpperCase())
    // End each paragraph with a dot, possibly replacing any non-alphabetic character.
    .replace(/\W?$/, ".");
  return formatParagraph(paragraphText);
};

/**
 * Provides the given number of Lorem Ipsum words.
 *
 * @param wordCount - how many words to return
 */
export const loremIpsumWords = (wordCount: number): Array<string> => {
  let allWords: Array<string> = [];
  while (allWords.length < wordCount) {
    const missingWords = wordCount - allWords.length;
    allWords = allWords.concat(LOREM_IPSUM_WORDS.slice(0, missingWords));
  }
  return allWords;
};

/**
 * Generates Lorem Ipsum text according to the given configuration.
 *
 * @param config - configuration for Lorem Ipsum generation
 */
export const lorem = (config?: LoremIpsumConfig): string => {
  const parsedConfig: ParsedConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
  const { words: wordCount, paragraphs, formatParagraph, formatResult } = parsedConfig;
  const words = loremIpsumWords(wordCount);

  if (!paragraphs) {
    // No paragraph, just plain text. Replace possible punctuation at the end with a dot.
    return words.join(" ").replace(/\W$/, ".");
  }

  const wordsPerParagraph = Math.ceil(wordCount / paragraphs);
  const asParagraphs = chunks(words, wordsPerParagraph);
  const htmlParagraphs = `${asParagraphs.map((w) => paragraph(w, formatParagraph)).join("")}`;
  return formatResult(htmlParagraphs);
};

/**
 * Configuration for CoreMedia RichText 1.0 Lorem Ipsum.
 */
export type LoremRichTextConfig = Pick<LoremIpsumConfig, "words" | "paragraphs">;

/**
 * Default configuration for Lorem Ipsum:
 *
 * * 5 words
 * * 1 paragraph
 * * separate paragraphs by two newlines `<p>`
 * * wrap text into corresponding CoreMedia RichText `<div>`.
 */
export const DEFAULT_RICHTEXT_CONFIG: ParsedConfig = {
  words: 5,
  paragraphs: 1,
  formatParagraph: p,
  formatResult: richtext,
};

/**
 * Provides Lorem Ipsum represented as CoreMedia RichText 1.0.
 *
 * @param config - configuration for Lorem Ipsum Generation
 */
export const loremRichText = (config?: LoremRichTextConfig): string => {
  const parsedConfig = {
    ...DEFAULT_RICHTEXT_CONFIG,
    ...config,
  };
  return lorem(parsedConfig);
};
