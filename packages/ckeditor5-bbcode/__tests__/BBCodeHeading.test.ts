import { requireHTMLElement } from "./DOMUtils";
import { bbCodeHeading } from "../src";

const prettyPrintNewlines = "\n\n";

describe("BBCodeHeading", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeHeading;

    it.each`
      dataView           | expected
      ${`<h1>TEXT</h1>`} | ${`[h1]TEXT[/h1]${prettyPrintNewlines}`}
      ${`<h2>TEXT</h2>`} | ${`[h2]TEXT[/h2]${prettyPrintNewlines}`}
      ${`<h3>TEXT</h3>`} | ${`[h3]TEXT[/h3]${prettyPrintNewlines}`}
      ${`<h4>TEXT</h4>`} | ${`[h4]TEXT[/h4]${prettyPrintNewlines}`}
      ${`<h5>TEXT</h5>`} | ${`[h5]TEXT[/h5]${prettyPrintNewlines}`}
      ${`<h6>TEXT</h6>`} | ${`[h6]TEXT[/h6]${prettyPrintNewlines}`}
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
