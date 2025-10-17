import "global-jsdom/register";
import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import type { IsBoldFontWeight } from "../src/rules/BBCodeBold";
import { BBCodeBold, bbCodeBold } from "../src/rules/BBCodeBold";
import { requireHTMLElement } from "./DOMUtils";

void describe("BBCodeBold", () => {
  void describe("Default Configuration", () => {
    const rule = bbCodeBold;

    const cases = [
      {
        dataView: `<span style="font-weight: bold;">TEXT</span>`,
        expected: `[b]TEXT[/b]`,
        comment: `BBob HTML 5 Preset Result (toView)`,
      },
      {
        dataView: `<span style="font-weight: bolder;">TEXT</span>`,
        expected: `[b]TEXT[/b]`,
        comment: `also supporting _bolder_ to some degree`,
      },
      {
        dataView: `<strong>TEXT</strong>`,
        expected: `[b]TEXT[/b]`,
        comment: `CKEditor 5 default data view representation`,
      },
      {
        dataView: `<b>TEXT</b>`,
        expected: `[b]TEXT[/b]`,
        comment: `alternative HTML 5 representation`,
      },
      {
        dataView: `<b style="font-weight: normal;">TEXT</b>`,
        expected: undefined,
        comment: `vetoed bold tag; undefined, so other rules may kick in`,
      },
      {
        dataView: `<b style="font-weight: lighter;">TEXT</b>`,
        expected: undefined,
        comment: `vetoed bold tag; undefined, so other rules may kick in`,
      },
      {
        dataView: `<b style="font-weight: bold;">TEXT</b>`,
        expected: `[b]TEXT[/b]`,
        comment: `weight and tag agree`,
      },
      {
        dataView: `<b style="font-weight: 400;">TEXT</b>`,
        expected: undefined,
        comment: `veto by numeric font-weight (400)`,
      },
      {
        dataView: `<span style="font-weight: 700;">TEXT</span>`,
        expected: `[b]TEXT[/b]`,
        comment: `Bold just by font-weight.`,
      },
      {
        dataView: `<strong style="font-weight: 1;">TEXT</strong>`,
        expected: undefined,
        comment: `Minimum font-weight.`,
      },
      {
        dataView: `<span style="font-weight: 1000;">TEXT</span>`,
        expected: `[b]TEXT[/b]`,
        comment: `Maximum font-weight.`,
      },
      {
        dataView: `<i style="font-weight: bold;">TEXT</i>`,
        expected: `[b]TEXT[/b]`,
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

  void describe("Custom Configuration", () => {
    /**
     * For demonstration only: Don't judge on font-weight, just on tag name.
     */
    const ignoreFontWeight: IsBoldFontWeight = (assumedBold) => assumedBold;
    const rule = new BBCodeBold({
      isBold: ignoreFontWeight,
    });

    const cases = [
      {
        dataView: `<span style="font-weight: bold;">TEXT</span>`,
        expected: undefined,
        comment: `Respect custom isBold rule to ignore font-weight style`,
      },
      {
        dataView: `<span style="font-weight: bolder;">TEXT</span>`,
        expected: undefined,
        comment: `Respect custom isBold rule to ignore font-weight style`,
      },
      {
        dataView: `<strong>TEXT</strong>`,
        expected: `[b]TEXT[/b]`,
        comment: `CKEditor 5 default data view representation`,
      },
      {
        dataView: `<b style="font-weight: normal;">TEXT</b>`,
        expected: `[b]TEXT[/b]`,
        comment: `Respect custom isBold rule to ignore font-weight style`,
      },
      {
        dataView: `<b style="font-weight: lighter;">TEXT</b>`,
        expected: `[b]TEXT[/b]`,
        comment: `Respect custom isBold rule to ignore font-weight style`,
      },
      {
        dataView: `<b style="font-weight: 400;">TEXT</b>`,
        expected: `[b]TEXT[/b]`,
        comment: `Respect custom isBold rule to ignore font-weight style`,
      },
      {
        dataView: `<span style="font-weight: 700;">TEXT</span>`,
        expected: undefined,
        comment: `Respect custom isBold rule to ignore font-weight style`,
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
