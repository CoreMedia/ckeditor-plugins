import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeHeading } from "../src/rules/BBCodeHeading";

const prettyPrintNewlines = "\n\n";

void describe("BBCodeHeading", () => {
  void test("Default Configuration", async (t: TestContext) => {
    const rule = bbCodeHeading;

    const cases: { dataView: string; expected: string }[] = [
      { dataView: `<h1>TEXT</h1>`, expected: `[h1]TEXT[/h1]${prettyPrintNewlines}` },
      { dataView: `<h2>TEXT</h2>`, expected: `[h2]TEXT[/h2]${prettyPrintNewlines}` },
      { dataView: `<h3>TEXT</h3>`, expected: `[h3]TEXT[/h3]${prettyPrintNewlines}` },
      { dataView: `<h4>TEXT</h4>`, expected: `[h4]TEXT[/h4]${prettyPrintNewlines}` },
      { dataView: `<h5>TEXT</h5>`, expected: `[h5]TEXT[/h5]${prettyPrintNewlines}` },
      { dataView: `<h6>TEXT</h6>`, expected: `[h6]TEXT[/h6]${prettyPrintNewlines}` },
    ];

    for (const { dataView, expected } of cases) {
      await t.test(`Should process '${dataView}' to '${expected}'`, () => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      });
    }
  });
});
