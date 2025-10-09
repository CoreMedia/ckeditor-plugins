/// <reference lib="dom" />

import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { bbCodeDefaultRules } from "../src/rules/bbCodeDefaultRules";
import { html2bbcode } from "../src/html2bbcode";
import { bbcode2html } from "../src/bbcode2html";
import { parseAsFragment } from "./DOMUtils";

const rules = bbCodeDefaultRules;
const supportedTags = rules.flatMap((r) => r.tags ?? ([] as string[]));

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
    const fromHtml2BBCode = html2bbcode(parseAsFragment(fromBBCode2Html), rules);
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
    const fromHtml2BBCode = html2bbcode(parseAsFragment(input), rules);
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
void describe("BBob Integration", () => {
  /**
   * These use-cases are important, as they validate, that our proprietary
   * HTML to BBCode mapping is understood by the third-party library when
   * processing the data back to HTML.
   */
  describe('Important: HTML →[toData]→ BBCode →[toView]→ HTML"', () => {
    const cases = [
      {
        dataViewInput: ``,
        expectedStoredData: ``,
        expectedRestoredDataView: ``,
        comment: `empty data`,
      },
      {
        dataViewInput: `<strong>TEXT</strong>`,
        expectedStoredData: `[b]TEXT[/b]`,
        expectedRestoredDataView: `<span style="font-weight: bold;">TEXT</span>`,
        comment: `font-weight well understood by CKEditor`,
      },
      {
        dataViewInput: `<b>TEXT</b>`,
        expectedStoredData: `[b]TEXT[/b]`,
        expectedRestoredDataView: `<span style="font-weight: bold;">TEXT</span>`,
        comment: `font-weight well understood by CKEditor`,
      },
      {
        dataViewInput: `<em>TEXT</em>`,
        expectedStoredData: `[i]TEXT[/i]`,
        expectedRestoredDataView: `<span style="font-style: italic;">TEXT</span>`,
        comment: `font-style well understood by CKEditor`,
      },
      {
        dataViewInput: `<i>TEXT</i>`,
        expectedStoredData: `[i]TEXT[/i]`,
        expectedRestoredDataView: `<span style="font-style: italic;">TEXT</span>`,
        comment: `font-style well understood by CKEditor`,
      },
      {
        dataViewInput: `<ins>TEXT</ins>`,
        expectedStoredData: `[u]TEXT[/u]`,
        expectedRestoredDataView: `<span style="text-decoration: underline;">TEXT</span>`,
        comment: `text-decoration well understood by CKEditor`,
      },
      {
        dataViewInput: `<u>TEXT</u>`,
        expectedStoredData: `[u]TEXT[/u]`,
        expectedRestoredDataView: `<span style="text-decoration: underline;">TEXT</span>`,
        comment: `text-decoration well understood by CKEditor`,
      },
      {
        dataViewInput: `<del>TEXT</del>`,
        expectedStoredData: `[s]TEXT[/s]`,
        expectedRestoredDataView: `<span style="text-decoration: line-through;">TEXT</span>`,
        comment: `text-decoration well understood by CKEditor`,
      },
      {
        dataViewInput: `<s>TEXT</s>`,
        expectedStoredData: `[s]TEXT[/s]`,
        expectedRestoredDataView: `<span style="text-decoration: line-through;">TEXT</span>`,
        comment: `text-decoration well understood by CKEditor`,
      },
      {
        dataViewInput: `<span class="text-tiny">TEXT</span>`,
        expectedStoredData: `[size=70]TEXT[/size]`,
        expectedRestoredDataView: `<span class="text-tiny">TEXT</span>`,
        comment: `none`,
      },
      {
        dataViewInput: `<span class="text-small">TEXT</span>`,
        expectedStoredData: `[size=85]TEXT[/size]`,
        expectedRestoredDataView: `<span class="text-small">TEXT</span>`,
        comment: `none`,
      },
      {
        dataViewInput: `<span class="text-big">TEXT</span>`,
        expectedStoredData: `[size=140]TEXT[/size]`,
        expectedRestoredDataView: `<span class="text-big">TEXT</span>`,
        comment: `none`,
      },
      {
        dataViewInput: `<span class="text-huge">TEXT</span>`,
        expectedStoredData: `[size=180]TEXT[/size]`,
        expectedRestoredDataView: `<span class="text-huge">TEXT</span>`,
        comment: `none`,
      },
      {
        dataViewInput: `<a href="${link}">TEXT</a>`,
        expectedStoredData: `[url="${link}"]TEXT[/url]`,
        expectedRestoredDataView: `<a href="${link}">TEXT</a>`,
        comment: `normal link`,
      },
      {
        dataViewInput: `<a href="${link}">${link}</a>`,
        expectedStoredData: `[url]${link}[/url]`,
        expectedRestoredDataView: `<a href="${link}">${link}</a>`,
        comment: `pretty-print: shorten, if possible, in BBCode`,
      },
      {
        dataViewInput: `<a>TEXT</a>`,
        expectedStoredData: `TEXT`,
        expectedRestoredDataView: `TEXT`,
        comment: `there is no representation in BBCode for an anchor without href attribute`,
      },
      {
        dataViewInput: `<blockquote><p>TEXT</p></blockquote>`,
        expectedStoredData: `[quote]\nTEXT\n[/quote]`,
        expectedRestoredDataView: `<blockquote><p>\nTEXT</p></blockquote>`,
        comment: `newlines part of minimal pretty-print behavior`,
      },
      {
        dataViewInput: `<pre><code class="language-plaintext">TEXT</code></pre>`,
        expectedStoredData: `[code]\nTEXT\n[/code]`,
        expectedRestoredDataView: `<pre><code class="language-plaintext">TEXT</code></pre>`,
        comment: `adapted to nested pre, code to work in CKEditor 5`,
      },
      {
        dataViewInput: `<pre><code class="language-css">TEXT</code></pre>`,
        expectedStoredData: `[code=css]\nTEXT\n[/code]`,
        expectedRestoredDataView: `<pre><code class="language-css">TEXT</code></pre>`,
        comment: `adapted to nested pre, code to work in CKEditor 5`,
      },
      {
        dataViewInput: `<ul><li>TEXT</li></ul>`,
        expectedStoredData: `[list]\n[*] TEXT\n[/list]`,
        expectedRestoredDataView: `<ul>\n<li> TEXT\n</li></ul>`,
        comment: `newlines part of minimal pretty-print behavior`,
      },
      {
        dataViewInput: `<ol><li>TEXT</li></ol>`,
        expectedStoredData: `[list=1]\n[*] TEXT\n[/list]`,
        expectedRestoredDataView: `<ol type="1">\n<li> TEXT\n</li></ol>`,
        comment: `CKEditor defaults to _no-type_, but BBob defaults to add it`,
      },
      {
        dataViewInput: `<ol type="a"><li>TEXT</li></ol>`,
        expectedStoredData: `[list=a]\n[*] TEXT\n[/list]`,
        expectedRestoredDataView: `<ol type="a">\n<li> TEXT\n</li></ol>`,
        comment: `CKEditor may ignore type, if not configured to support this`,
      },
      {
        dataViewInput: `<h1>TEXT</h1>`,
        expectedStoredData: `[h1]TEXT[/h1]`,
        expectedRestoredDataView: `<h1>TEXT</h1>`,
        comment: `none`,
      },
      {
        dataViewInput: `<h2>TEXT</h2>`,
        expectedStoredData: `[h2]TEXT[/h2]`,
        expectedRestoredDataView: `<h2>TEXT</h2>`,
        comment: `none`,
      },
      {
        dataViewInput: `<h3>TEXT</h3>`,
        expectedStoredData: `[h3]TEXT[/h3]`,
        expectedRestoredDataView: `<h3>TEXT</h3>`,
        comment: `none`,
      },
      {
        dataViewInput: `<h4>TEXT</h4>`,
        expectedStoredData: `[h4]TEXT[/h4]`,
        expectedRestoredDataView: `<h4>TEXT</h4>`,
        comment: `none`,
      },
      {
        dataViewInput: `<h5>TEXT</h5>`,
        expectedStoredData: `[h5]TEXT[/h5]`,
        expectedRestoredDataView: `<h5>TEXT</h5>`,
        comment: `none`,
      },
      {
        dataViewInput: `<h6>TEXT</h6>`,
        expectedStoredData: `[h6]TEXT[/h6]`,
        expectedRestoredDataView: `<h6>TEXT</h6>`,
        comment: `none`,
      },
      {
        dataViewInput: `<p>TEXT1</p><p>TEXT2</p>`,
        expectedStoredData: `TEXT1\n\nTEXT2`,
        expectedRestoredDataView: `<p>TEXT1</p><p>TEXT2</p>`,
        comment: `none`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataViewInput, expectedStoredData, expectedRestoredDataView, comment }] of cases.entries()) {
        await t.test(
          `[${i}] Should transform data view to data, that are well understood by subsequent 'toView' mapping for: ${dataViewInput} (${comment})`,
          () => {
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
      }
    });
  });

  /**
   * These use-cases are less important, as they (only) validate, that our
   * proprietary HTML to BBCode mapping produces the same result as the BBCode
   * we originally parsed. This, though, may be subject to change, like, for
   * example, if we decide to introduce "more pretty printing" to the resulting
   * HTML to BBCode processing (like indents for lists). In these cases, it is
   * expected, that we have to adapt our data.
   *
   * The focus of this test is more to check, that our created data are
   * invariant: If we had newlines, if we had indents before, no additional
   * newlines or blanks should be added on repeated iterations. Example: A
   * naive mapping of `[code]` → `<pre>` `[code]` might just always add newlines
   * to the inner block, resulting in newlines piling up on each iteration,
   * with results such as: `[code]\n\n\n\nlorem\n\n\n\n[/code]` eventually.
   */
  void describe("Less important: BBCode →[toView]→ HTML →[toData]→ BBCode", () => {
    const cases = [
      { bbCode: `` },
      { bbCode: `[b]lorem[/b]` },
      { bbCode: `[i]lorem[/i]` },
      { bbCode: `[u]lorem[/u]` },
      { bbCode: `[s]lorem[/s]` },
      { bbCode: `[url="https://example.org/"]lorem[/url]` },
      { bbCode: `[quote]\nlorem\n[/quote]` },
      { bbCode: `[code]\nlorem\n[/code]` },
      { bbCode: `[list]\n[*] lorem\n[/list]` },
      { bbCode: `[list=1]\n[*] lorem\n[/list]` },
      { bbCode: `[list=a]\n[*] lorem\n[/list]` },
      { bbCode: `[list=I]\n[*] lorem\n[/list]` },
      { bbCode: `[h1]lorem[/h1]` },
      { bbCode: `[h2]lorem[/h2]` },
      { bbCode: `[h3]lorem[/h3]` },
      { bbCode: `[h4]lorem[/h4]` },
      { bbCode: `[h5]lorem[/h5]` },
      { bbCode: `[h6]lorem[/h6]` },
      { bbCode: `[size=70]lorem[/size]` },
      { bbCode: `[size=85]lorem[/size]` },
      { bbCode: `[size=140]lorem[/size]` },
      { bbCode: `[size=180]lorem[/size]` },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { bbCode }] of cases.entries()) {
        await t.test(`[${i}] Should process back and forth without change: ${bbCode}`, () => {
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
      }
    });

    const backAndForthCases = [
      {
        bbCode: "[quote=author]lorem[/quote]",
        expected: "[quote]\nlorem\n[/quote]",
        comment: "We have no mapping for author to HTML.",
      },
    ] as const;

    /**
     * We rate these deviations "acceptable" for now. To change, we may need,
     * for example, to provide a custom preset for bbcode2html.
     */
    void test("cases", async (t: TestContext) => {
      for (const [i, { bbCode, expected, comment }] of backAndForthCases.entries()) {
        await t.test(
          `[${i}] Should process back and forth with only minor change: ${bbCode} → ${expected} (${comment})`,
          () => {
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
      }
    });
  });
});
