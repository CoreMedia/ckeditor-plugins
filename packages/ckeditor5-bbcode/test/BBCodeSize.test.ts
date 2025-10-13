import "global-jsdom/register";
import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import { bbCodeSize } from "../src/rules/BBCodeSize";
import { requireHTMLElement } from "./DOMUtils";

void describe("BBCodeSize", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeSize;

    const cases = [
      {
        dataView: `<span class="text-tiny">T</span>`,
        expected: `[size=70]T[/size]`,
        comment: `text-tiny mapping to "representing" number`,
      },
      {
        dataView: `<span class="text-small">T</span>`,
        expected: `[size=85]T[/size]`,
        comment: `text-small mapping to "representing" number`,
      },
      {
        dataView: `<span class="text-big">T</span>`,
        expected: `[size=140]T[/size]`,
        comment: `text-big mapping to "representing" number`,
      },
      {
        dataView: `<span class="text-huge">T</span>`,
        expected: `[size=180]T[/size]`,
        comment: `text-huge mapping to "representing" number`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const element = requireHTMLElement(dataView);
          const bbCode = rule.toData(element, element.textContent ?? "");
          expect(bbCode).toEqual(expected);
        });
      }
    });
  });
});
