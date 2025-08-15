import { bbCodeUrl } from "../src";
import { requireHTMLElement } from "./DOMUtils";

describe("BBCodeUrl", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeUrl;
    const someUrl = "https://example.org/";

    // noinspection HtmlUnknownAnchorTarget
    it.each`
      dataView                                                             | expected                                                                | comment
      ${`<a href="${someUrl}">TEXT</a>`}                                   | ${`[url="${someUrl}"]TEXT[/url]`}                                       | ${`Default Mapping Use-Case`}
      ${`<a href="${someUrl}">${someUrl}</a>`}                             | ${`[url]${someUrl}[/url]`}                                              | ${`Pretty-Print: Shorten, if applicable`}
      ${`<a href="${someUrl}?openBracket=[">TEXT</a>`}                     | ${`[url="${someUrl}?openBracket=%5B"]TEXT[/url]`}                       | ${`Escape Open-Bracket [`}
      ${`<a href="${someUrl}?closeBracket=]">TEXT</a>`}                    | ${`[url="${someUrl}?closeBracket=%5D"]TEXT[/url]`}                      | ${`Escape Close-Bracket [`}
      ${`<a href="${someUrl}?quote=&quot;">TEXT</a>`}                      | ${`[url="${someUrl}?quote=%22"]TEXT[/url]`}                             | ${`Escape Double Quote in Attribute`}
      ${`<a href="${someUrl}?quote=&quot;">${someUrl}?quote="</a>`}        | ${`[url]${someUrl}?quote="[/url]`}                                      | ${`Don't escape double quote when rendered as content`}
      ${`<a href="${someUrl}?brackets=][">${someUrl}?brackets=\\]\\[</a>`} | ${`[url="${someUrl}?brackets=%5D%5B"]${someUrl}?brackets=\\]\\[[/url]`} | ${`Escaping of text-content done by previous (outside) processing`}
      ${`<a href="">TEXT</a>`}                                             | ${undefined}                                                            | ${`As there is no representation for "empty URLs" in BBCode, not mapping to [url]`}
      ${`<a href="/relative">TEXT</a>`}                                    | ${`[url="/relative"]TEXT[/url]`}                                        | ${`Keep relative URLs (1)`}
      ${`<a href="?search=param">TEXT</a>`}                                | ${`[url="?search=param"]TEXT[/url]`}                                    | ${`Keep relative URLs, search-param only (2)`}
      ${`<a href="#hash">TEXT</a>`}                                        | ${`[url="#hash"]TEXT[/url]`}                                            | ${`Keep relative URLs, hash-param only (3)`}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
