import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeUnderline } from "../src/rules/BBCodeUnderline";

void describe("BBCodeUnderline", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeUnderline;

    const cases = [
      {
        dataView: `<span style="text-decoration: underline;">TEXT</span>`,
        expected: `[u]TEXT[/u]`,
        comment: `BBob HTML 5 Preset Result (toView)`,
      },
      {
        dataView: `<u>TEXT</u>`,
        expected: `[u]TEXT[/u]`,
        comment: `CKEditor 5 default data view representation`,
      },
      {
        dataView: `<ins>TEXT</ins>`,
        expected: `[u]TEXT[/u]`,
        comment: `alternative HTML5 representation`,
      },
      {
        dataView: `<u style="text-decoration: none;">TEXT</u>`,
        expected: undefined,
        comment: `vetoed by style; undefined, so other rules may kick in`,
      },
      {
        dataView: `<i style="text-decoration: underline;">TEXT</i>`,
        expected: `[u]TEXT[/u]`,
        comment: `corner case: "<i>" itself will be handled by outer rules`,
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
