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
   * Artificial test for consuming result of BBCode to HTML processing from
   * the third-party library directly by our proprietary HTML to BBCode
   * processing.
   *
   * This case will not happen in production, where the CKEditor layers
   * serve as _mediators_ between these two. Nevertheless, testing that
   * they _understand_ each other provides some confidence that nothing
   * broke.
   *
   * @param input - BBCode input (from Data)
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
  /**
   * Transformation pipeline to validate, that the BBCode2HTML processing
   * understands the BBCode produced by our proprietary HTML to BBCode
   * processing.
   *
   * @param input - HTML input (from Data View)
   */
  html2bbcode2html: (
    input: string,
  ): {
    input: string;
    fromHtml2BBCode: string;
    fromBBCode2Html: string;
  } => {
    const fromHtml2BBCode = html2bbcode(asFragment(input), rules);
    const fromBBCode2Html = bbcode2html(fromHtml2BBCode, supportedTags);
    return {
      input,
      fromBBCode2Html,
      fromHtml2BBCode,
    };
  },
};

const link = "https://example.org/";

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
  /**
   * These use-cases are important, as they validate, that our proprietary
   * HTML to BBCode mapping is understood by the third-party library when
   * processing the data back to HTML.
   */
  describe("Important: HTML →[toData]→ BBCode →[toView]→ HTML", () => {
    it.each`
      dataViewInput                                                | expectedStoredData                                 | expectedRestoredDataView                                      | comment
      ${""}                                                        | ${""}                                              | ${""}                                                         | ${"empty data"}
      ${`<strong>TEXT</strong>`}                                   | ${`[b]TEXT[/b]`}                                   | ${`<span style="font-weight: bold;">TEXT</span>`}             | ${"font-weight well understood by CKEditor"}
      ${`<b>TEXT</b>`}                                             | ${`[b]TEXT[/b]`}                                   | ${`<span style="font-weight: bold;">TEXT</span>`}             | ${"font-weight well understood by CKEditor"}
      ${`<em>TEXT</em>`}                                           | ${`[i]TEXT[/i]`}                                   | ${`<span style="font-style: italic;">TEXT</span>`}            | ${"font-style well understood by CKEditor"}
      ${`<i>TEXT</i>`}                                             | ${`[i]TEXT[/i]`}                                   | ${`<span style="font-style: italic;">TEXT</span>`}            | ${"font-style well understood by CKEditor"}
      ${`<ins>TEXT</ins>`}                                         | ${`[u]TEXT[/u]`}                                   | ${`<span style="text-decoration: underline;">TEXT</span>`}    | ${"text-decoration well understood by CKEditor"}
      ${`<u>TEXT</u>`}                                             | ${`[u]TEXT[/u]`}                                   | ${`<span style="text-decoration: underline;">TEXT</span>`}    | ${"text-decoration well understood by CKEditor"}
      ${`<del>TEXT</del>`}                                         | ${`[s]TEXT[/s]`}                                   | ${`<span style="text-decoration: line-through;">TEXT</span>`} | ${"text-decoration well understood by CKEditor"}
      ${`<s>TEXT</s>`}                                             | ${`[s]TEXT[/s]`}                                   | ${`<span style="text-decoration: line-through;">TEXT</span>`} | ${"text-decoration well understood by CKEditor"}
      ${`<a href="${link}">TEXT</a>`}                              | ${`[url=${link}]TEXT[/url]`}                       | ${`<a href="${link}">TEXT</a>`}                               | ${"normal link"}
      ${`<a href="${link}">${link}</a>`}                           | ${`[url]${link}[/url]`}                            | ${`<a href="${link}">${link}</a>`}                            | ${"pretty-print: shorten, if possible, in BBCode"}
      ${`<blockquote><p>TEXT</p></blockquote>`}                    | ${`[quote]\nTEXT\n[/quote]`}                       | ${`<blockquote><p>\nTEXT\n</p></blockquote>`}                 | ${"newlines part of minimal pretty-print behavior"}
      ${`<pre><code class="language-plaintext">TEXT</code></pre>`} | ${`[code]\nTEXT\n[/code]`}                         | ${`<pre><code class="language-plaintext">TEXT</code></pre>`}  | ${"adapted to nested pre, code to work in CKEditor 5"}
      ${`<pre><code class="language-css">TEXT</code></pre>`}       | ${`[code=css]\nTEXT\n[/code]`}                     | ${`<pre><code class="language-css">TEXT</code></pre>`}        | ${"adapted to nested pre, code to work in CKEditor 5"}
      ${`<ul><li>TEXT</li></ul>`}                                  | ${`[list]\n[*] TEXT\n[/list]`}                     | ${`<ul>\n<li> TEXT\n</li></ul>`}                              | ${"newlines part of minimal pretty-print behavior"}
      ${`<ol><li>TEXT</li></ol>`}                                  | ${`[list=1]\n[*] TEXT\n[/list]`}                   | ${`<ol type="1">\n<li> TEXT\n</li></ol>`}                     | ${"CKEditor defaults to _no-type_, but BBob defaults to add it"}
      ${`<ol type="a"><li>TEXT</li></ol>`}                         | ${`[list=a]\n[*] TEXT\n[/list]`}                   | ${`<ol type="a">\n<li> TEXT\n</li></ol>`}                     | ${"CKEditor may ignore type, if not configured to support this"}
      ${`<table><tr><td>TEXT</td></tr></table>`}                   | ${`[table]\n[tr]\n[td]TEXT[/td]\n[/tr]\n[/table]`} | ${`<table>\n<tr>\n<td>TEXT</td>\n</tr>\n</table>`}            | ${"newlines part of minimal pretty-print behavior"}
      ${`<h1>TEXT</h1>`}                                           | ${`[h1]TEXT[/h1]`}                                 | ${`<h1>TEXT</h1>`}                                            | ${"none"}
      ${`<h2>TEXT</h2>`}                                           | ${`[h2]TEXT[/h2]`}                                 | ${`<h2>TEXT</h2>`}                                            | ${"none"}
      ${`<h3>TEXT</h3>`}                                           | ${`[h3]TEXT[/h3]`}                                 | ${`<h3>TEXT</h3>`}                                            | ${"none"}
      ${`<h4>TEXT</h4>`}                                           | ${`[h4]TEXT[/h4]`}                                 | ${`<h4>TEXT</h4>`}                                            | ${"none"}
      ${`<h5>TEXT</h5>`}                                           | ${`[h5]TEXT[/h5]`}                                 | ${`<h5>TEXT</h5>`}                                            | ${"none"}
      ${`<h6>TEXT</h6>`}                                           | ${`[h6]TEXT[/h6]`}                                 | ${`<h6>TEXT</h6>`}                                            | ${"none"}
      ${`<p>TEXT1</p><p>TEXT2</p>`}                                | ${`TEXT1\n\nTEXT2`}                                | ${`<p>TEXT1</p><p>TEXT2</p>`}                                 | ${"none"}
    `(
      "[$#] Should transform data view to data, that are well understood by subsequent `toView` mapping for: `$dataViewInput` ($comment)",
      ({
        dataViewInput,
        expectedStoredData,
        expectedRestoredDataView,
      }: {
        dataViewInput: string;
        expectedStoredData: string;
        expectedRestoredDataView: string;
      }) => {
        const result = aut.html2bbcode2html(dataViewInput);
        try {
          // Precondition check: This is not THAT relevant, as the primary
          // requirement is expressed in subsequent expectation: The stored data
          // should be well understood when transforming them back to data view.
          // In other words: If this fails, it may be ok, just to adjust the
          // expectation.
          expect(result).toHaveProperty("fromHtml2BBCode", expectedStoredData);
          // When first written back in 2023, we used the default preset for
          // HTML 5 for BBob library. This, for example, preferred style
          // attributes for bold over corresponding tags. This is ok, as
          // CKEditor's parsing from data view to model also accepts this
          // to denote a bold style. It may be ok to adapt this expectation
          // if the resulting HTML again is proven to be well-understood by
          // CKEditor's processing.
          expect(result).toHaveProperty("fromBBCode2Html", expectedRestoredDataView);
        } catch (e) {
          if (e instanceof Error) {
            e.message = `${e.message}\n\nDebugging details:\n${JSON.stringify(result, undefined, 2)}`;
          }
          throw e;
        }
      },
    );
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
      ${"[quote]\nlorem\n[/quote]"}
      ${"[code]\nlorem\n[/code]"}
      ${"[list]\n[*] lorem\n[/list]"}
      ${"[list=1]\n[*] lorem\n[/list]"}
      ${"[list=a]\n[*] lorem\n[/list]"}
      ${"[list=I]\n[*] lorem\n[/list]"}
      ${"[table]\n[tr]\n[td]lorem[/td]\n[/tr]\n[/table]"}
      ${"[table]\n[thead]\n[tr]\n[th]HEAD[/th]\n[/tr]\n[/thead]\n[tbody]\n[tr]\n[td]BODY[/td]\n[/tr]\n[/tbody]\n[/table]"}
      ${"[h1]lorem[/h1]"}
      ${"[h2]lorem[/h2]"}
      ${"[h3]lorem[/h3]"}
      ${"[h4]lorem[/h4]"}
      ${"[h5]lorem[/h5]"}
      ${"[h6]lorem[/h6]"}
    `("[$#] should process back and forth without change: $bbCode", ({ bbCode }: { bbCode: string }) => {
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
     * for example, to provide a custom preset for bbcode2html.
     */
    it.each`
      bbCode                           | expected                      | comment
      ${"[quote=author]lorem[/quote]"} | ${"[quote]\nlorem\n[/quote]"} | ${"We have no mapping for author to HTML."}
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
