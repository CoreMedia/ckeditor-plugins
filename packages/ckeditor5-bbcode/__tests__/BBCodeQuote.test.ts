import { requireHTMLElement } from "./DOMUtils";
import { bbCodeQuote } from "../src";

describe("BBCodeQuote", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeQuote;

    it.each`
      dataView                                  | expected                       | comment
      ${`<blockquote><p>TEXT</p></blockquote>`} | ${`[quote]\nTEXT\n[/quote]\n`} | ${`newlines for minor pretty-printing`}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        // Simple processing only applies at one level, so nested tests not possible here.
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
