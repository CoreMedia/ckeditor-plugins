import { bbCodeParagraph } from "../src";
import { requireHTMLElement } from "./DOMUtils";

const prettyPrintNewlines = "\n\n";

describe("BBCodeParagraph", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeParagraph;

    it.each`
      dataView         | expected
      ${`<p>TEXT</p>`} | ${`TEXT${prettyPrintNewlines}`}
    `(
      "[$#] Should process '$dataView' to '$expected'",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
