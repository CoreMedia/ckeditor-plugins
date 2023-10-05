/// <reference lib="dom" />

import { bbCodeDefaultRules } from "../src";
import { html2bbcode } from "../src/html2bbcode";
import { bbcode2html } from "../src/bbcode2html";

const rules = bbCodeDefaultRules;
const supportedTags = rules.flatMap((r) => r.tags ?? ([] as string[]));
const domParser = new DOMParser();

const asFragment = (innerHtml: string): DocumentFragment => {
  const parsedDocument = domParser.parseFromString(`<body>${innerHtml}</body>`, "text/html");
  const result = new DocumentFragment();
  result.append(...parsedDocument.body.childNodes);
  return result;
};

const aut = {
  /**
   * Delegate to our proprietary HTML to BBCode processing.
   */
  html2bbcode: (s: string) => html2bbcode(asFragment(s), rules),
  /**
   * Delegate to third-party code. Note that on any failed expectation, it may
   * be perfectly valid, adjusting the expectation. If, for example, BBob
   * changes from parsing `[b]` to a `<span>` with `fontWeight` to some
   * dedicated element like `<strong>` or `<b>`, we may well adapt the
   * expectation.
   */
  bbcode2html: (s: string) => bbcode2html(s, supportedTags),
  /**
   * Artificial test for consuming result of BBCode to HTML processing from
   * the third-party library directly by our proprietary HTML to BBCode
   * processing.
   *
   * This case will not happen in production, where the CKEditor layers
   * serve as _mediators_ between these two. Nevertheless, testing that
   * they _understand_ each other provides some confidence that nothing
   * broke.
   */
  bbcode2html2bbcode: (
    input: string,
  ): {
    input: string;
    fromBBCode2Html: string;
    fromHtml2BBCode: string;
  } => {
    const fromBBCode2Html = bbcode2html(input, supportedTags);
    const fromHtml2BBCode = html2bbcode(asFragment(fromBBCode2Html), rules);
    return {
      input,
      fromBBCode2Html,
      fromHtml2BBCode,
    };
  },
};

/**
 * We have a some slightly slanted state regarding transformation
 * BBCode ↔ HTML: While for BBCode to HTML we use a third-party library,
 * we have our own proprietary processing for HTML to BBCode. At least for
 * the processing BBCode to HTML, we should ensure that the HTML to BBCode
 * processing produces results that can be successfully parsed by the
 * third-party library. The other way round is nice to have, as the
 * HTML to BBCode proprietary code will never directly receive data from
 * BBCode to HTML processing: It will always go through the CKEditor layers,
 * too, and CKEditor is known to apply its own normalization, such as
 * transforming `font-weight:bold` style to `<strong>` in the view layers.
 */
