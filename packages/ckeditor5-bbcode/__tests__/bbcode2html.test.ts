// noinspection HtmlUnknownTarget,SpellCheckingInspection,HtmlRequiredAltAttribute
import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { bbCodeDefaultRules } from "../src";
import { bbcode2html, processBBCode } from "../src/bbcode2html";
import { CoreTree } from "@bbob/core/es";

const supportedTags = bbCodeDefaultRules.flatMap((r) => r.tags ?? ([] as string[]));

const aut = {
  expectTransformation: (
    { data, expectedDataView }: { data: string; expectedDataView: string },
    expectedErrors = 0,
  ): void => {
    const originalConsoleError = console.error;
    const errorCache: unknown[][] = [];
    const silencedHandler: typeof console.error = (...data: unknown[]): void => {
      errorCache.push(data);
    };

    let actual: string;

    try {
      console.error = silencedHandler;
      actual = bbcode2html(data, supportedTags);
    } finally {
      console.error = originalConsoleError;
    }

    expect(errorCache).toHaveLength(expectedErrors);

    try {
      expect(actual).toBe(expectedDataView);
    } catch (e) {
      console.debug("Failed expectations.", {
        data,
        actual,
        expectedDataView,
      });
      throw e;
    }
  },
  process: (data: string): ReturnType<typeof processBBCode> => processBBCode(data, supportedTags),
};

/**
 * These are high-level integration tests based on core processing by BBob.
 * It uses all defaults typically applied for BBCode to HTML mapping when
 * using the CKEditor 5 BBCode plugin.
 *
 * Note that all of these tests are also an implicit test of the BBob library,
 * so that changed behaviors may also be triggered by BBob update. On failed
 * tests a possible option is just to adjust the expectations.
 */
