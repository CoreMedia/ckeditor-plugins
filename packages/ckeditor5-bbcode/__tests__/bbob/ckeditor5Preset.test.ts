// noinspection HtmlRequiredAltAttribute,HttpUrlsUsage

import html from "@bbob/html/es";
import { ckeditor5Preset as preset } from "../../src/bbob/ckeditor5Preset";

type HtmlInput = Parameters<typeof html>[0];
type HtmlResult = ReturnType<typeof html>;

const parse = (input: HtmlInput): HtmlResult => html(input, preset());

describe("ckeditor5Preset", () => {
  describe("Original Tests from: @bbob/preset-html5", () => {
    test("[b]bolded text[/b]", () => {
      const input = "[b]bolded text[/b]";
      const result = '<span style="font-weight: bold;">bolded text</span>';
      expect(parse(input)).toBe(result);
    });

    test("[i]italicized text[/i]", () => {
      const input = "[i]italicized text[/i]";
      const result = '<span style="font-style: italic;">italicized text</span>';
      expect(parse(input)).toBe(result);
    });

    test("[u]underlined text[/u]", () => {
      const input = "[u]underlined text[/u]";
      const result = '<span style="text-decoration: underline;">underlined text</span>';
      expect(parse(input)).toBe(result);
    });

    test("[s]strikethrough text[/s]", () => {
      const input = "[s]strikethrough text[/s]";
      const result = '<span style="text-decoration: line-through;">strikethrough text</span>';
      expect(parse(input)).toBe(result);
    });

    test("[url]https://en.wikipedia.org[/url]", () => {
      const input = "[url]https://en.wikipedia.org[/url]";
      const result = '<a href="https://en.wikipedia.org">https://en.wikipedia.org</a>';

      expect(parse(input)).toBe(result);
    });

    test("[url=http://step.pgc.edu/]ECAT[/url]", () => {
      const input = "[url=http://step.pgc.edu/]ECAT[/url]";
      const result = '<a href="http://step.pgc.edu/">ECAT</a>';

      expect(parse(input)).toBe(result);
    });

    test("[img]https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Go-home-2.svg/100px-Go-home-2.svg.png[/img]", () => {
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

    test(`[list][*]Entry 1[/list]`, () => {
      const input = `[list][*]Entry 1[*]Entry 2[/list]`;
      const result = "<ul><li>Entry 1</li><li>Entry 2</li></ul>";

      expect(parse(input)).toBe(result);
    });

    test(`[list]*Entry 1[/list]`, () => {
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

    test("[list=1][/list]", () => {
      const input = `[list=1][/list]`;
      const result = `<ol type="1"></ol>`;

      expect(parse(input)).toBe(result);
    });

    test("[list=A][/list]", () => {
      const input = `[list=A][/list]`;
      const result = `<ol type="A"></ol>`;

      expect(parse(input)).toBe(result);
    });

    test(`[table][/table]`, () => {
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
  describe("BBob Flawed Behaviors", () => {
    // noinspection HtmlUnknownTarget,HtmlUnknownAttribute,BadExpressionStatementJS
    test.each`
      bbcode                                                               | expected                                                                                      | issue                                            | comment
      ${`[url fakeUnique=fakeUnique]T[/url]`}                              | ${`<a href="fakeUnique">T</a>`}                                                               | ${`https://github.com/JiLiZART/BBob/issues/202`} | ${`getUniqAttr flaw. This test just demonstrates the symptom.`}
      ${`[unknown=https://example.org/ fakeUnique=fakeUnique]T[/unknown]`} | ${`<unknown https://example.org/="https://example.org/" fakeUnique="fakeUnique">T</unknown>`} | ${`https://github.com/JiLiZART/BBob/issues/202`} | ${`getUniqAttr flaw. This demonstrates a follow-up issue regarding the default HTML renderer (for BBob Plugin we use a custom renderer with slightly better behavior)`}
      ${`[url=https://example.org/ fakeUnique=fakeUnique]T[/url]`}         | ${'<a https://example.org/="https://example.org/" href="fakeUnique">T</a>'}                   | ${`https://github.com/JiLiZART/BBob/issues/202`} | ${`getUniqAttr flaw. Demonstrates accidental override.`}
      ${`[url=https://example.org/ hidden]T[/url]`}                        | ${`<a https://example.org/="https://example.org/" href="hidden">T</a>`}                       | ${`https://github.com/JiLiZART/BBob/issues/202`} | ${`getUniqAttr flaw. Demonstrates accidental override, but with more realistic use-case.`}
      ${`[table=onclick][tr][td]T[/td][/tr][/table]`}                      | ${`<table onclick="onclick"><tr><td>T</td></tr></table>`}                                     | ${`https://github.com/JiLiZART/BBob/issues/202`} | ${`getUniqAttr flaw. Only applicable, if mapping rules do not explicitly remove unhandled attributes.`}
      ${`[table onclick=onclick][tr][td]T[/td][/tr][/table]`}              | ${`<table onclick="onclick"><tr><td>T</td></tr></table>`}                                     | ${`https://github.com/JiLiZART/BBob/issues/202`} | ${`getUniqAttr flaw. Only applicable, if mapping rules do not explicitly remove unhandled attributes.`}
    `(
      "[$#] Expected flawed behavior: '$bbcode' to '$expected' ($issue, $comment)",
      ({ bbcode, expected }: { bbcode: string; expected: string }) => {
        expect(parse(bbcode)).toBe(expected);
      },
    );
  });

  describe("CKEditor 5 Data View Specific Adaptations", () => {
    // We have overridden the behavior to also include a nested `<code>`
    // element.
    describe("[code]", () => {
      test.each`
        bbcode                         | expected                                                        | comment
        ${"[code]text[/code]"}         | ${`<pre><code class="language-plaintext">text</code></pre>`}    | ${"CKEditor 5 Text Part Language uses 'plaintext' as the default."}
        ${"[code=css]text[/code]"}     | ${`<pre><code class="language-css">text</code></pre>`}          | ${"CKEditor 5 Text Part Language encodes chosen languages into 'language-*' class"}
        ${`[code=hack"me]text[/code]`} | ${`<pre><code class="language-hack&quot;me">text</code></pre>`} | ${"Prevent hacking attribute by encoding."}
      `(
        "[$#] Should transform $bbcode to: $expected ($comment)",
        ({ bbcode, expected }: { bbcode: string; expected: string }) => {
          expect(parse(bbcode)).toBe(expected);
        },
      );
    });

    describe("Paragraphs (denoted by double newline)", () => {
      test.each`
        bbcode                                         | expected                                                                        | comment
        ${`Lorem\n\nIpsum`}                            | ${`<p>Lorem</p><p>Ipsum</p>`}                                                   | ${`standard paragraph processing`}
        ${`Lorem\nIpsum`}                              | ${`Lorem\nIpsum`}                                                               | ${`nothing to do for single newline; Design Scope: We may have added <br> here.`}
        ${`Lorem\n\n`}                                 | ${`Lorem\n`}                                                                    | ${`some trimming applied, but (just) newlines at the end never trigger paragraph processing`}
        ${`\n\nLorem`}                                 | ${`\nLorem`}                                                                    | ${`newlines at the beginning do not trigger paragraph processing but get trimmed`}
        ${`[quote]Lorem\n\nIpsum[/quote]`}             | ${`<blockquote><p>Lorem</p><p>Ipsum</p></blockquote>`}                          | ${`quote: add each paragraph separately`}
        ${`[quote]Lorem[quote]Ipsum[/quote][/quote]`}  | ${`<blockquote><p>Lorem</p><blockquote><p>Ipsum</p></blockquote></blockquote>`} | ${`quote: handle nested blockquotes properly`}
        ${`[quote]Lorem[list][*]Ipsum[/list][/quote]`} | ${`<blockquote><p>Lorem</p><ul><li>Ipsum</li></ul></blockquote>`}               | ${`quote: handle nested block-level elements properly`}
        ${`[list][*]Lorem\n\nIpsum\n[/list]`}          | ${`<ul><li><p>Lorem</p><p>Ipsum</p></li></ul>`}                                 | ${`list/li: add each paragraph separately`}
        ${`Lorem\n\nipsum\n[quote]dolor[/quote]\nsit`} | ${`<p>Lorem</p><p>ipsum</p><blockquote><p>dolor</p></blockquote><p>\nsit</p>`}  | ${`Continue with paragraphs, once we added them on a given hierarchy level. Extra newline (sit) is within design scope.`}
        ${`[b]Lorem\n\nIpsum[/b]`}                     | ${`<span style="font-weight: bold;">Lorem\n\nIpsum</span>`}                     | ${`no paragraphs within inline tags`}
      `(
        "[$#] Should transform $bbcode to: $expected ($comment)",
        ({ bbcode, expected }: { bbcode: string; expected: string }) => {
          expect(parse(bbcode)).toBe(expected);
        },
      );
    });
  });

  describe("Additional Tag Support", () => {
    // [size] Was supported in CKEditor 4 BBCode Plugin. The number represented
    // a percentage value. As CKEditor 5 does not support percentage values in
    // Font Size Feature, some enum-like mapping to classes is applied.
    describe("[size]", () => {
      test.each`
        bbcode                                         | expected                               | comment
        ${`[size]T[/size]`}                            | ${`<span>T</span>`}                    | ${"Corner Case: Ignore Invalid (because missing) size value"}
        ${`[size=lorem]T[/size]`}                      | ${`<span>T</span>`}                    | ${"Corner Case: Ignore Invalid (because textual) size value"}
        ${`[size=42px]T[/size]`}                       | ${`<span>T</span>`}                    | ${"Corner Case: Ignore Invalid (because with size unit) size value"}
        ${`[size=${Number.MIN_SAFE_INTEGER}]T[/size]`} | ${`<span class="text-tiny">T</span>`}  | ${"Corner Case: Negative (minimal safe integer) maps to text-tiny"}
        ${`[size=-1]T[/size]`}                         | ${`<span class="text-tiny">T</span>`}  | ${"Corner Case: Negative maps to text-tiny"}
        ${`[size=+1]T[/size]`}                         | ${`<span class="text-tiny">T</span>`}  | ${"Corner Case: '+' prefix is ignored"}
        ${`[size=0]T[/size]`}                          | ${`<span class="text-tiny">T</span>`}  | ${"Lower-Bound for text-tiny"}
        ${`[size=70]T[/size]`}                         | ${`<span class="text-tiny">T</span>`}  | ${"Default for text-tiny"}
        ${`[size=77]T[/size]`}                         | ${`<span class="text-tiny">T</span>`}  | ${"Upper-Bound for text-tiny"}
        ${`[size=78]T[/size]`}                         | ${`<span class="text-small">T</span>`} | ${"Lower-Bound for text-small"}
        ${`[size=85]T[/size]`}                         | ${`<span class="text-small">T</span>`} | ${"Default for text-small"}
        ${`[size=92]T[/size]`}                         | ${`<span class="text-small">T</span>`} | ${"Upper-Bound for text-small"}
        ${`[size=93]T[/size]`}                         | ${`<span>T</span>`}                    | ${"Lower-Bound for normal text size (no class)"}
        ${`[size=100]T[/size]`}                        | ${`<span>T</span>`}                    | ${"Default for normal text size (no class)"}
        ${`[size=119]T[/size]`}                        | ${`<span>T</span>`}                    | ${"Upper-Bound for normal text size (no class)"}
        ${`[size=120]T[/size]`}                        | ${`<span class="text-big">T</span>`}   | ${"Lower-Bound for text-big"}
        ${`[size=140]T[/size]`}                        | ${`<span class="text-big">T</span>`}   | ${"Default for text-big"}
        ${`[size=159]T[/size]`}                        | ${`<span class="text-big">T</span>`}   | ${"Upper-Bound for text-big"}
        ${`[size=160]T[/size]`}                        | ${`<span class="text-huge">T</span>`}  | ${"Lower-Bound for text-huge"}
        ${`[size=180]T[/size]`}                        | ${`<span class="text-huge">T</span>`}  | ${"Default for text-huge"}
        ${`[size=${Number.MAX_SAFE_INTEGER}]T[/size]`} | ${`<span class="text-huge">T</span>`}  | ${"Upper-Bound for text-huge"}
      `(
        "[$#] Should transform $bbcode to: $expected ($comment)",
        ({ bbcode, expected }: { bbcode: string; expected: string }) => {
          expect(parse(bbcode)).toBe(expected);
        },
      );
    });
  });
});
