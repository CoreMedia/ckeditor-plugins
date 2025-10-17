import test, { describe } from "node:test";
import expect from "expect";
import type { RequireSelected } from "@coremedia/ckeditor5-common";
import { documentFromHtml, isHTMLElement, rgb, RgbColor } from "../src";
import type { FontWeightInformation } from "../src/CSSStyleDeclarations";
import { fontWeightToNumber, getFontWeight, getColor, getFontWeightNumeric } from "../src/CSSStyleDeclarations";

const parseFirstElement = (html: string): Element | undefined =>
  documentFromHtml(html).body.firstElementChild ?? undefined;
const asHTMLElement = (value: unknown): HTMLElement | undefined => (isHTMLElement(value) ? value : undefined);
export const parseHTMLElement = (html: string): HTMLElement | undefined => asHTMLElement(parseFirstElement(html));
export const requireHTMLElement = (html: string): HTMLElement => {
  const parsed = parseHTMLElement(html);
  if (!parsed) {
    throw new Error(`Failed parsing and getting required HTMLElement from: ${html}.`);
  }
  return parsed;
};

const style = (s?: string): CSSStyleDeclaration => {
  let element: HTMLElement;
  if (s === undefined) {
    element = requireHTMLElement(`<span>TEXT</span>`);
  } else {
    element = requireHTMLElement(`<span style="${s}">TEXT</span>`);
  }
  return element.style;
};

