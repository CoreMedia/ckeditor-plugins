// noinspection HtmlUnknownTarget,SpellCheckingInspection

import { bbCodeDefaultRules } from "../src";
import { bbcode2html } from "../src/bbcode2html";

const supportedTags = bbCodeDefaultRules.flatMap((r) => r.tags ?? ([] as string[]));

const aut = {
  expectTransformation: ({ data, expectedDataView }: { data: string; expectedDataView: string }): void => {
    const actual = bbcode2html(data, supportedTags);
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
      it.each`
        data                                                              | expectedDataView
        ${`[b]T[/b]`}                                                     | ${`<span style="font-weight: bold;">T</span>`}
        ${`[color=red]T[/color]`}                                         | ${`<span style="color: red;">T</span>`}
        ${`[i]T[/i]`}                                                     | ${'<span style="font-style: italic;">T</span>'}
        ${`[s]T[/s]`}                                                     | ${`<span style="text-decoration: line-through;">T</span>`}
        ${`[u]T[/u]`}                                                     | ${`<span style="text-decoration: underline;">T</span>`}
        ${`[url=https://example.org/]T[/url]`}                            | ${`<a href="https://example.org/">T</a>`}
        ${`[url]https://example.org/[/url]`}                              | ${`<a href="https://example.org/">https://example.org/</a>`}
        ${`[url=/relative]T[/url]`}                                       | ${`<a href="/relative">T</a>`}
        ${`[url]/relative[/url]`}                                         | ${`<a href="/relative">/relative</a>`}
        ${`[url=https://example.org/?one=1&two=2]T[/url]`}                | ${`<a href="https://example.org/?one=1&amp;two=2">T</a>`}
        ${`[url]https://example.org/?one=1&two=2[/url]`}                  | ${`<a href="https://example.org/?one=1&amp;two=2">https://example.org/?one=1&amp;two=2</a>`}
        ${`[url]https://example.org/?[b]predicate=x%3D42[/b]#_top[/url]`} | ${`<a href="https://example.org/?predicate=x%3D42#_top">https://example.org/?<span style="font-weight: bold;">predicate=x%3D42</span>#_top</a>`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });

    describe("Supported Block Tags", () => {
      it.each`
        data                                                                                                                       | expectedDataView
        ${`[code]T[/code]`}                                                                                                        | ${`<pre><code class="language-plaintext">T</code></pre>`}
        ${`[h1]T[/h1]`}                                                                                                            | ${`<h1>T</h1>`}
        ${`[h2]T[/h2]`}                                                                                                            | ${`<h2>T</h2>`}
        ${`[h3]T[/h3]`}                                                                                                            | ${`<h3>T</h3>`}
        ${`[h4]T[/h4]`}                                                                                                            | ${`<h4>T</h4>`}
        ${`[h5]T[/h5]`}                                                                                                            | ${`<h5>T</h5>`}
        ${`[h6]T[/h6]`}                                                                                                            | ${`<h6>T</h6>`}
        ${`[list][*] T[/list]`}                                                                                                    | ${`<ul><li> T</li></ul>`}
        ${`[quote]T[/quote]`}                                                                                                      | ${`<blockquote><p>T</p></blockquote>`}
        ${`[table][tr][td]T[/td][/tr][/table]`}                                                                                    | ${`<table><tr><td>T</td></tr></table>`}
        ${`[table][thead][tr][th]H[/th][/tr][/thead][tbody][tr][td]T[/td][/tr][/tbody][tfoot][tr][td]F[/td][/tr][/tfoot][/table]`} | ${`<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>T</td></tr></tbody><tfoot><tr><td>F</td></tr></tfoot></table>`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });
  });

  describe("By Tag", () => {
    // Some standard behaviors bundled.
    describe.each`
      tag          | openTag                   | closeTag      | openElement                                        | closeElement
      ${`[b]`}     | ${`[b]`}                  | ${`[/b]`}     | ${`<span style="font-weight: bold;">`}             | ${`</span>`}
      ${`[color]`} | ${`[color=red]`}          | ${`[/color]`} | ${`<span style="color: red;">`}                    | ${`</span>`}
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
        it.each`
          data                               | expectedDataView                           | comment
          ${`${openTag}T${closeTag}`}        | ${`${openElement}T${closeElement}`}        | ${`default`}
          ${`${openTag} T${closeTag}`}       | ${`${openElement} T${closeElement}`}       | ${`keep leading blanks`}
          ${`${openTag}T ${closeTag}`}       | ${`${openElement}T ${closeElement}`}       | ${`keep trailing blanks`}
          ${`${openTag}\nT${closeTag}`}      | ${`${openElement}\nT${closeElement}`}      | ${`keep leading single newlines`}
          ${`${openTag}T\n${closeTag}`}      | ${`${openElement}T\n${closeElement}`}      | ${`keep trailing single newlines`}
          ${`${openTag}T1\n\nT2${closeTag}`} | ${`${openElement}T1\n\nT2${closeElement}`} | ${`do not introduce a paragraph within element`}
        `(
          "[$#] Should process data '$data' to: $expectedDataView ($comment)",
          ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
            aut.expectTransformation({ data, expectedDataView });
          },
        );
      },
    );

    describe("[code]", () => {
      it.each`
        data                                                           | expectedDataView                                                                                   | comment
        ${`[code]T[/code]`}                                            | ${`<pre><code class="language-plaintext">T</code></pre>`}                                          | ${`Default to "plaintext" language`}
        ${`[code=css]T[/code]`}                                        | ${`<pre><code class="language-css">T</code></pre>`}                                                | ${`Accept language attribute`}
        ${`[code=html]<i>T</i>[/code]`}                                | ${`<pre><code class="language-html">&lt;i&gt;T&lt;/i&gt;</code></pre>`}                            | ${`Properly encode nested HTML`}
        ${`[code=bbcode]\\[i\\]T\\[/i\\][/code]`}                      | ${`<pre><code class="language-bbcode">[i]T[/i]</code></pre>`}                                      | ${`Strip escapes`}
        ${`[code=bbcode]\\[code=text\\]T\\[/code\\][/code]`}           | ${`<pre><code class="language-bbcode">[code=text]T[/code]</code></pre>`}                           | ${`Strip escapes`}
        ${`[code=bbcode]\\[code=bbcode\\]T\\[/code\\][/code]`}         | ${`<pre><code class="language-bbcode">[code=bbcode]T[/code]</code></pre>`}                         | ${`Strip escapes`}
        ${`[code=bbcode]\n\\[code=bbcode\\]\nT\n\\[/code\\]\n[/code]`} | ${`<pre><code class="language-bbcode">[code=bbcode]\nT\n[/code]</code></pre>`}                     | ${`Strip escapes and keep newlines`}
        ${`[code][i]T[/i][/code]`}                                     | ${`<pre><code class="language-plaintext"><span style="font-style: italic;">T</span></code></pre>`} | ${`Accept and parse BBCode within "code" tag`}
        ${`[code][script]javascript:alert("X")[/script][/code]`}       | ${`<pre><code class="language-plaintext">[script]javascript:alert("X")[/script]</code></pre>`}     | ${`Do not transform, e.g., script-tag.`}
        ${`[code]T1\n\nT2[/code]`}                                     | ${`<pre><code class="language-plaintext">T1\n\nT2</code></pre>`}                                   | ${`Don't handle duplicate newlines as paragraphs.`}
        ${`[code]  T1\n  T2[/code]`}                                   | ${`<pre><code class="language-plaintext">  T1\n  T2</code></pre>`}                                 | ${`Keep space indents`}
        ${`[code]\tT1\n\tT2[/code]`}                                   | ${`<pre><code class="language-plaintext">\tT1\n\tT2</code></pre>`}                                 | ${`Keep tab indents`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView ($comment)",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });

    describe("[quote]", () => {
      it.each`
        data                                                  | expectedDataView                                                                         | comment
        ${`[quote]T[/quote]`}                                 | ${`<blockquote><p>T</p></blockquote>`}                                                   | ${`minimal scenario`}
        ${`[quote=AUTHOR]T[/quote]`}                          | ${`<blockquote><p>T</p></blockquote>`}                                                   | ${`author information not supported`}
        ${`[quote]\nT\n[/quote]`}                             | ${`<blockquote><p>\nT</p></blockquote>`}                                                 | ${`strip obsolete trailing newlines`}
        ${`[quote]\nP1\n\nP2\n[/quote]`}                      | ${`<blockquote><p>\nP1</p><p>P2</p></blockquote>`}                                       | ${`paragraphs support`}
        ${`[quote]\nP1\n[quote]\nP2\n[/quote]\nP3\n[/quote]`} | ${`<blockquote><p>\nP1</p><blockquote><p>\nP2</p></blockquote><p>\nP3</p></blockquote>`} | ${`nested quotes support`}
        ${`[quote]\n[quote]\nT\n[/quote]\n[/quote]`}          | ${`<blockquote><blockquote><p>\nT</p></blockquote></blockquote>`}                        | ${`directly nested quotes support`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView ($comment)",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });
  });

  describe("Paragraphs", () => {
    it.each`
      data                                                 | expectedDataView                                                             | comment
      ${`P1\n\nP2`}                                        | ${`<p>P1</p><p>P2</p>`}                                                      | ${`Standard Paragraph Behavior`}
      ${``}                                                | ${``}                                                                        | ${`Do not create paragraphs on empty input`}
      ${`\n`}                                              | ${`\n`}                                                                      | ${`Do not create paragraphs on only single newline`}
      ${`\n\n`}                                            | ${`\n`}                                                                      | ${`Trim irrelevant newlines`}
      ${`\n\n\n`}                                          | ${`\n`}                                                                      | ${`Trim irrelevant newlines`}
      ${`\nP1\n\nP2`}                                      | ${`<p>\nP1</p><p>P2</p>`}                                                    | ${`Design Scope: Keep irrelevant leading newlines; simplifies processing`}
      ${`P1\n\n\nP2`}                                      | ${`<p>P1</p><p>P2</p>`}                                                      | ${`Trim obsolete newlines (trailing, 1)`}
      ${`P1\n\nP2\n`}                                      | ${`<p>P1</p><p>P2</p>`}                                                      | ${`Trim obsolete newlines (trailing, 2)`}
      ${`[quote]P1\n\nP2[/quote]`}                         | ${`<blockquote><p>P1</p><p>P2</p></blockquote>`}                             | ${`Respect paragraphs in quote sections`}
      ${`P1\n\n[quote]P2[/quote]\n\nP3`}                   | ${`<p>P1</p><blockquote><p>P2</p></blockquote><p>P3</p>`}                    | ${`Do not put blockquotes into paragraphs`}
      ${`P1\n\n[code]P2[/code]\n\nP3`}                     | ${`<p>P1</p><pre><code class="language-plaintext">P2</code></pre><p>P3</p>`} | ${`Do not put code blocks into paragraphs`}
      ${`P1\n\n[h1]P2[/h1]\n\nP3`}                         | ${`<p>P1</p><h1>P2</h1><p>P3</p>`}                                           | ${`Do not put headings into paragraphs`}
      ${`P1\n\n[table][tr][td]P2[/td][/tr][/table]\n\nP3`} | ${`<p>P1</p><table><tr><td>P2</td></tr></table><p>P3</p>`}                   | ${`Do not put tables into paragraphs`}
      ${`P1\n\n[list][*]P2[/list]\n\nP3`}                  | ${`<p>P1</p><ul><li>P2</li></ul><p>P3</p>`}                                  | ${`Do not put lists into paragraphs`}
    `(
      "[$#] Should process data '$data' to: $expectedDataView ($comment)",
      ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
        aut.expectTransformation({ data, expectedDataView });
      },
    );
  });

  describe("Tag Processing Challenges", () => {
    /**
     * We may meet unexpected formatting. This is handled (and tested) by
     * BBob. These tests are mainly meant as proof-of-concept to understand
     * the behavior of the BBob library.
     */
    describe("Formatting Errors", () => {
      it.each`
        data                   | expectedDataView                                                                          | comment
        ${`[b]T`}              | ${`<span style="font-weight: bold;"></span>T`}                                            | ${`surprise: creates an empty element. CKEditor 5 would just remove it.`}
        ${`T[/b]`}             | ${`T`}                                                                                    | ${`perfectly fine: Just ignore orphaned close-tag`}
        ${`[b]T[/i]`}          | ${`<span style="font-weight: bold;"></span>T`}                                            | ${`surprise: creates an empty element. CKEditor 5 would just remove it.`}
        ${`[b]A[i]B[/b]C[/i]`} | ${`<span style="font-weight: bold;">A<span style="font-style: italic;">B</span>C</span>`} | ${`surprise: only opening tag seems to control the hierarchy`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView ($comment)",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });

    describe("Attribute Challenges", () => {
      it.each`
        data                                     | expectedDataView                            | comment
        ${`[url=]T[/url]`}                       | ${`<a href="T">T</a>`}                      | ${`BBob: empty unique attribute handled as _not existing_`}
        ${`[url=\nhttps://example.org/]T[/url]`} | ${`<a href="\nhttps://example.org/">T</a>`} | ${`BBob: ignores newlines within (unique) attributes`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView ($comment)",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });
  });

  describe("Security", () => {
    describe("Raw HTML Injections", () => {
      it.each`
        data            | expectedDataView            | comment
        ${`A <b>B</b>`} | ${`A &lt;b&gt;B&lt;/b&gt;`} | ${`Defaults to not supporting embedded HTML elements.`}
        ${`A&amp;B`}    | ${`A&amp;amp;B`}            | ${`Defaults to not supporting entities, but to escape them.`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView ($comment)",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
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
      it.each`
        tainted                                                                                                       | expected                                                                                                                                                                                                                                                               | comment
        ${`[url=data:text/html;base64,PHNjcmlwdD5hbGVydCgiMSIpOzwvc2NyaXB0Pg==]sdfsdf[/url]`}                         | ${`<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgiMSIpOzwvc2NyaXB0Pg==">sdfsdf</a>`}                                                                                                                                                                               | ${`source: https://security.snyk.io/vuln/SNYK-PYTHON-BBCODE-40502; CKEditor 5 will prohibit clicking on these.`}
        ${`[url]javascript:alert('XSS');[/url]`}                                                                      | ${`<a href="javascript:alert('XSS');">javascript:alert('XSS');</a>`}                                                                                                                                                                                                   | ${`source: https://github.com/dcwatson/bbcode/issues/4; Will be passed as is to CKEditor 5, which will take care not to make this clickable within the UI.`}
        ${`[url]123" onmouseover="alert('Hacked');[/url]`}                                                            | ${`<a href="123&quot; onmouseover=&quot;alert('Hacked');">123" onmouseover="alert('Hacked');</a>`}                                                                                                                                                                     | ${`source: https://github.com/dcwatson/bbcode/issues/4`}
        ${`[url]https://google.com?[url] onmousemove=javascript:alert(String.fromCharCode(88,83,83));//[/url][/url]`} | ${`<a href="https://google.com? onmousemove=javascript:alert(String.fromCharCode(88,83,83));//">https://google.com?<a href=" onmousemove=javascript:alert(String.fromCharCode(88,83,83));//"> onmousemove=javascript:alert(String.fromCharCode(88,83,83));//</a></a>`} | ${`source: https://github.com/dcwatson/bbcode/issues/4; Slightly corrupted DOM, but attack did not pass through.`}
        ${`[color="onmouseover=alert(0) style="]dare to move your mouse here[/color]`}                                | ${`<span style="color: null;">dare to move your mouse here</span>`}                                                                                                                                                                                                    | ${`source: https://github.com/friendica/friendica/issues/9611; result of default HTML5 Preset - surprising "null" but no XSS issue: Fine!`}
      `(
        "[$#] Should prevent XSS-attack for: $tainted, expected: $expected ($comment)",
        ({ tainted: data, expected: expectedDataView }: { tainted: string; expected: string }) => {
          aut.expectTransformation({ data, expectedDataView });
        },
      );
    });
  });
});
