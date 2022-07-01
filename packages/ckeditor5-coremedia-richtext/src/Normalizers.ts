import { Normalizer } from "@coremedia/ckeditor5-richtext-normalizer/DataDiffer";

/**
 * Matches XML declaration such as `<?xml version="1.0">` and ignores possible
 * spacing around.
 */
const xmlDeclarationRegExp = /^\s*<\?.*?\?>\s*/s;
/**
 * Remove XML declaration, if considered irrelevant for comparison.
 *
 * @param value - value to normalize
 */
export const normalizeXmlDeclaration: Normalizer = (value: string): string => {
  return value.replace(xmlDeclarationRegExp, "");
};

/**
 * Matches XML namespace declarations `xmlns=` as well as `xmlns:someName=`.
 * Using lookahead/lookbehind to only strip within element context.
 */
const namespaceDeclarationRegExp = /(?<=<[^>]*)xmlns(?::\w+)?=['"][^'"]+['"]\s*(?=[^>]*>)/gs;
/**
 * Matches any element. Used to possibly trim the corresponding element,
 * which may contain trailing spaces due to previous removal of namespace
 * declaration.
 */
const elementRegExp = /(?<=<)[^>]+?(?=\/?>)/gs;

/**
 * Remove XML namespace declarations, if considered irrelevant for comparison.
 *
 * @param value - value to normalize
 */
export const normalizeNamespaceDeclarations: Normalizer = (value: string): string => {
  return (
    value
      // First remove namespace declarations.
      // lgtm: This is not about sanitation.
      .replaceAll(namespaceDeclarationRegExp, "") // lgtm[js/incomplete-multi-character-sanitization]
      // Then we may have redundant spaces left: Remove.
      .replace(elementRegExp, (s) => s.trim())
  );
};

/**
 * Different representations of an empty paragraph to be normalized:
 *
 * ```
 * <p/>
 * <p class="xmp"/>
 * <p></p>
 * <p class="xmp"></p>
 * <p><br/></p>
 * <p class="xmp"><br/></p>
 * <p>&nbsp;</p>
 * <p>\u{00A0}</p>
 * ```
 */
const emptyParagraphRegExp = /<p\s*(|\s[^>\\]*)(?:\s*\/>|>(?:<br\s*\/>|&nbsp;|\s*))<\/p>/gs;

/**
 * Normalizes different representations of paragraphs considered empty.
 *
 * Empty paragraphs in context of CoreMedia Studio as loaded from
 * Content Management Server may have different representations, depending on
 * the editor used before, to generate CoreMedia RichText.
 *
 * Example representations:
 *
 * ```
 * <p><br/></p>
 * <p>&nbsp;</p>
 * <p>\u{00A0}</p>
 * ```
 *
 * @param value - value to normalize
 */
export const normalizeEmptyParagraphs: Normalizer = (value: string): string => {
  return value.replaceAll(emptyParagraphRegExp, "<p$1/>");
};
