import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
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
  test("Default Configuration", async (t: TestContext) => {
    const rule = bbCodeColor;

    const cases: { dataView: string; expected: string; comment: string }[] = [
      {
        dataView: `<span style="color: #ff0001;">TEXT</span>`,
        expected: `[color=#ff0001]TEXT[/color]`,
        comment: "BBob HTML 5 Preset Result (toView)",
      },
      {
        dataView: `<span style="color: #FF0001;">TEXT</span>`,
        expected: `[color=#ff0001]TEXT[/color]`,
        comment: "ignore case",
      },
      {
        dataView: `<span style="color: #ff0000;">TEXT</span>`,
        expected: `[color=red]TEXT[/color]`,
        comment: "Prefer W3C Color Names",
      },
      {
        dataView: `<span style="color: fuchsia;">TEXT</span>`,
        expected: `[color=fuchsia]TEXT[/color]`,
        comment: "supported color names",
      },
      {
        dataView: `<span style="color: #ccc;">TEXT</span>`,
        expected: `[color=#cccccc]TEXT[/color]`,
        comment: "support shortened color codes",
      },
      {
        dataView: `<span style="color: rgb(255, 0, 0);">TEXT</span>`,
        expected: `[color=red]TEXT[/color]`,
        comment: "also support rgb() codes",
      },
      {
        dataView: `<span style="color: rgba(255, 0, 0, 0.63);">TEXT</span>`,
        expected: `[color=#ff0000a0]TEXT[/color]`,
        comment: "also support rgba() codes",
      },
    ];

    for (const { dataView, expected, comment } of cases) {
      await t.test(`Should process '${dataView}' to '${expected}' (${comment})`, () => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      });
    }
  });

  test("Custom Color Mapper Configuration", async (t: TestContext) => {
    const rule = new BBCodeColor({ mapper: enforceHexRepresentation });

    const cases: { dataView: string; expected: string; comment: string }[] = [
      {
        dataView: `<span style="color: #ff0000;">TEXT</span>`,
        expected: `[color=#ff0000]TEXT[/color]`,
        comment: "",
      },
      {
        dataView: `<span style="color: fuchsia;">TEXT</span>`,
        expected: `[color=#ff00ff]TEXT[/color]`,
        comment: "prefer hex over color name",
      },
      {
        dataView: `<span style="color: Fuchsia;">TEXT</span>`,
        expected: `[color=#ff00ff]TEXT[/color]`,
        comment: "ignore case",
      },
      {
        dataView: `<span style="color: rgb(255, 0, 0);">TEXT</span>`,
        expected: `[color=#ff0000]TEXT[/color]`,
        comment: "prefer hex over color name",
      },
    ];

    for (const { dataView, expected, comment } of cases) {
      await t.test(`Should process '${dataView}' to '${expected}' (${comment})`, () => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      });
    }
  });
});
