import { requireHTMLElement } from "./DOMUtils";
import { BBCodeColor, bbCodeColor, ColorMapper } from "../src/rules/BBCodeColor";
import { RgbColor, w3ExtendedColorNames } from "@coremedia/ckeditor5-dom-support";

const reverseW3CColorMap = Object.fromEntries(Object.entries(w3ExtendedColorNames).map(([key, value]) => [value, key]));

const enforceHexRepresentation: ColorMapper = (color: string | RgbColor): string => {
  if (typeof color === "string") {
    return reverseW3CColorMap[color.toLowerCase()] ?? color;
  }
  return color.toHex();
};

describe("BBCodeColor", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeColor;

    it.each`
      dataView                                                     | expected                           | comment
      ${`<span style="color: #ff0001;">TEXT</span>`}               | ${`[color=#ff0001]TEXT[/color]`}   | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<span style="color: #FF0001;">TEXT</span>`}               | ${`[color=#ff0001]TEXT[/color]`}   | ${`ignore case`}
      ${`<span style="color: #ff0000;">TEXT</span>`}               | ${`[color=red]TEXT[/color]`}       | ${`Prefer W3C Color Names`}
      ${`<span style="color: fuchsia;">TEXT</span>`}               | ${`[color=fuchsia]TEXT[/color]`}   | ${`supported color names`}
      ${`<span style="color: #ccc;">TEXT</span>`}                  | ${`[color=#cccccc]TEXT[/color]`}   | ${`support shortened color codes`}
      ${`<span style="color: rgb(255, 0, 0);">TEXT</span>`}        | ${`[color=red]TEXT[/color]`}       | ${`also support rgb() codes`}
      ${`<span style="color: rgba(255, 0, 0, 0.63);">TEXT</span>`} | ${`[color=#ff0000a0]TEXT[/color]`} | ${`also support rgba() codes`}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });

  describe("Custom Color Mapper Configuration", () => {
    const rule = new BBCodeColor({ mapper: enforceHexRepresentation });

    it.each`
      dataView                                              | expected                         | comment
      ${`<span style="color: #ff0000;">TEXT</span>`}        | ${`[color=#ff0000]TEXT[/color]`} | ${``}
      ${`<span style="color: fuchsia;">TEXT</span>`}        | ${`[color=#ff00ff]TEXT[/color]`} | ${`prefer hex over color name`}
      ${`<span style="color: Fuchsia;">TEXT</span>`}        | ${`[color=#ff00ff]TEXT[/color]`} | ${`ignore case`}
      ${`<span style="color: rgb(255, 0, 0);">TEXT</span>`} | ${`[color=#ff0000]TEXT[/color]`} | ${`prefer hex over color name`}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
