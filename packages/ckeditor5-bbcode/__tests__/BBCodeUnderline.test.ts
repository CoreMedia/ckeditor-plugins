import { bbCodeUnderline } from "../src";
import { requireHTMLElement } from "./DOMUtils";

describe("BBCodeUnderline", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeUnderline;

    it.each`
      dataView                                                   | expected         | comment
      ${`<span style="text-decoration: underline;">TEXT</span>`} | ${`[u]TEXT[/u]`} | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<u>TEXT</u>`}                                           | ${`[u]TEXT[/u]`} | ${`CKEditor 5 default data view representation`}
      ${`<ins>TEXT</ins>`}                                       | ${`[u]TEXT[/u]`} | ${`alternative HTML5 representation`}
      ${`<u style="text-decoration: none;">TEXT</u>`}            | ${undefined}     | ${`vetoed by style; undefined, so other rules may kick in`}
      ${`<i style="text-decoration: underline;">TEXT</i>`}       | ${`[u]TEXT[/u]`} | ${`corner case: "<i>" itself will be handled by outer rules`}
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