void describe("CSSStyleDeclarations", () => {
  void describe("getColor", () => {
    const cases: { style: string | undefined; expected: RgbColor | string | undefined; comment: string }[] = [
      { style: undefined, expected: undefined, comment: `no color information for no style set` },
      { style: "font-weight: bold;", expected: undefined, comment: `no color information for only other styles set` },
      { style: "color: #010203;", expected: rgb(1, 2, 3), comment: `` },
      { style: "color: #01020300;", expected: rgb(1, 2, 3, 0), comment: `` },
      { style: "color: #010203FF;", expected: rgb(1, 2, 3), comment: `` },
      { style: "color: #010203A0;", expected: rgb(1, 2, 3, 0.627), comment: `` },
      { style: "color: rgb(1, 2, 3);", expected: rgb(1, 2, 3), comment: `` },
      { style: "color: rgba(1, 2, 3, 0.5);", expected: rgb(1, 2, 3, 0.5), comment: `` },
      { style: "color: rgba(1, 2, 3, 0.51);", expected: rgb(1, 2, 3, 0.51), comment: `` },
      { style: "color: rgba(1, 2, 3, 0.513);", expected: rgb(1, 2, 3, 0.513), comment: `` },
      { style: "color: rgba(1, 2, 3, 0.5134);", expected: rgb(1, 2, 3, 0.513), comment: `alpha truncated` },
      { style: "color: fuchsia;", expected: "fuchsia", comment: `Color names are not resolved but returned as is.` },
      {
        style: "color: hsl(30, 82%, 43%);",
        expected: rgb(200, 110, 20),
        comment: `CssStyle: rgb(20,20,20); Chrome: rgb(200,110,20)`,
      },
      {
        style: "color: hsla(237, 74%, 33%, 0.5);",
        expected: rgb(22, 28, 146, 0.5),
        comment: `CssStyle: rgba(22,22,22,0.5); Chrome: rgba(22, 28, 146, 0.5)`,
      },
      { style: "color: currentcolor;", expected: "currentcolor", comment: `handled similar to color name` },
      {
        style: "color: none;",
        expected: undefined,
        comment: `CssStyle as well as Browsers make 'color' unset in this case`,
      },
      { style: "color: transparent;", expected: "transparent", comment: `handled similar to color name` },
    ];

    for (const [i, { style: styleDecl, expected, comment }] of cases.entries()) {
      void test(`[${i}] Should parse style '${styleDecl}' to color: ${expected} — ${comment}`, () => {
        const declaration = style(styleDecl);
        const actual = getColor(declaration);
        if (expected === undefined) {
          expect(actual).toBeUndefined();
        } else if (typeof expected === "string") {
          expect(actual).toBe(expected);
        } else {
          if (actual instanceof RgbColor) {
            // Node’s native test runner is stricter than Jest when comparing class instances.
            // Therefore, compare plain objects here
            expect({ ...actual }).toMatchObject({ ...expected });
          }
        }
      });
    }
  });

  void describe("getFontWeightNumeric", () => {
    void describe("getFontWeightNumeric", () => {
      const cases = [
        { style: undefined, expected: undefined, comment: `unset style` },
        { style: "color: fuchsia;", expected: undefined, comment: `No font-weight information.` },
        { style: "font-weight: bold;", expected: fontWeightToNumber.bold, comment: `` },
        { style: "font-weight: bolder;", expected: fontWeightToNumber.bolder, comment: `` },
        { style: "font-weight: lighter;", expected: fontWeightToNumber.lighter, comment: `` },
        { style: "font-weight: normal;", expected: fontWeightToNumber.normal, comment: `` },
        { style: "font-weight: inherit;", expected: undefined, comment: `` },
        { style: "font-weight: initial;", expected: undefined, comment: `` },
        { style: "font-weight: unset;", expected: undefined, comment: `` },
        { style: "font-weight: 1;", expected: 1, comment: `Minimum font-weight` },
        { style: "font-weight: 1000;", expected: 1000, comment: `Maximum font-weight` },
        { style: "font-weight: 400;", expected: 400, comment: `` },
        { style: "font-weight: 700;", expected: 700, comment: `` },
        { style: "font-weight: 900;", expected: 900, comment: `` },
      ];

      for (const [i, { style: styleDecl, expected, comment }] of cases.entries()) {
        void test(`[${i}] Should parse style '${styleDecl}' to numeric font-weight: ${expected} — ${comment}`, () => {
          const declaration = style(styleDecl);
          const actual = getFontWeightNumeric(declaration);
          expect(actual).toBe(expected);
        });
      }
    });
  });

  void describe("getFontWeight", () => {
    const fwAll = (asText: string, asNumber: number): Required<FontWeightInformation> => ({
      asText,
      asNumber,
    });
    const fwText = (asText: string, asNumber?: number): RequireSelected<FontWeightInformation, "asText"> =>
      asNumber === undefined
        ? {
            asText,
          }
        : fwAll(asText, asNumber);
    const fwNumber = (
      asText: string | undefined,
      asNumber: number,
    ): RequireSelected<FontWeightInformation, "asNumber"> =>
      asText === undefined
        ? {
            asNumber,
          }
        : fwAll(asText, asNumber);
    // Both are undefined? Use `undefined` directly in expected test data, please.
    const fw = (asText?: string, asNumber?: number): undefined | FontWeightInformation =>
      asText === undefined
        ? asNumber === undefined
          ? undefined
          : fwNumber(asText, asNumber)
        : fwText(asText, asNumber);

    const cases = [
      { style: undefined, expected: undefined, comment: `unset style` },
      { style: "color: fuchsia;", expected: undefined, comment: `No font-weight information.` },
      { style: "font-weight: bold;", expected: fw("bold", fontWeightToNumber.bold), comment: `` },
      { style: "font-weight: bolder;", expected: fw("bolder", fontWeightToNumber.bolder), comment: `` },
      { style: "font-weight: lighter;", expected: fw("lighter", fontWeightToNumber.lighter), comment: `` },
      { style: "font-weight: normal;", expected: fw("normal", fontWeightToNumber.normal), comment: `` },
      { style: "font-weight: inherit;", expected: fw("inherit"), comment: `` },
      { style: "font-weight: initial;", expected: fw("initial"), comment: `` },
      { style: "font-weight: unset;", expected: fw("unset"), comment: `` },
      { style: "font-weight: 1;", expected: fw(undefined, 1), comment: `Minimum font-weight` },
      { style: "font-weight: 1000;", expected: fw(undefined, 1000), comment: `Maximum font-weight` },
      {
        style: "font-weight: 100;",
        expected: fw(undefined, fontWeightToNumber.lighter),
        comment: `Design Scope: Don't "guess" relative weights from bare numbers.`,
      },
      { style: "font-weight: 400;", expected: fw("normal", fontWeightToNumber.normal), comment: `` },
      { style: "font-weight: 700;", expected: fw("bold", fontWeightToNumber.bold), comment: `` },
      {
        style: "font-weight: 900;",
        expected: fw(undefined, fontWeightToNumber.bolder),
        comment: `Design Scope: Don't "guess" relative weights from bare numbers.`,
      },
    ];

    for (const [i, { style: styleDecl, expected, comment }] of cases.entries()) {
      void test(`[${i}] Should parse style '${styleDecl}' to font-weight: ${expected} — ${comment}`, () => {
        const declaration = style(styleDecl);
        const actual = getFontWeight(declaration);
        if (expected === undefined) {
          expect(actual).toBeUndefined();
        } else {
          // @ts-expect-error ts seems to think that toMatchObject cant handle FontWeightInformation
          expect(actual).toMatchObject(expected);
        }
      });
    }
  });
});
