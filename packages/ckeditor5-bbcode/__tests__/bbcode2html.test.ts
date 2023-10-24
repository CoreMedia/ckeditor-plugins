// noinspection HtmlUnknownTarget,SpellCheckingInspection

import { bbCodeDefaultRules } from "../src";
import { bbcode2html } from "../src/bbcode2html";

const supportedTags = bbCodeDefaultRules.flatMap((r) => r.tags ?? ([] as string[]));

const aut = {
  bbcode2html: (input: string): string => bbcode2html(input, supportedTags),
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
        data                                   | expectedDataView
        ${`[b]T[/b]`}                          | ${`<span style="font-weight: bold;">T</span>`}
        ${`[color=red]T[/color]`}              | ${`<span style="color: red;">T</span>`}
        ${`[i]T[/i]`}                          | ${'<span style="font-style: italic;">T</span>'}
        ${`[s]T[/s]`}                          | ${`<span style="text-decoration: line-through;">T</span>`}
        ${`[u]T[/u]`}                          | ${'<span style="text-decoration: underline;">T</span>'}
        ${`[url=https://example.org/]T[/url]`} | ${'<a href="https://example.org/">T</a>'}
        ${`[url]https://example.org/[/url]`}   | ${'<a href="https://example.org/">https://example.org/</a>'}
      `(
        "[$#] Should process data '$data' to: $expectedDataView",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          expect(aut.bbcode2html(data)).toBe(expectedDataView);
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
          expect(aut.bbcode2html(data)).toBe(expectedDataView);
        },
      );
    });
  });

  describe("Tag Processing Challenges", () => {
    /**
     * We may meet unexpected formatting. This is handled (and tested) by
     * BBob. These tests are mainly meant as proof-of-concept to understand
     * the behavior of the BBob library.
     */
    describe("Formatting Errors", () => {
      describe("Inline Tags", () => {
        it.each`
          data                   | expectedDataView                                                                          | comment
          ${`[b]T`}              | ${`<span style="font-weight: bold;"></span>T`}                                            | ${`surprise: creates an empty element. CKEditor 5 would just remove it.`}
          ${`T[/b]`}             | ${`T`}                                                                                    | ${`perfectly fine: Just ignore orphaned close-tag`}
          ${`[b]T[/i]`}          | ${`<span style="font-weight: bold;"></span>T`}                                            | ${`surprise: creates an empty element. CKEditor 5 would just remove it.`}
          ${`[b]A[i]B[/b]C[/i]`} | ${`<span style="font-weight: bold;">A<span style="font-style: italic;">B</span>C</span>`} | ${`surprise: only opening tag seems to control the hierarchy`}
        `(
          "[$#] Should process data '$data' to: $expectedDataView ($comment)",
          ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
            expect(aut.bbcode2html(data)).toBe(expectedDataView);
          },
        );
      });
    });

    describe("Attribute Challenges", () => {
      it.each`
        data                                     | expectedDataView                            | comment
        ${`[url=]T[/url]`}                       | ${`<a href="T">T</a>`}                      | ${`BBob: empty unique attribute handled as _not existing_`}
        ${`[url=\nhttps://example.org/]T[/url]`} | ${`<a href="\nhttps://example.org/">T</a>`} | ${`BBob: ignores newlines within (unique) attributes`}
      `(
        "[$#] Should process data '$data' to: $expectedDataView ($comment)",
        ({ data, expectedDataView }: { data: string; expectedDataView: string }) => {
          expect(aut.bbcode2html(data)).toBe(expectedDataView);
        },
      );
    });
  });

  describe("Security", () => {
    describe("tainted on* handlers", () => {
      it.each`
        tainted
        ${`[b onclick=">8-<~"]T[/b]`}
        ${`[code onclick=">8-<~"]T[/code]`}
        ${`[color=red onclick=">8-<~"]T[/color]`}
        ${`[h1 onclick=">8-<~"]T[/h1]`}
        ${`[i onclick=">8-<~"]T[/i]`}
        ${`[list onclick=">8-<~"][* onclick=">8-<~"]T[/list]`}
        ${`[quote onclick=">8-<~"]T[/quote]`}
        ${`[s onclick=">8-<~"]T[/s]`}
        ${`[table onclick=">8-<~"][tr onclick=">8-<~"][td onclick=">8-<~"]T[/td][/tr][/table]`}
        ${`[u onclick=">8-<~"]T[/u]`}
        ${`[url=https://example.org/ onclick=">8-<~"]T[/url]`}
      `("[$#] Should prevent onclick-attack for: $tainted", ({ tainted }: { tainted: string }) => {
        expect(aut.bbcode2html(tainted)).not.toContain("onclick");
      });
    });

    /**
     * Testing with some XSS payloads. Note, that these tests only incorporate
     * BBob processing. CKEditor 5 also provides an extra security layer, that
     * may block additional attack vectors.
     *
     * @see https://github.com/JiLiZART/BBob/issues/201
     * @see https://swarm.ptsecurity.com/fuzzing-for-xss-via-nested-parsers-condition/
     */
    describe("XSS attacks", () => {
      it.each`
        tainted                                                                                                       | expected                                                                                                                                                                                                                                                                                          | comment
        ${`[url=data:text/html;base64,PHNjcmlwdD5hbGVydCgiMSIpOzwvc2NyaXB0Pg==]sdfsdf[/url]`}                         | ${`<a href="data%3Atext/html;base64,PHNjcmlwdD5hbGVydCgiMSIpOzwvc2NyaXB0Pg==">sdfsdf</a>`}                                                                                                                                                                                                        | ${`source: https://security.snyk.io/vuln/SNYK-PYTHON-BBCODE-40502; BBob#escapeHTML disables denied protocols by escaping`}
        ${`[url]javascript:alert('XSS');[/url]`}                                                                      | ${`<a href="javascript%3Aalert(&#039;XSS&#039;);">javascript:alert('XSS');</a>`}                                                                                                                                                                                                                  | ${`source: https://github.com/dcwatson/bbcode/issues/4; BBob#escapeHTML disables denied protocols by escaping`}
        ${`[url]123" onmouseover="alert('Hacked');[/url]`}                                                            | ${`<a href="123&quot; onmouseover=&quot;alert(&#039;Hacked&#039;);">123" onmouseover="alert('Hacked');</a>`}                                                                                                                                                                                      | ${`source: https://github.com/dcwatson/bbcode/issues/4; BBob#escapeHTML escapes malicious characters such as quotes`}
        ${`[url]https://google.com?[url] onmousemove=javascript:alert(String.fromCharCode(88,83,83));//[/url][/url]`} | ${`<a href="https://google.com?&lt;url&gt; onmousemove=javascript%3Aalert(String.fromCharCode(88,83,83));//&lt;/url&gt;">https://google.com?<a href=" onmousemove=javascript%3Aalert(String.fromCharCode(88,83,83));//"> onmousemove=javascript:alert(String.fromCharCode(88,83,83));//</a></a>`} | ${`source: https://github.com/dcwatson/bbcode/issues/4; No real issue, but tag nesting is surprising`}
      `(
        "[$#] Should prevent XSS-attack for: $tainted, expected: $expected ($comment)",
        ({ tainted, expected }: { tainted: string; expected: string }) => {
          expect(aut.bbcode2html(tainted)).toBe(expected);
        },
      );
    });
  });
});
