import { bbCodeImg } from "../src/rules/BBCodeImg";
import { requireHTMLElement } from "./DOMUtils";

describe("BBCodeImg", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeImg;
    const someUrl = "https://example.org/";

    // noinspection HtmlUnknownAnchorTarget,HtmlRequiredAltAttribute,HtmlUnknownTarget
    it.each`
      dataView                                   | expected                                    | comment
      ${`<img src="${someUrl}">`}                | ${`[img]${someUrl}[/img]`}                  | ${`Default Mapping Use-Case`}
      ${`<img src="${someUrl}?openBracket=[">`}  | ${`[img]${someUrl}?openBracket=%5B[/img]`}  | ${`Escape Open-Bracket [`}
      ${`<img src="${someUrl}?closeBracket=]">`} | ${`[img]${someUrl}?closeBracket=%5D[/img]`} | ${`Escape Close-Bracket [`}
      ${`<img src="${someUrl}?quote=&quot;">`}   | ${`[img]${someUrl}?quote="[/img]`}          | ${`Don't escape double quote as it is rendered as content`}
      ${`<img src="">`}                          | ${undefined}                                | ${`As there is no representation for "empty URLs" in BBCode, not mapping to [img]`}
      ${`<img src="/relative">`}                 | ${`[img]/relative[/img]`}                   | ${`Keep relative URLs (1)`}
      ${`<img src="?search=param">`}             | ${`[img]?search=param[/img]`}               | ${`Keep relative URLs, search-param only (2)`}
      ${`<img src="#hash">`}                     | ${`[img]#hash[/img]`}                       | ${`Keep relative URLs, hash-param only (3)`}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element);
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
