import { bbCodeSize } from "../src/rules/BBCodeSize";
import { requireHTMLElement } from "./DOMUtils";

describe("BBCodeSize", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeSize;

    it.each`
      dataView                               | expected                | comment
      ${`<span class="text-tiny">T</span>`}  | ${`[size=70]T[/size]`}  | ${`text-tiny mapping to "representing" number`}
      ${`<span class="text-small">T</span>`} | ${`[size=85]T[/size]`}  | ${`text-small mapping to "representing" number`}
      ${`<span class="text-big">T</span>`}   | ${`[size=140]T[/size]`} | ${`text-big mapping to "representing" number`}
      ${`<span class="text-huge">T</span>`}  | ${`[size=180]T[/size]`} | ${`text-huge mapping to "representing" number`}
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
