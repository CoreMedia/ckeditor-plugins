/**
 * Word-document HTML fixtures for the FontMapper test stories. These were
 * previously read as `.html` files by `FontMapper.test.ts`; they now live with
 * the stories, because the prepared stories are what write them to the
 * clipboard (the test no longer touches the files or the clipboard API).
 *
 * Each template contains a single `{PLACE_HOLDER}` inside a Symbol-font context.
 * The FontMapper plugin maps the Symbol-font input character `$` to `∃`, so the
 * prepared clipboard payload substitutes the placeholder with that input.
 */

const CHARACTER_PLACEHOLDER = "{PLACE_HOLDER}";

/**
 * Symbol-font input character pasted into the editor. The FontMapper plugin maps
 * it to {@link FONT_MAPPER_EXPECTED_OUTPUT}.
 */
export const FONT_MAPPER_INPUT_SYMBOL = "$";

/**
 * Character the FontMapper plugin is expected to render for
 * {@link FONT_MAPPER_INPUT_SYMBOL}.
 */
export const FONT_MAPPER_EXPECTED_OUTPUT = "∃";

/**
 * The simplest Word file: one symbol without any container.
 */
const wordTemplate = `<html xmlns="http://www.w3.org/TR/REC-html40">
<!--
The most simples word file: One symbol without any container or anything.
-->
<head>
  <meta http-equiv=Content-Type content="text/html; charset=utf-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <meta name=Originator content="Microsoft Word 15">
</head>
<body lang=en-DE style='tab-interval:36.0pt;word-wrap:break-word'>
<span lang=DE
      style='font-family:Symbol;mso-fareast-font-family:Calibri;mso-fareast-theme-font:minor-latin;mso-bidi-font-family:"Times New Roman";mso-bidi-theme-font:minor-bidi;mso-ansi-language:DE;mso-fareast-language:EN-US;mso-bidi-language:AR-SA'>{PLACE_HOLDER}</span>
</body>
</html>
`;

/**
 * A table with a span inside that carries the Symbol font directly. Validates
 * replacement inside containers.
 */
const wordTemplateTable = `<!--
A testfile which contains a table and a span inside the table with the font-family Symbol.
Used to validate if the replacement works inside containers.
-->
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns="http://www.w3.org/TR/REC-html40">

<head>
  <meta http-equiv=Content-Type content="text/html; charset=utf-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <meta name=Originator content="Microsoft Word 15">

</head>

<body>

<table>
  <tr>
    <td>
      <p ><span lang=EN-US style='font-family:Symbol'>{PLACE_HOLDER}<o:p></o:p></span></p>
    </td>
  </tr>
</table>

<p><span lang=EN-US><o:p>&nbsp;</o:p></span></p>

<!--EndFragment-->
</body>

</html>
`;

/**
 * A table that carries the Symbol font, with a child span that must inherit it.
 * Validates replacement for inherited font families.
 */
const wordTemplateTableInheritFont = `<!--
A testfile which contains a table and a span inside the table.
The table has the font-family and the font-family must be inherited to children.

Used to validate if the replacement works for inherited font families.

-->
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns="http://www.w3.org/TR/REC-html40">

<head>
  <meta http-equiv=Content-Type content="text/html; charset=utf-8">
  <meta name=ProgId content=Word.Document>
  <meta name=Generator content="Microsoft Word 15">
  <meta name=Originator content="Microsoft Word 15">

</head>

<body lang=PL style='tab-interval:35.4pt'>

<table style='font-family:Symbol;'>
  <tr>
    <td>
      <p><span lang=EN-US>{PLACE_HOLDER}<o:p></o:p></span></p>
    </td>
  </tr>
</table>
</body>

</html>
`;

/**
 * Substitutes the Symbol-font input character into a template, producing the
 * exact `text/html` payload a prepared story writes to the clipboard.
 */
const prepareClipboardHtml = (template: string): string =>
  template.replace(CHARACTER_PLACEHOLDER, FONT_MAPPER_INPUT_SYMBOL);

/**
 * Prepared `text/html` clipboard payloads, keyed by the kebab-cased story id
 * suffix used for the matching FontMapper story export.
 */
export const fontMapperClipboardHtml = {
  "word-template": prepareClipboardHtml(wordTemplate),
  "word-template-table": prepareClipboardHtml(wordTemplateTable),
  "word-template-table-inherit-font": prepareClipboardHtml(wordTemplateTableInheritFont),
} as const;
