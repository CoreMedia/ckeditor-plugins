import "global-jsdom/register";
import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import { bbCodeParagraph } from "../src/rules/BBCodeParagraph";
import { requireHTMLElement } from "./DOMUtils";

const prettyPrintNewlines = "\n\n";

void describe("BBCodeParagraph", () => {
  void test("Default Configuration", async (t: TestContext) => {
    const rule = bbCodeParagraph;

    const cases: { dataView: string; expected: string }[] = [
      { dataView: `<p>TEXT</p>`, expected: `TEXT${prettyPrintNewlines}` },
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
