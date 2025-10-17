import "global-jsdom/register";
import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import { bbCodeList } from "../src/rules/BBCodeList";
import { requireHTMLElement } from "./DOMUtils";

// No integration test here. Simulate, we already mapped the children.
const mockListItemsContent = (el: HTMLElement): string =>
  Array.from(el.children)
    .map((e) => `[*] ${e.textContent ?? ""}`)
    .join("\n");

void describe("BBCodeList", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeList;

    const cases = [
      {
        dataView: `<ul><li>TEXT</li></ul>`,
        expected: `[list]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol><li>TEXT</li></ol>`,
        expected: `[list=1]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol type="1"><li>TEXT</li></ol>`,
        expected: `[list=1]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol type="a"><li>TEXT</li></ol>`,
        expected: `[list=a]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol type="A"><li>TEXT</li></ol>`,
        expected: `[list=A]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol type="i"><li>TEXT</li></ol>`,
        expected: `[list=i]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol type="I"><li>TEXT</li></ol>`,
        expected: `[list=I]\n[*] TEXT\n[/list]\n`,
        comment: ``,
      },
      {
        dataView: `<ol style="list-style-type: lower-roman"><li>TEXT</li></ol>`,
        expected: `[list=1]\n[*] TEXT\n[/list]\n`,
        comment: `Due to BBob Preset-HTML5 Restrictions not respecting list-style-type for now.`,
      },
      {
        dataView: `<ul><li>TEXT\n\n</li></ul>`,
        expected: `[list]\n[*] TEXT\n[/list]\n`,
        comment: `pretty-print trimming`,
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const element = requireHTMLElement(dataView);
          const content = mockListItemsContent(element);
          const bbCode = rule.toData(element, content);
          expect(bbCode).toEqual(expected);
        });
      }
    });
  });
});