describe("bbcode2html", () => {
  describe("Standard Tag Processing", () => {
    describe("Supported Inline Tags", () => {
      const cases = [
        {
          data: `[b]T[/b]`,
          expectedDataView: `<span style="font-weight: bold;">T</span>`,
        },
        {
          data: `[color=red]T[/color]`,
          expectedDataView: `<span style="color: red;">T</span>`,
        },
        {
          data: `[size=85]T[/size]`,
          expectedDataView: `<span class="text-small">T</span>`,
        },
        {
          data: `[i]T[/i]`,
          expectedDataView: `<span style="font-style: italic;">T</span>`,
        },
        {
          data: `[s]T[/s]`,
          expectedDataView: `<span style="text-decoration: line-through;">T</span>`,
        },
        {
          data: `[u]T[/u]`,
          expectedDataView: `<span style="text-decoration: underline;">T</span>`,
        },
        {
          data: `[url=https://example.org/]T[/url]`,
          expectedDataView: `<a href="https://example.org/">T</a>`,
        },
        {
          data: `[url]https://example.org/[/url]`,
          expectedDataView: `<a href="https://example.org/">https://example.org/</a>`,
        },
        {
          data: `[url=/relative]T[/url]`,
          expectedDataView: `<a href="/relative">T</a>`,
        },
        {
          data: `[url]/relative[/url]`,
          expectedDataView: `<a href="/relative">/relative</a>`,
        },
        {
          data: `[url=https://example.org/?one=1&two=2]T[/url]`,
          expectedDataView: `<a href="https://example.org/?one=1&amp;two=2">T</a>`,
        },
        {
          data: `[url]https://example.org/?one=1&two=2[/url]`,
          expectedDataView: `<a href="https://example.org/?one=1&amp;two=2">https://example.org/?one=1&amp;two=2</a>`,
        },
        {
          data: `[url]https://example.org/?[b]predicate=x%3D42[/b]#_top[/url]`,
          expectedDataView: `<a href="https://example.org/?predicate=x%3D42#_top">https://example.org/?<span style="font-weight: bold;">predicate=x%3D42</span>#_top</a>`,
        },
        {
          data: `[img]https://example.org/1.png[/img]`,
          expectedDataView: `<img src="https://example.org/1.png">`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView}`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });

    describe("Supported Block Tags", () => {
      const cases = [
        {
          data: `[code]T[/code]`,
          expectedDataView: `<pre><code class="language-plaintext">T</code></pre>`,
        },
        {
          data: `[h1]T[/h1]`,
          expectedDataView: `<h1>T</h1>`,
        },
        {
          data: `[h2]T[/h2]`,
          expectedDataView: `<h2>T</h2>`,
        },
        {
          data: `[h3]T[/h3]`,
          expectedDataView: `<h3>T</h3>`,
        },
        {
          data: `[h4]T[/h4]`,
          expectedDataView: `<h4>T</h4>`,
        },
        {
          data: `[h5]T[/h5]`,
          expectedDataView: `<h5>T</h5>`,
        },
        {
          data: `[h6]T[/h6]`,
          expectedDataView: `<h6>T</h6>`,
        },
        {
          data: `[list][*] T[/list]`,
          expectedDataView: `<ul><li> T</li></ul>`,
        },
        {
          data: `[quote]T[/quote]`,
          expectedDataView: `<blockquote><p>T</p></blockquote>`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView}`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });

    describe("Escaping", () => {
      const cases = [
        {
          data: `\\[b\\]not bold\\[/b\\]`,
          expectedDataView: `[b]not bold[/b]`,
          comment: `"normal" escape, but design-scope (as it is configurable for BBob)`,
        },
        {
          data: `\\[i\\]not italic\\[/i\\]`,
          expectedDataView: `[i]not italic[/i]`,
          comment: `"normal" escape, but design-scope (as it is configurable for BBob)`,
        },
        {
          data: `keep\\irrelevant\\escape`,
          expectedDataView: `keep\\irrelevant\\escape`,
          comment: `accepting BBob behavior: If irrelevant, BBob ignore an escape character.`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });
  });

  describe("By Tag", () => {
    // Some standard behaviors bundled.
    describe.each`
      tag          | openTag                   | closeTag      | openElement                                        | closeElement
      ${`[b]`}     | ${`[b]`}                  | ${`[/b]`}     | ${`<span style="font-weight: bold;">`}             | ${`</span>`}
      ${`[color]`} | ${`[color=red]`}          | ${`[/color]`} | ${`<span style="color: red;">`}                    | ${`</span>`}
      ${`[size]`}  | ${`[size=85]`}            | ${`[/size]`}  | ${`<span class="text-small">`}                     | ${`</span>`}
      ${`[h1]`}    | ${`[h1]`}                 | ${`[/h1]`}    | ${`<h1>`}                                          | ${`</h1>`}
      ${`[h2]`}    | ${`[h2]`}                 | ${`[/h2]`}    | ${`<h2>`}                                          | ${`</h2>`}
      ${`[h3]`}    | ${`[h3]`}                 | ${`[/h3]`}    | ${`<h3>`}                                          | ${`</h3>`}
      ${`[h4]`}    | ${`[h4]`}                 | ${`[/h4]`}    | ${`<h4>`}                                          | ${`</h4>`}
      ${`[h5]`}    | ${`[h5]`}                 | ${`[/h5]`}    | ${`<h5>`}                                          | ${`</h5>`}
      ${`[h6]`}    | ${`[h6]`}                 | ${`[/h6]`}    | ${`<h6>`}                                          | ${`</h6>`}
      ${`[i]`}     | ${`[i]`}                  | ${`[/i]`}     | ${`<span style="font-style: italic;">`}            | ${`</span>`}
      ${`[s]`}     | ${`[s]`}                  | ${`[/s]`}     | ${`<span style="text-decoration: line-through;">`} | ${`</span>`}
      ${`[u]`}     | ${`[u]`}                  | ${`[/u]`}     | ${`<span style="text-decoration: underline;">`}    | ${`</span>`}
      ${`[url]`}   | ${`[url=https://e.org/]`} | ${`[/url]`}   | ${`<a href="https://e.org/">`}                     | ${`</a>`}
    `(
      "$tag (Standard Behaviors)",
      ({
        openTag,
        closeTag,
        openElement,
        closeElement,
      }: {
        openTag: string;
        closeTag: string;
        openElement: string;
        closeElement: string;
      }) => {
        const cases = [
          {
            data: `${openTag}T${closeTag}`,
            expectedDataView: `${openElement}T${closeElement}`,
            comment: `default`,
          },
          {
            data: `${openTag} T${closeTag}`,
            expectedDataView: `${openElement} T${closeElement}`,
            comment: `keep leading blanks`,
          },
          {
            data: `${openTag}T ${closeTag}`,
            expectedDataView: `${openElement}T ${closeElement}`,
            comment: `keep trailing blanks`,
          },
          {
            data: `${openTag}\nT${closeTag}`,
            expectedDataView: `${openElement}\nT${closeElement}`,
            comment: `keep leading single newlines`,
          },
          {
            data: `${openTag}T\n${closeTag}`,
            expectedDataView: `${openElement}T\n${closeElement}`,
            comment: `keep trailing single newlines`,
          },
          {
            data: `${openTag}T1\n\nT2${closeTag}`,
            expectedDataView: `${openElement}T1\n\nT2${closeElement}`,
            comment: `do not introduce a paragraph within element`,
          },
        ] as const;

        test("cases", async (t: TestContext) => {
          for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
            await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
              aut.expectTransformation({ data, expectedDataView });
            });
          }
        });
      },
    );

    describe("[code]", () => {
      const cases = [
        {
          data: `[code]T[/code]`,
          expectedDataView: `<pre><code class="language-plaintext">T</code></pre>`,
          comment: `Default to "plaintext" language`,
        },
        {
          data: `[code=css]T[/code]`,
          expectedDataView: `<pre><code class="language-css">T</code></pre>`,
          comment: `Accept language attribute`,
        },
        {
          data: `[code=html]<i>T</i>[/code]`,
          expectedDataView: `<pre><code class="language-html">&lt;i&gt;T&lt;/i&gt;</code></pre>`,
          comment: `Properly encode nested HTML`,
        },
        {
          data: `[code=bbcode]\\[i\\]T\\[/i\\][/code]`,
          expectedDataView: `<pre><code class="language-bbcode">[i]T[/i]</code></pre>`,
          comment: `Strip escapes`,
        },
        {
          data: `[code=bbcode]\\[code=text\\]T\\[/code\\][/code]`,
          expectedDataView: `<pre><code class="language-bbcode">[code=text]T[/code]</code></pre>`,
          comment: `Strip escapes`,
        },
        {
          data: `[code=bbcode]\\[code=bbcode\\]T\\[/code\\][/code]`,
          expectedDataView: `<pre><code class="language-bbcode">[code=bbcode]T[/code]</code></pre>`,
          comment: `Strip escapes`,
        },
        {
          data: `[code=bbcode]\n\\[code=bbcode\\]\nT\n\\[/code\\]\n[/code]`,
          expectedDataView: `<pre><code class="language-bbcode">[code=bbcode]\nT\n[/code]</code></pre>`,
          comment: `Strip escapes and keep newlines`,
        },
        {
          data: `[code][i]T[/i][/code]`,
          expectedDataView: `<pre><code class="language-plaintext"><span style="font-style: italic;">T</span></code></pre>`,
          comment: `Accept and parse BBCode within "code" tag`,
        },
        {
          data: `[code][script]javascript:alert("X")[/script][/code]`,
          expectedDataView: `<pre><code class="language-plaintext">[script]javascript:alert("X")[/script]</code></pre>`,
          comment: `Do not transform, e.g., script-tag.`,
        },
        {
          data: `[code]T1\n\nT2[/code]`,
          expectedDataView: `<pre><code class="language-plaintext">T1\n\nT2</code></pre>`,
          comment: `Don't handle duplicate newlines as paragraphs.`,
        },
        {
          data: `[code]  T1\n  T2[/code]`,
          expectedDataView: `<pre><code class="language-plaintext">  T1\n  T2</code></pre>`,
          comment: `Keep space indents`,
        },
        {
          data: `[code]\tT1\n\tT2[/code]`,
          expectedDataView: `<pre><code class="language-plaintext">\tT1\n\tT2</code></pre>`,
          comment: `Keep tab indents`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });

    describe("[quote]", () => {
      const cases = [
        {
          data: `[quote]T[/quote]`,
          expectedDataView: `<blockquote><p>T</p></blockquote>`,
          comment: `minimal scenario`,
        },
        {
          data: `[quote=AUTHOR]T[/quote]`,
          expectedDataView: `<blockquote><p>T</p></blockquote>`,
          comment: `author information not supported`,
        },
        {
          data: `[quote]\nT\n[/quote]`,
          expectedDataView: `<blockquote><p>\nT</p></blockquote>`,
          comment: `strip obsolete trailing newlines`,
        },
        {
          data: `[quote]\nP1\n\nP2\n[/quote]`,
          expectedDataView: `<blockquote><p>\nP1</p><p>P2</p></blockquote>`,
          comment: `paragraphs support`,
        },
        {
          data: `[quote]\nP1\n[quote]\nP2\n[/quote]\nP3\n[/quote]`,
          expectedDataView: `<blockquote><p>\nP1</p><blockquote><p>\nP2</p></blockquote><p>\nP3</p></blockquote>`,
          comment: `nested quotes support`,
        },
        {
          data: `[quote]\n[quote]\nT\n[/quote]\n[/quote]`,
          expectedDataView: `<blockquote><blockquote><p>\nT</p></blockquote></blockquote>`,
          comment: `directly nested quotes support`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });

    describe("[img]", () => {
      const cases = [
        {
          data: `[img]https://example.org/1.png[/img]`,
          expectedDataView: `<img src="https://example.org/1.png">`,
          comment: `minimal scenario`,
        },
        {
          data: `[img alt="ALT"]https://example.org/1.png[/img]`,
          expectedDataView: `<img alt="ALT" src="https://example.org/1.png">`,
          comment: `alt text support; order of attributes irrelevant, but set expected as it is now`,
        },
        {
          data: `[img alt=""]https://example.org/1.png[/img]`,
          expectedDataView: `<img alt="" src="https://example.org/1.png">`,
          comment: `design-scope: may as well strip empty alt; kept for simplicity`,
        },
        {
          data: `[img alt=1-PNG]https://example.org/1.png[/img]`,
          expectedDataView: `<img alt="1-PNG" src="https://example.org/1.png">`,
          comment: `alt without quotes (must not use spaces)`,
        },
        {
          data: `A[img][/img]B`,
          expectedDataView: `A<img src="">B`,
          comment: `design-scope: May as well strip irrelevant img tag; kept for simplicity`,
        },
        {
          data: `A [img]https://example.org/1.png[/img] B`,
          expectedDataView: `A <img src="https://example.org/1.png"> B`,
          comment: `images are meant to be inline (all known BBCode interpreters seem to expect that)`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });
  });

  describe("Paragraphs", () => {
    const cases = [
      {
        data: `P1\n\nP2`,
        expectedDataView: `<p>P1</p><p>P2</p>`,
        comment: `Standard Paragraph Behavior (Only Text; LF)`,
      },
      {
        data: `P1\r\n\r\nP2`,
        expectedDataView: `<p>P1</p><p>P2</p>`,
        comment: `Standard Paragraph Behavior (Only Text; CRLF)`,
      },
      {
        data: `P1\r\rP2`,
        expectedDataView: `<p>P1</p><p>P2</p>`,
        comment: `Standard Paragraph Behavior (Only Text; CR)`,
      },
      {
        data: `[b]P1[/b]\n\n[i]P2[/i]`,
        expectedDataView: `<p><span style="font-weight: bold;">P1</span></p><p><span style="font-style: italic;">P2</span></p>`,
        comment: `Standard Paragraph Behavior (Text with inline formatting)`,
      },
      {
        data: ``,
        expectedDataView: ``,
        comment: `Do not create paragraphs on empty input`,
      },
      {
        data: `\n`,
        expectedDataView: `\n`,
        comment: `Do not create paragraphs on only single newline`,
      },
      {
        data: `\n\n`,
        expectedDataView: `\n`,
        comment: `Trim irrelevant newlines`,
      },
      {
        data: `\n\n\n`,
        expectedDataView: `\n`,
        comment: `Trim irrelevant newlines`,
      },
      {
        data: `\nP1\n\nP2`,
        expectedDataView: `<p>\nP1</p><p>P2</p>`,
        comment: `Design Scope: Keep irrelevant leading newlines; simplifies processing`,
      },
      {
        data: `P1\n\n\nP2`,
        expectedDataView: `<p>P1</p><p>P2</p>`,
        comment: `Trim obsolete newlines (trailing, 1)`,
      },
      {
        data: `P1\n\nP2\n`,
        expectedDataView: `<p>P1</p><p>P2</p>`,
        comment: `Trim obsolete newlines (trailing, 2)`,
      },
      {
        data: `[quote]P1\n\nP2[/quote]`,
        expectedDataView: `<blockquote><p>P1</p><p>P2</p></blockquote>`,
        comment: `Respect paragraphs in quote sections`,
      },
      {
        data: `P1\n\n[quote]P2[/quote]\n\nP3`,
        expectedDataView: `<p>P1</p><blockquote><p>P2</p></blockquote><p>P3</p>`,
        comment: `Do not put blockquotes into paragraphs`,
      },
      {
        data: `P1\n\n[code]P2[/code]\n\nP3`,
        expectedDataView: `<p>P1</p><pre><code class="language-plaintext">P2</code></pre><p>P3</p>`,
        comment: `Do not put code blocks into paragraphs`,
      },
      {
        data: `P1\n\n[h1]P2[/h1]\n\nP3`,
        expectedDataView: `<p>P1</p><h1>P2</h1><p>P3</p>`,
        comment: `Do not put headings into paragraphs`,
      },
      {
        data: `P1\n\n[list][*]P2[/list]\n\nP3`,
        expectedDataView: `<p>P1</p><ul><li>P2</li></ul><p>P3</p>`,
        comment: `Do not put lists into paragraphs`,
      },
    ] as const;

    test("cases", async (t: TestContext) => {
      for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
          aut.expectTransformation({ data, expectedDataView });
        });
      }
    });
  });

  describe("Tag Processing Challenges", () => {
    /**
     * We may meet unexpected formatting. This is handled (and tested) by
     * BBob. These tests are mainly meant as proof-of-concept to understand
     * the behavior of the BBob library.
     *
     * The count of expected errors is more an integration test towards BBob.
     * It is perfectly fine, if the expected error count needs to be adjusted
     * after BBob upgrade. Thus, the current number of expected errors only
     * represents the current behavior of BBob.
     */
    describe("Formatting Errors", () => {
      const cases = [
        {
          data: `[b]T`,
          expectedDataView: `<span style="font-weight: bold;"></span>T`,
          expectedErrors: 0,
          comment: `surprise: creates an empty element. CKEditor 5 would just remove it.`,
        },
        {
          data: `T[/b]`,
          expectedDataView: `T`,
          expectedErrors: 1,
          comment: `perfectly fine: Just ignore orphaned close-tag`,
        },
        {
          data: `[b]T[/i]`,
          expectedDataView: `<span style="font-weight: bold;"></span>T`,
          expectedErrors: 1,
          comment: `surprise: creates an empty element. CKEditor 5 would just remove it.`,
        },
        {
          data: `[b]A[i]B[/b]C[/i]`,
          expectedDataView: `<span style="font-weight: bold;">A<span style="font-style: italic;">B</span>C</span>`,
          expectedErrors: 0,
          comment: `surprise: only opening tag seems to control the hierarchy`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, expectedErrors, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView }, expectedErrors);
          });
        }
      });
    });

    describe("Attribute Challenges", () => {
      const cases = [
        {
          data: `[url=]T[/url]`,
          expectedDataView: `<a href="T">T</a>`,
          comment: "BBob: empty unique attribute handled as _not existing_",
        },
        {
          data: `[url=\nhttps://example.org/]T[/url]`,
          expectedDataView: `<a href="\nhttps://example.org/">T</a>`,
          comment: "BBob: ignores newlines within (unique) attributes",
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });
  });

  describe("Security", () => {
    describe("Raw HTML Injections", () => {
      const cases = [
        {
          data: `A <b>B</b>`,
          expectedDataView: `A &lt;b&gt;B&lt;/b&gt;`,
          comment: `Defaults to not supporting embedded HTML elements.`,
        },
        {
          data: `A&amp;B`,
          expectedDataView: `A&amp;amp;B`,
          comment: `Defaults to not supporting entities, but to escape them.`,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { data, expectedDataView, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data '${data}' to: ${expectedDataView} (${comment})`, () => {
            aut.expectTransformation({ data, expectedDataView });
          });
        }
      });
    });

    /**
     * Testing with some XSS payloads. Note, that the BBCode plugin just
     * ensures proper rendering of HTML, thus, prevents possible attack
     * vectors trying to trick a simple HTML rendering based on _search &amp;
     * replace_ as it is sometimes used for BBCode to HTML processing.
     *
     * It is up to the editing layer, to deal with any possible other
     * malicious attacks. Such as the CKEditor 5 link feature already does
     * for possible malicious `data:text/html;` links.
     *
     * @see https://github.com/JiLiZART/BBob/issues/201
     * @see https://swarm.ptsecurity.com/fuzzing-for-xss-via-nested-parsers-condition/
     */
    describe("XSS attacks", () => {
      // noinspection CssInvalidPropertyValue
      const cases = [
        {
          tainted: `[url=data:text/html;base64,PHNjcmlwdD5hbGVydCgiMSIpOzwvc2NyaXB0Pg==]sdfsdf[/url]`,
          expected: `<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgiMSIpOzwvc2NyaXB0Pg==">sdfsdf</a>`,
          comment: `source: https://security.snyk.io/vuln/SNYK-PYTHON-BBCODE-40502; CKEditor 5 will prohibit clicking on these.`,
        },
        {
          tainted: `[url]javascript:alert('XSS');[/url]`,
          expected: `<a href="javascript:alert('XSS');">javascript:alert('XSS');</a>`,
          comment: `source: https://github.com/dcwatson/bbcode/issues/4; Will be passed as is to CKEditor 5, which will take care not to make this clickable within the UI.`,
        },
        {
          tainted: `[url=javascript:alert('XSS');]TEXT[/url]`,
          expected: `<a href="javascript:alert('XSS');">TEXT</a>`,
          comment: `source: https://github.com/dcwatson/bbcode/issues/4; javascript:-link flavor but as attribute`,
        },
        {
          tainted: `[url]javascript:alert("XSS");[/url]`,
          expected: `<a href="javascript:alert(&quot;XSS&quot;);">javascript:alert("XSS");</a>`,
          comment: `source: https://github.com/dcwatson/bbcode/issues/4; javascript:-link flavor but with double-quotes`,
        },
        {
          tainted: `[url]123" onmouseover="alert('Hacked');[/url]`,
          expected: `<a href="123&quot; onmouseover=&quot;alert('Hacked');">123" onmouseover="alert('Hacked');</a>`,
          comment: `source: https://github.com/dcwatson/bbcode/issues/4`,
        },
        {
          tainted: `[url]https://google.com?[url] onmousemove=javascript:alert(String.fromCharCode(88,83,83));//[/url][/url]`,
          expected: `<a href="https://google.com? onmousemove=javascript:alert(String.fromCharCode(88,83,83));//">https://google.com?<a href=" onmousemove=javascript:alert(String.fromCharCode(88,83,83));//"> onmousemove=javascript:alert(String.fromCharCode(88,83,83));//</a></a>`,
          comment: `source: https://github.com/dcwatson/bbcode/issues/4; Slightly corrupted DOM, but attack did not pass through.`,
        },
        {
          tainted: `[color="onmouseover=alert(0) style="]dare to move your mouse here[/color]`,
          expected: '<span style="color: null;">dare to move your mouse here</span>',
          comment: ``,
        },
      ] as const;

      test("cases", async (t: TestContext) => {
        for (const [i, { tainted, expected, comment }] of cases.entries()) {
          await t.test(`[${i}] Should prevent XSS-attack for: ${tainted}, expected: ${expected} (${comment})`, () => {
            aut.expectTransformation({ data: tainted, expectedDataView: expected });
          });
        }
      });
    });
  });

  /**
   * We have to expect BBCode data, that cannot even be parsed. As such, an
   * error handling should provide a predictable behavior. Nevertheless, each
   * error handling is part of the design-scope: Do we accept some data-loss by
   * stripping only problematic BBCode? Or do we present an empty text on any
   * error in CKEditor 5 editing view (as we do for erred CoreMedia Rich Text)?
   *
   * Decision for now is to stick with BBob, which just strips broken BBCode
   * and tries to render the rest at best effort.
   */
  describe("Error Handling", () => {
    const cases = [
      {
        erred: `[/]`,
        expected: ``,
        comment: `for "only invalid BBCode" provide empty text`,
      },
      {
        erred: `Before[/]After`,
        expected: `BeforeAfter`,
        comment: `should just ignore broken BBCode parts`,
      },
      {
        erred: `[c][/c][b]hello[/c][/b][b]`,
        expected: `[c]<span style="font-weight: bold;">hello</span>[b]`,
        comment: `example input from BBob tests`,
      },
    ] as const;

    test("cases", async (t: TestContext) => {
      for (const [i, { erred: data, expected: expectedDataView, comment }] of cases.entries()) {
        await t.test(
          `[${i}] Should handle BBCode errors with care: ${data}, expected: ${expectedDataView} (${comment})`,
          () => {
            // We expect BBob to raise an error for all the above data. If this
            // changes, feel free to adapt the number of expected errors.
            aut.expectTransformation({ data, expectedDataView }, 1);
          },
        );
      }
    });
  });

  /**
   * Tests dedicated to the BBob integration. Typically applied to some lower
   * aspects to either ease debugging or to validate unchanged behavior after
   * BBob upgrade.
   */
  describe("BBob Integratino", () => {
    /**
     * Demonstrates (and validates) that the BBob parser is unaware of
     * newline representations different to LF (Unix). As a result, we need
     * to pre-process the incoming data to normalize newlines.
     *
     * If any of these tests fail, we may skip (or adapt) this extra processing.
     *
     * @see <https://github.com/JiLiZART/BBob/issues/212>
     */
    const cases = [
      {
        newline: `\n`,
        expectedTree: ["\n"],
        type: `LF (Unix)`,
      },
      {
        newline: `\r\n`,
        expectedTree: ["\r", "\n"],
        type: `CRLF (Windows)`,
      },
      {
        newline: `\r`,
        expectedTree: ["\r"],
        type: `CR (classic MacOS)`,
      },
      {
        newline: `A\nB`,
        expectedTree: ["A", "\n", "B"],
        type: `LF (Unix)`,
      },
      {
        newline: `A\r\nB`,
        expectedTree: ["A\r", "\n", "B"],
        type: `CRLF (Windows)`,
      },
      {
        newline: `A\rB`,
        expectedTree: ["A\rB"],
        type: `CR (classic MacOS)`,
      },
    ] as const;

    test("cases", async (t: TestContext) => {
      for (const [i, { newline, expectedTree, type }] of cases.entries()) {
        await t.test(`[${i}] Should parse system dependent newline representation for ${type} as expected.`, () => {
          // deconstruct to remove extra "candy" like messages from the resulting
          // array.
          const tree = [...aut.process(newline).tree];
          expect(tree).toEqual(expectedTree);
        });
      }
    });
  });
});
