import "global-jsdom/register";
import test, { TestContext, describe } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeItalic } from "../src/rules/BBCodeItalic";

void describe("BBCodeItalic", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeItalic;

    const cases = [
      {
        dataView: `<span style="font-style: italic;">TEXT</span>`,
        expected: `[i]TEXT[/i]`,
        comment: `BBob HTML 5 Preset Result (toView)`,
      },
      {
        dataView: `<i>TEXT</i>`,
        expected: `[i]TEXT[/i]`,
        comment: `CKEditor 5 default data view representation`,
      },
      {
        dataView: `<em>TEXT</em>`,
        expected: `[i]TEXT[/i]`,
        comment: `alternative HTML 5 representation`,
      },
      {
        dataView: `<i style="font-style: normal">TEXT</i>`,
        expected: undefined,
        comment: `vetoed italic tag; undefined, so other rules may kick in`,
      },
      {
        dataView: `<b style="font-style: italic;">TEXT</b>`,
        expected: `[i]TEXT[/i]`,
        comment: `Corner case: "<b>" will be handled by outer rules.`,
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
