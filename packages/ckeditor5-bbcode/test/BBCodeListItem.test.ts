import "global-jsdom/register";
import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import { bbCodeListItem } from "../src/rules/BBCodeListItem";
import { asHTMLElement, requireHTMLElement } from "./DOMUtils";

void describe("BBCodeListItem", () => {
  void test("Default Configuration", async (t: TestContext) => {
    const rule = bbCodeListItem;

    const cases: { dataView: string; expected: string }[] = [{ dataView: `<li>TEXT</li>`, expected: `[*] TEXT\n` }];

    for (const { dataView, expected } of cases) {
      await t.test(`Should process '${dataView}' to '${expected}'`, () => {
        const embeddedInListDataView = `<ul>${dataView}</ul>`;
        const listElement = requireHTMLElement(embeddedInListDataView);
        const element = asHTMLElement(listElement.firstElementChild);
        if (!element) {
          throw new Error(`Test setup error: Could not find the required <li> element: ${embeddedInListDataView}.`);
        }
        const content = element.textContent ?? "";
        const bbCode = rule.toData(element, content);
        expect(bbCode).toEqual(expected);
      });
    }
  });
});
