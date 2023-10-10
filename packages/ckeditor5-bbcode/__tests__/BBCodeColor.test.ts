import { requireHTMLElement } from "./DOMUtils";
import { bbCodeColor } from "../src/rules/BBCodeColor";

describe("BBCodeColor", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeColor;

    it.each`
      dataView                                              | expected                         | comment
      ${`<span style="color: #ff0000;">TEXT</span>`}        | ${`[color=#ff0000]TEXT[/color]`} | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<span style="color: #FF0000;">TEXT</span>`}        | ${`[color=#FF0000]TEXT[/color]`} | ${`ignore case`}
      ${`<span style="color: fuchsia;">TEXT</span>`}        | ${`[color=fuchsia]TEXT[/color]`} | ${`supported color names`}
      ${`<span style="color: #ccc;">TEXT</span>`}           | ${`[color=#ccc]TEXT[/color]`}    | ${`support shortened color codes`}
      ${`<span style="color: rgb(255, 0, 0);">TEXT</span>`} | ${undefined}                     | ${`don't handle color codes, we cannot handle (yet?)`}
    `(
      "$[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
