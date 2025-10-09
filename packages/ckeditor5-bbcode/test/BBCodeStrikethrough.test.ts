import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeStrikethrough } from "../src/rules/BBCodeStrikethrough";

void describe("BBCodeStrikethrough", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeStrikethrough;

    const cases = [
      {
        dataView: `<span style="text-decoration: line-through;">TEXT</span>`,
        expected: `[s]TEXT[/s]`,
        comment: `BBob HTML 5 Preset Result (toView)`,
      },
      {
        dataView: `<s>TEXT</s>`,
        expected: `[s]TEXT[/s]`,
        comment: `CKEditor 5 default data view representation`,
      },
      {
        dataView: `<del>TEXT</del>`,
        expected: `[s]TEXT[/s]`,
        comment: `alternative HTML5 representation`,
      },
      {
        dataView: `<strike>TEXT</strike>`,
        expected: `[s]TEXT[/s]`,
        comment: `alternative (deprecated) representation`,
      },
      {
        dataView: `<s style="text-decoration: none;">TEXT</s>`,
        expected: undefined,
        comment: `vetoed by style; undefined, so other rules may kick in`,
      },
      {
        dataView: `<i style="text-decoration: line-through;">TEXT</i>`,
        expected: `[s]TEXT[/s]`,
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
