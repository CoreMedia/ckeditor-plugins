import type { ExampleData } from "../ExampleData";
import { LOREM_IPSUM_WORD_COUNT, loremRichText } from "../LoremIpsum";

const manyWords = LOREM_IPSUM_WORD_COUNT * 10;
const manyWordsLabel = `Lorem (${manyWords} words)`;

// noinspection JSUnusedGlobalSymbols Used in Example App
/**
 * Provides example texts containing Lorem Ipsum.
 */
export const loremIpsumData: ExampleData = {
  Lorem: loremRichText({ words: LOREM_IPSUM_WORD_COUNT, paragraphs: 10 }),
  [manyWordsLabel]: loremRichText({ words: manyWords, paragraphs: 80 }),
};
