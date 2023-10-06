import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { removeLeadingAndTrailingNewlines } from "../BBCodeUtils";

const escapeLanguage = (language: string): string => language.replace(/([\][])/g, "\\$1");
const ckeditorCodeBlockLanguageClassPrefix = "language-";

/**
 * Determines the language as it is set in CKEditor's data view for a given
 * code block. The language is attached as class to the nested `<code>`
 * element, like `language-css`. For plain text, the class added is
 * `language-plaintext`. Classes like this may be ignored by optional
 * parameter `forceUnset`.
 *
 * Typical CKEditor Code Blocks:
 *
 * ```xml
 * <pre><code class="language-plaintext">TEXT</code></pre>
 * <pre><code class="language-css">CSS</code></pre>
 * ```
 *
 * @param element - element to try to determine language for
 * @param forceUnset - languages that enforce `undefined` as return value
 * @returns the detected language or `undefined` if it cannot be determined or
 * is enforced to signal _unset_.
 */
const determineLanguage = (element: HTMLPreElement, forceUnset = ["plaintext"]): string | undefined => {
  const { firstElementChild } = element;
  if (!(firstElementChild instanceof HTMLElement)) {
    return;
  }

  const languageCls = Array.from(firstElementChild.classList).find((cls) =>
    cls.startsWith(ckeditorCodeBlockLanguageClassPrefix),
  );
  if (!languageCls) {
    return;
  }

  const language = languageCls.replace(ckeditorCodeBlockLanguageClassPrefix, "");
  if (!language || forceUnset.includes(language)) {
    return;
  }
  return language;
};

/**
 * Maps `<pre>` to `[code]`.
 */
export class BBCodeCode implements BBCodeProcessingRule {
  readonly id = "code";
  readonly tags = ["code"];
  toData(element: HTMLElement, content: string): undefined | string {
    if (!(element instanceof HTMLPreElement)) {
      return;
    }
    const language = determineLanguage(element);
    const trimmed = removeLeadingAndTrailingNewlines(content);
    if (language) {
      return `[code=${escapeLanguage(language)}]\n${trimmed}\n[/code]\n`;
    }
    return `[code]\n${trimmed}\n[/code]\n`;
  }
}

export const bbCodeCode = new BBCodeCode();
