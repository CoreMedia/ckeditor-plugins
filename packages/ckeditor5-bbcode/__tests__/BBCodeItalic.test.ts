import { requireHTMLElement } from "./DOMUtils";
import { bbCodeItalic } from "../src";

describe("BBCodeItalic", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeItalic;

    it.each`
      dataView                                           | expected         | comment
      ${`<span style="font-style: italic;">TEXT</span>`} | ${`[i]TEXT[/i]`} | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<i>TEXT</i>`}                                   | ${`[i]TEXT[/i]`} | ${`CKEditor 5 default data view representation`}
      ${`<em>TEXT</em>`}                                 | ${`[i]TEXT[/i]`} | ${`alternative HTML 5 representation`}
      ${`<i style="font-style: normal">TEXT</i>`}        | ${undefined}     | ${`vetoed italic tag; undefined, so other rules may kick in`}
      ${`<b style="font-style: italic;">TEXT</b>`}       | ${`[i]TEXT[/i]`} | ${`Corner case: "<b>" will be handled by outer rules.`}
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
