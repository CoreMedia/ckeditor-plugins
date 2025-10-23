// noinspection HtmlRequiredAltAttribute,HttpUrlsUsage

import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import html from "@bbob/html";
import { ckeditor5Preset as preset } from "../../src/bbob/ckeditor5Preset";

type HtmlInput = Parameters<typeof html>[0];
type HtmlResult = ReturnType<typeof html>;

const parse = (input: HtmlInput): HtmlResult => html(input, preset());

void describe("ckeditor5Preset", () => {
  void describe("Original Tests from: @bbob/preset-html5", () => {
    void test("[b]bolded text[/b]", () => {
      const input = "[b]bolded text[/b]";
      const result = '<span style="font-weight: bold;">bolded text</span>';
      expect(parse(input)).toBe(result);
    });

    void test("[i]italicized text[/i]", () => {
      const input = "[i]italicized text[/i]";
      const result = '<span style="font-style: italic;">italicized text</span>';
      expect(parse(input)).toBe(result);
    });

    void test("[u]underlined text[/u]", () => {
      const input = "[u]underlined text[/u]";
      const result = '<span style="text-decoration: underline;">underlined text</span>';
      expect(parse(input)).toBe(result);
    });

    void test("[s]strikethrough text[/s]", () => {
      const input = "[s]strikethrough text[/s]";
      const result = '<span style="text-decoration: line-through;">strikethrough text</span>';
      expect(parse(input)).toBe(result);
    });

    void test("[url]https://en.wikipedia.org[/url]", () => {
      const input = "[url]https://en.wikipedia.org[/url]";
      const result = '<a href="https://en.wikipedia.org">https://en.wikipedia.org</a>';

      expect(parse(input)).toBe(result);
    });

    void test("[url=http://step.pgc.edu/]ECAT[/url]", () => {
      const input = "[url=http://step.pgc.edu/]ECAT[/url]";
      const result = '<a href="http://step.pgc.edu/">ECAT</a>';

      expect(parse(input)).toBe(result);
    });

    void test("[img]https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Go-home-2.svg/100px-Go-home-2.svg.png[/img]", () => {
      const input =
        "[img]https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Go-home-2.svg/100px-Go-home-2.svg.png[/img]";
      const result =
        '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Go-home-2.svg/100px-Go-home-2.svg.png"/>';

      expect(parse(input)).toBe(result);
    });

    test('[quote="author"]quoted text[/quote]', () => {
      const input = '[quote="author"]quoted text[/quote]';
      const result = "<blockquote><p>quoted text</p></blockquote>";

      expect(parse(input)).toBe(result);
    });

    // We have overridden the behavior to also include a nested `<code>`
    // element.
    test.skip("[code]monospaced text[/code]", () => {
      const input = "[code]monospaced text[/code]";
      const result = "<pre>monospaced text</pre>";

      expect(parse(input)).toBe(result);
    });

    test('[style size="15px"]Large Text[/style]', () => {
      const input = '[style size="15px"]Large Text[/style]';
      const result = '<span style="font-size:15px;">Large Text</span>';

      expect(parse(input)).toBe(result);
    });

    test('[style color="red"]Red Text[/style]', () => {
      const input = '[style color="red"]Red Text[/style]';
      const result = '<span style="color:red;">Red Text</span>';

      expect(parse(input)).toBe(result);
    });

    test('[color="red"]Red Text[/color]', () => {
      const input = '[color="red"]Red Text[/color]';
      const result = '<span style="color: red;">Red Text</span>';

      expect(parse(input)).toBe(result);
    });

    void test(`[list][*]Entry 1[/list]`, () => {
      const input = `[list][*]Entry 1[*]Entry 2[/list]`;
      const result = "<ul><li>Entry 1</li><li>Entry 2</li></ul>";

      expect(parse(input)).toBe(result);
    });

    void test(`[list]*Entry 1[/list]`, () => {
      const input = `\
    [list]
    *Entry 1
    *Entry 2
    [/list]`;
      const result = `\
    <ul>
    <li>Entry 1
    </li><li>Entry 2
    </li></ul>`;

      // Patch: Leading Whitespace is trimmed meanwhile to get rid of extra paragraph.
      // See `skipEmpty´ option. Thus, trimming expected result.
      expect(parse(input)).toBe(result.trim());
    });

    void test("[list=1][/list]", () => {
      const input = `[list=1][/list]`;
      const result = `<ol type="1"></ol>`;

      expect(parse(input)).toBe(result);
    });

    void test("[list=A][/list]", () => {
      const input = `[list=A][/list]`;
      const result = `<ol type="A"></ol>`;

      expect(parse(input)).toBe(result);
    });

    void test(`[table][/table]`, () => {
      const input = `[table][tr][td]table 1[/td][td]table 2[/td][/tr][tr][td]table 3[/td][td]table 4[/td][/tr][/table]`;
      const result = `<table><tr><td>table 1</td><td>table 2</td></tr><tr><td>table 3</td><td>table 4</td></tr></table>`;

      expect(parse(input)).toBe(result);
    });
  });

  /**
   * These tests demonstrate flawed behaviors, thus, known bugs, we may ignore
   * or have to deal with. If any of these tests fail, a corresponding issue
   * raised at BBob may have been fixed meanwhile.
   *
   * If you happen to see a test failing, search for the referenced issue ID
   * within our sources and see, if corresponding actions are required.
   *
   * Added tests in here should reference an issue and specify a type, thus,
   * if we just accepted it as known issue, or if we had to apply a workaround.
   */
  void describe("BBob Flawed Behaviors", () => {
    // noinspection HtmlUnknownTarget,HtmlUnknownAttribute,BadExpressionStatementJS
    const cases = [
      {
        bbcode: `[url fakeUnique=fakeUnique]T[/url]`,
        expected: `<a href="fakeUnique">T</a>`,
        issue: "https://github.com/JiLiZART/BBob/issues/202",
        comment: "getUniqAttr flaw. This test just demonstrates the symptom.",
      },
      {
        bbcode: `[unknown=https://example.org/ fakeUnique=fakeUnique]T[/unknown]`,
        expected: `<unknown https://example.org/ fakeUnique=fakeUnique="https://example.org/ fakeUnique=fakeUnique">T</unknown>`,
        issue: "https://github.com/JiLiZART/BBob/issues/202",
        comment:
          "getUniqAttr flaw. This demonstrates a follow-up issue regarding the default HTML renderer (for BBob Plugin we use a custom renderer with slightly better behavior)",
      },
      {
        bbcode: `[url=https://example.org/ fakeUnique=fakeUnique]T[/url]`,
        expected: `<a href="https://example.org/ fakeUnique=fakeUnique">T</a>`,
        issue: "https://github.com/JiLiZART/BBob/issues/202",
        comment: "getUniqAttr flaw. Demonstrates accidental override.",
      },
      {
        bbcode: `[url=https://example.org/ hidden]T[/url]`,
        expected: `<a href="https://example.org/ hidden">T</a>`,
        issue: "https://github.com/JiLiZART/BBob/issues/202",
        comment: "getUniqAttr flaw. Demonstrates accidental override, but with more realistic use-case.",
      },
      {
        bbcode: `[table=onclick][tr][td]T[/td][/tr][/table]`,
        expected: `<table onclick="onclick"><tr><td>T</td></tr></table>`,
        issue: "https://github.com/JiLiZART/BBob/issues/202",
        comment: "getUniqAttr flaw. Only applicable, if mapping rules do not explicitly remove unhandled attributes.",
      },
      {
        bbcode: `[table onclick=onclick][tr][td]T[/td][/tr][/table]`,
        expected: `<table onclick="onclick"><tr><td>T</td></tr></table>`,
        issue: "https://github.com/JiLiZART/BBob/issues/202",
        comment: "getUniqAttr flaw. Only applicable, if mapping rules do not explicitly remove unhandled attributes.",
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { bbcode, expected, issue, comment }] of cases.entries()) {
        await t.test(`[${i}] Expected flawed behavior: '${bbcode}' to '${expected}' (${issue}, ${comment})`, () => {
          expect(parse(bbcode)).toBe(expected);
        });
      }
    });
  });

  void describe("CKEditor 5 Data View Specific Adaptations", () => {
    // We have overridden the behavior to also include a nested `<code>`
    // element.
    void describe("[code]", () => {
      const cases = [
        {
          bbcode: "[code]text[/code]",
          expected: `<pre><code class="language-plaintext">text</code></pre>`,
          comment: "CKEditor 5 Text Part Language uses 'plaintext' as the default.",
        },
        {
          bbcode: "[code=css]text[/code]",
          expected: `<pre><code class="language-css">text</code></pre>`,
          comment: "CKEditor 5 Text Part Language encodes chosen languages into 'language-*' class",
        },
        {
          bbcode: `[code=hack"me]text[/code]`,
          expected: `<pre><code class="language-hack&quot;me">text</code></pre>`,
          comment: "Prevent hacking attribute by encoding.",
        },
      ] as const;

      void test("cases", async (t: TestContext) => {
        for (const [i, { bbcode, expected, comment }] of cases.entries()) {
          await t.test(`[${i}] Should transform $bbcode to: ${expected} (${comment})`, () => {
            expect(parse(bbcode)).toBe(expected);
          });
        }
      });
    });

    void describe("Paragraphs (denoted by double newline)", () => {
      const cases = [
        {
          bbcode: `Lorem\n\nIpsum`,
          expected: `<p>Lorem</p><p>Ipsum</p>`,
          comment: `standard paragraph processing`,
        },
        {
          bbcode: `Lorem\nIpsum`,
          expected: `Lorem\nIpsum`,
          comment: `nothing to do for single newline; Design Scope: We may have added <br> here.`,
        },
        {
          bbcode: `Lorem\n\n`,
          expected: `Lorem\n`,
          comment: `some trimming applied, but (just) newlines at the end never trigger paragraph processing`,
        },
        {
          bbcode: `\n\nLorem`,
          expected: `\nLorem`,
          comment: `newlines at the beginning do not trigger paragraph processing but get trimmed`,
        },
        {
          bbcode: `[quote]Lorem\n\nIpsum[/quote]`,
          expected: `<blockquote><p>Lorem</p><p>Ipsum</p></blockquote>`,
          comment: `quote: add each paragraph separately`,
        },
        {
          bbcode: `[quote]Lorem[quote]Ipsum[/quote][/quote]`,
          expected: `<blockquote><p>Lorem</p><blockquote><p>Ipsum</p></blockquote></blockquote>`,
          comment: `quote: handle nested blockquotes properly`,
        },
        {
          bbcode: `[quote]Lorem[list][*]Ipsum[/list][/quote]`,
          expected: `<blockquote><p>Lorem</p><ul><li>Ipsum</li></ul></blockquote>`,
          comment: `quote: handle nested block-level elements properly`,
        },
        {
          bbcode: `[list][*]Lorem\n\nIpsum\n[/list]`,
          expected: `<ul><li><p>Lorem</p><p>Ipsum</p></li></ul>`,
          comment: `list/li: add each paragraph separately`,
        },
        {
          bbcode: `Lorem\n\nipsum\n[quote]dolor[/quote]\nsit`,
          expected: `<p>Lorem</p><p>ipsum</p><blockquote><p>dolor</p></blockquote><p>\nsit</p>`,
          comment: `Continue with paragraphs, once we added them on a given hierarchy level. Extra newline (sit) is within design scope.`,
        },
        {
          bbcode: `[b]Lorem\n\nIpsum[/b]`,
          expected: `<span style="font-weight: bold;">Lorem\n\nIpsum</span>`,
          comment: `no paragraphs within inline tags`,
        },
      ] as const;

      void test("cases", async (t: TestContext) => {
        for (const [i, { bbcode, expected, comment }] of cases.entries()) {
          await t.test(`[${i}] Should transform $bbcode to: ${expected} (${comment})`, () => {
            expect(parse(bbcode)).toBe(expected);
          });
        }
      });
    });
  });

  void describe("Additional Tag Support", () => {
    // [size] Was supported in CKEditor 4 BBCode Plugin. The number represented
    // a percentage value. As CKEditor 5 does not support percentage values in
    // Font Size Feature, some enum-like mapping to classes is applied.
    void describe("[size]", () => {
      const cases = [
        {
          bbcode: `[size]T[/size]`,
          expected: `<span>T</span>`,
          comment: "Corner Case: Ignore Invalid (because missing) size value",
        },
        {
          bbcode: `[size=lorem]T[/size]`,
          expected: `<span>T</span>`,
          comment: "Corner Case: Ignore Invalid (because textual) size value",
        },
        {
          bbcode: `[size=42px]T[/size]`,
          expected: `<span>T</span>`,
          comment: "Corner Case: Ignore Invalid (because with size unit) size value",
        },
        {
          bbcode: `[size=${Number.MIN_SAFE_INTEGER}]T[/size]`,
          expected: `<span class="text-tiny">T</span>`,
          comment: "Corner Case: Negative (minimal safe integer) maps to text-tiny",
        },
        {
          bbcode: `[size=-1]T[/size]`,
          expected: `<span class="text-tiny">T</span>`,
          comment: "Corner Case: Negative maps to text-tiny",
        },
        {
          bbcode: `[size=+1]T[/size]`,
          expected: `<span class="text-tiny">T</span>`,
          comment: "Corner Case: '+' prefix is ignored",
        },
        {
          bbcode: `[size=0]T[/size]`,
          expected: `<span class="text-tiny">T</span>`,
          comment: "Lower-Bound for text-tiny",
        },
        { bbcode: `[size=70]T[/size]`, expected: `<span class="text-tiny">T</span>`, comment: "Default for text-tiny" },
        {
          bbcode: `[size=77]T[/size]`,
          expected: `<span class="text-tiny">T</span>`,
          comment: "Upper-Bound for text-tiny",
        },
        {
          bbcode: `[size=78]T[/size]`,
          expected: `<span class="text-small">T</span>`,
          comment: "Lower-Bound for text-small",
        },
        {
          bbcode: `[size=85]T[/size]`,
          expected: `<span class="text-small">T</span>`,
          comment: "Default for text-small",
        },
        {
          bbcode: `[size=92]T[/size]`,
          expected: `<span class="text-small">T</span>`,
          comment: "Upper-Bound for text-small",
        },
        {
          bbcode: `[size=93]T[/size]`,
          expected: `<span>T</span>`,
          comment: "Lower-Bound for normal text size (no class)",
        },
        {
          bbcode: `[size=100]T[/size]`,
          expected: `<span>T</span>`,
          comment: "Default for normal text size (no class)",
        },
        {
          bbcode: `[size=119]T[/size]`,
          expected: `<span>T</span>`,
          comment: "Upper-Bound for normal text size (no class)",
        },
        {
          bbcode: `[size=120]T[/size]`,
          expected: `<span class="text-big">T</span>`,
          comment: "Lower-Bound for text-big",
        },
        { bbcode: `[size=140]T[/size]`, expected: `<span class="text-big">T</span>`, comment: "Default for text-big" },
        {
          bbcode: `[size=159]T[/size]`,
          expected: `<span class="text-big">T</span>`,
          comment: "Upper-Bound for text-big",
        },
        {
          bbcode: `[size=160]T[/size]`,
          expected: `<span class="text-huge">T</span>`,
          comment: "Lower-Bound for text-huge",
        },
        {
          bbcode: `[size=180]T[/size]`,
          expected: `<span class="text-huge">T</span>`,
          comment: "Default for text-huge",
        },
        {
          bbcode: `[size=${Number.MAX_SAFE_INTEGER}]T[/size]`,
          expected: `<span class="text-huge">T</span>`,
          comment: "Upper-Bound for text-huge",
        },
      ] as const;

      void test("cases", async (t: TestContext) => {
        for (const [i, { bbcode, expected, comment }] of cases.entries()) {
          await t.test(`[${i}] Should transform $bbcode to: ${expected} (${comment})`, () => {
            expect(parse(bbcode)).toBe(expected);
          });
        }
      });
    });
  });
});