describe("BBob Integration", () => {
  describe("Important: HTML →[toData]→ BBCode →[toView]→ HTML", () => {
    it("should not modify empty BBCode", () => {
      const fromDataView = "";
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual("");
    });

    it.each`
      htmlElement
      ${"strong"}
      ${"b"}
    `("[$#] should process <$htmlElement>", ({ htmlElement }: { htmlElement: string }) => {
      const text = "lorem";
      const fromDataView = `<${htmlElement}>${text}</${htmlElement}>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(`<span style="font-weight: bold;">${text}</span>`);
    });

    it.each`
      htmlElement
      ${"i"}
      ${"em"}
    `("[$#] should process <$htmlElement>", ({ htmlElement }: { htmlElement: string }) => {
      const text = "lorem";
      const fromDataView = `<${htmlElement}>${text}</${htmlElement}>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(`<span style="font-style: italic;">${text}</span>`);
    });

    it.each`
      htmlElement
      ${"ins"}
      ${"u"}
    `("[$#] should process <$htmlElement>", ({ htmlElement }: { htmlElement: string }) => {
      const text = "lorem";
      const fromDataView = `<${htmlElement}>${text}</${htmlElement}>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(`<span style="text-decoration: underline;">${text}</span>`);
    });

    it.each`
      htmlElement
      ${"del"}
      ${"s"}
    `("[$#] should process <$htmlElement>", ({ htmlElement }: { htmlElement: string }) => {
      const text = "lorem";
      const fromDataView = `<${htmlElement}>${text}</${htmlElement}>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(`<span style="text-decoration: line-through;">${text}</span>`);
    });

    it("should process link", () => {
      const fromDataView = `<a href="https://example.org/">lorem</a>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(fromDataView);
    });

    it("should process blockquote", () => {
      const text = "lorem";
      const fromDataView = `<blockquote><p>${text}</p></blockquote>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(fromDataView);
    });

    it("should process pre", () => {
      const text = "lorem";
      const fromDataView = `<pre>${text}</pre>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(fromDataView);
    });

    it("should process unordered list", () => {
      const text = "lorem";
      const fromDataView = `<ul><li>${text}</li></ul>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(fromDataView);
    });

    it("should process ordered list", () => {
      const text = "lorem";
      const fromDataView = `<ol><li>${text}</li></ol>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(fromDataView);
    });

    it("should process minimal table", () => {
      const text = "lorem";
      const fromDataView = `<table><tr><td>${text}</td></tr></table>`;
      const bbCodeFromDataView = aut.html2bbcode(fromDataView);
      const htmlFromData = aut.bbcode2html(bbCodeFromDataView);
      expect(htmlFromData).toEqual(fromDataView);
    });
  });

  describe("Less important: BBCode →[toView]→ HTML →[toData]→ BBCode", () => {
    it.each`
      bbCode
      ${""}
      ${"[b]lorem[/b]"}
      ${"[i]lorem[/i]"}
      ${"[u]lorem[/u]"}
      ${"[s]lorem[/s]"}
      ${"[url=https://example.org/]lorem[/url]"}
      ${"[quote]lorem[/quote]"}
      ${"[code]lorem[/code]"}
      ${"[list][*]lorem[/list]"}
      ${"[list=1][*]lorem[/list]"}
      ${"[list=a][*]lorem[/list]"}
      ${"[list=I][*]lorem[/list]"}
      ${"[table][tr][td]lorem[/td][/tr][/table]"}
      ${"[table][thead][tr][th]HEAD[/th][/tr][/thead][tbody][tr][td]BODY[/td][/tr][/tbody][/table]"}
      ${"[h1]lorem[/h1]"}
      ${"[h2]lorem[/h2]"}
      ${"[h3]lorem[/h3]"}
      ${"[h4]lorem[/h4]"}
      ${"[h5]lorem[/h5]"}
      ${"[h6]lorem[/h6]"}
    `("[$#] should process back and forth without (relevant) change: $bbCode", ({ bbCode }: { bbCode: string }) => {
      const result = aut.bbcode2html2bbcode(bbCode);
      try {
        expect(result).toHaveProperty("fromHtml2BBCode", bbCode);
      } catch (e) {
        if (e instanceof Error) {
          e.message = `${e.message}\n\nDebugging details:\n${JSON.stringify(result, undefined, 2)}`;
        }
        throw e;
      }
    });

    /**
     * We rate these deviations "acceptable" for now. To change, we may need,
     * for example, provide a custom preset for bbcode2html.
     */
    it.each`
      bbCode                             | expected                  | comment
      ${"[code=javascript]lorem[/code]"} | ${"[code]lorem[/code]"}   | ${"HTML 5 Preset does not handle language attribute."}
      ${"[quote=author]lorem[/code]"}    | ${"[quote]lorem[/quote]"} | ${"We have no mapping for author to HTML."}
    `(
      "[$#] should process back and forth with only minor change: $bbCode → $expected ($comment)",
      ({ bbCode, expected }: { bbCode: string; expected: string }) => {
        const result = aut.bbcode2html2bbcode(bbCode);
        try {
          expect(result).toHaveProperty("fromHtml2BBCode", expected);
        } catch (e) {
          if (e instanceof Error) {
            e.message = `${e.message}\n\nDebugging details:\n${JSON.stringify(result, undefined, 2)}`;
          }
          throw e;
        }
      },
    );
  });
});
