import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { trimLeadingAndTrailingNewlines } from "../BBCodeUtils";

/**
 * The default extracted language by `HTMLElement.classList` that is considered
 * _plain text_, which, in return, will not show up as language token.
 */
export const defaultPlainTextToken = "plaintext";

/**
 * Used to extract a language from a given entry in `HTMLElement.classList`.
 *
 * Note that matched language tokens must not contain reserved characters
 * such as `[` or `]` that will break BBCode parsing.
 *
 * A falsy return value will skip any further language processing and
 * especially will not add any language identifier to the resulting
 * BBCode.
 */
export type LanguageByClass = (classListEntry: string) => string | undefined;

/**
 * Signals, if a given non-empty token extracted via `LanguageByClass` should be
 * considered as _unset_ when generating the resulting BBCode.
 */
export type IsUnset = (languageToken: string) => boolean;

/**
 * Default language token pattern applied by CKEditor 5 Code Block Plugin,
 * which is a class prefixed with `language-` and follows by some alphabetic
 * (widened to alphanumeric, here) characters.
 */
const ckeditor5DefaultCodeBlockLanguagePattern = /^language-(\w+)$/;

/**
 * Default language detection suitable for the default CKEditor 5 Code
 * Block configuration, using class tokens prefixed with `language-`.
 *
 * @param classListEntry - a single entry in the class list to match.
 */
export const defaultLanguageByClass: LanguageByClass = (classListEntry: string): string | undefined => {
  if (!classListEntry) {
    return undefined;
  }
  const languageMatch = ckeditor5DefaultCodeBlockLanguagePattern.exec(classListEntry);
  return languageMatch?.[1];
};

/**
 * Default predicate to identify a given token as _unset language_ when
 * generating BBCode. It considers `plaintext` as to-be-ignored language,
 * as this is the default plain text token in CKEditor 5 Code Block
 * configuration.
 *
 * @param languageToken - language token to validate
 */
export const defaultIsUnset: IsUnset = (languageToken: string): boolean => defaultPlainTextToken === languageToken;

/**
 * Configuration for `BBCodeCode` rule.
 */
export interface BBCodeCodeConfig {
  /**
   * Strategy to retrieve a language token from applied classes.
   */
  fromClass?: LanguageByClass;
  /**
   * Predicate to validate, if a language token extracted by
   * `fromClass` is to be considered _unset_. Typically used for values such
   * as `plaintext`. Thus, `isUnset` should relate to the results of
   * `fromClass`.
   */
  isUnset?: IsUnset;
}

/**
 * Processing rule for transforming a code blocks represented in HTML
 * to `[code]Text[/code]` in BBCode. The rule expects the representation of
 * code blocks as it is the default for the CKEditor 5 Code Block plugin, thus,
 * a structure like this:
 *
 * ```xml
 * <pre><code class="language-plaintext">TEXT</code></pre>
 * <pre><code class="language-css">CSS</code></pre>
 * ```
 */
export class BBCodeCode implements BBCodeProcessingRule {
  readonly id = "code";
  readonly tags = ["code"];
  readonly config: Required<BBCodeCodeConfig>;

  constructor(config: BBCodeCodeConfig = {}) {
    const { fromClass = defaultLanguageByClass, isUnset = defaultIsUnset } = config;
    this.config = {
      fromClass,
      isUnset,
    };
  }

  /**
   * Find the first token that denotes a language and returns its matched part.
   *
   * @param tokens - class list tokens to match
   */
  #findFirstLanguage(tokens: string[]):
    | {
        language: string;
        languageCls: string;
      }
    | undefined {
    const mappingPredicate = this.config.fromClass;
    for (const token of tokens) {
      const found = mappingPredicate(token);
      if (found) {
        return {
          language: found,
          languageCls: token,
        };
      }
    }

    return undefined;
  }

  /**
   * Determines the language as it is set in CKEditor's data view for a given
   * code block. The language is attached as class to the nested `<code>`
   * element, like `language-css`. For plain text, the class added is
   * `language-plaintext`. Classes like this may be ignored by optional
   * parameter `forceUnset`.
   *
   * @param element - element to try to determine language for
   */
  #determineLanguage(element: HTMLPreElement): string | undefined {
    const { firstElementChild } = element;
    if (!(firstElementChild instanceof HTMLElement)) {
      return undefined;
    }
    const languageInformation = this.#findFirstLanguage(Array.from(firstElementChild.classList));
    if (languageInformation) {
      const { language, languageCls } = languageInformation;
      // Mark as "consumed".
      firstElementChild.classList.remove(languageCls);
      if (!this.config.isUnset(language)) {
        return language;
      }
    }
    return undefined;
  }

  #startTag(element: HTMLPreElement): "[code]" | `[code=${string}]` {
    const language = this.#determineLanguage(element);
    if (language) {
      return `[code=${language}]`;
    }
    return "[code]";
  }

  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLPreElement)) {
      return undefined;
    }
    const startTag = this.#startTag(element);
    const endTag = "[/code]";
    // We consider all whitespace at the end of a code block as irrelevant.
    // For the start, we must only remove newlines, as otherwise we may break
    // the desired indentations in the pre-section.
    const trimmedContent = trimLeadingAndTrailingNewlines(content, { trimEndWhitespace: true });
    return `${startTag}\n${trimmedContent}\n${endTag}\n`;
  }
}

/**
 * Processing rule instance for transforming a code blocks represented in HTML
 * to `[code]Text[/code]` in BBCode.
 */
export const bbCodeCode = new BBCodeCode();
