import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeQuote } from "../src/rules/BBCodeQuote";

void describe("BBCodeQuote", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeQuote;

    const cases = [
      {
        dataView: `<blockquote><p>TEXT</p></blockquote>`,
        expected: `[quote]\nTEXT\n[/quote]\n`,
        comment: `newlines for minor pretty-printing`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const element = requireHTMLElement(dataView);
          // Simple processing only applies at one level, so nested tests not possible here.
          const bbCode = rule.toData(element, element.textContent ?? "");
          expect(bbCode).toEqual(expected);
        });
      }
    });
  });
});
