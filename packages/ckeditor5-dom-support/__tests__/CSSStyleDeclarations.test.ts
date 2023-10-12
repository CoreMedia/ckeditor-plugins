import { documentFromHtml, isHTMLElement, rgb, RgbColor } from "../src";
import { getColor } from "../src/CSSStyleDeclarations";

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

describe("CSSStyleDeclarations", () => {
  describe("getColor", () => {
    it.each`
      style                                 | expected                | comment
      ${undefined}                          | ${undefined}            | ${`no color information for no style set`}
      ${"font-weight: bold;"}               | ${undefined}            | ${`no color information for only other styles set`}
      ${"color: #010203;"}                  | ${rgb(1, 2, 3)}         | ${``}
      ${"color: #01020300;"}                | ${rgb(1, 2, 3, 0)}      | ${``}
      ${"color: #010203FF;"}                | ${rgb(1, 2, 3, 1)}      | ${``}
      ${"color: #010203A0;"}                | ${rgb(1, 2, 3, 0.627)}  | ${``}
      ${"color: rgb(1, 2, 3);"}             | ${rgb(1, 2, 3)}         | ${``}
      ${"color: rgba(1, 2, 3, 0.5);"}       | ${rgb(1, 2, 3, 0.5)}    | ${``}
      ${"color: rgba(1, 2, 3, 0.51);"}      | ${rgb(1, 2, 3, 0.51)}   | ${``}
      ${"color: rgba(1, 2, 3, 0.513);"}     | ${rgb(1, 2, 3, 0.513)}  | ${``}
      ${"color: rgba(1, 2, 3, 0.5134);"}    | ${rgb(1, 2, 3, 0.513)}  | ${`alpha truncated`}
      ${"color: fuchsia;"}                  | ${"fuchsia"}            | ${`Color names are not resolved but returned as is.`}
      ${"color: hsl(30, 82%, 43%);"}        | ${rgb(20, 20, 20)}      | ${`CssStyle: rgb(20,20,20); Chrome: rgb(200,110,20)`}
      ${"color: hsla(237, 74%, 33%, 0.5);"} | ${rgb(22, 22, 22, 0.5)} | ${`CssStyle: rgba(22,22,22,0.5); Chrome: rgba(22, 28, 146, 0.5)`}
      ${"color: currentcolor;"}             | ${"currentcolor"}       | ${`handled similar to color name`}
      ${"color: none;"}                     | ${undefined}            | ${`CssStyle as well as Browsers make 'color' unset in this case`}
      ${"color: transparent;"}              | ${"transparent"}        | ${`handled similar to color name`}
    `(
      `[$#] Should parse style '$style' to color: $expected`,
      ({ style: styleDecl, expected }: { style: string; expected: RgbColor | string | undefined }) => {
        const declaration = style(styleDecl);
        const actual = getColor(declaration);
        if (expected === undefined) {
          expect(actual).toBeUndefined();
        } else if (typeof expected === "string") {
          expect(actual).toBe(expected);
        } else {
          expect(actual).toMatchObject(expected);
        }
      },
    );
  });
});
