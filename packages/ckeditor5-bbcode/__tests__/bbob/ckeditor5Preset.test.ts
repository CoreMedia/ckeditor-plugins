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
        ${`[b]Lorem\n\nIpsum[/b]`}                     | ${`<span style="font-weight: bold;">Lorem\n\nIpsum</span>`}                       | ${`no paragraphs within inline tags`}
      `(
        "[$#] Should transform $bbcode to: $expected ($comment)",
        ({ bbcode, expected }: { bbcode: string; expected: string }) => {
          expect(parse(bbcode)).toBe(expected);
        },
      );
    });
  });
});
