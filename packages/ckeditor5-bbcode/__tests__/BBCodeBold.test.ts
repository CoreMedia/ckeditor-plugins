import { requireHTMLElement } from "./DOMUtils";
import { bbCodeBold } from "../src";

describe("BBCodeBold", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeBold;

    it.each`
      dataView                                            | expected         | comment
      ${`<span style="font-weight: bold;">TEXT</span>`}   | ${`[b]TEXT[/b]`} | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<span style="font-weight: bolder;">TEXT</span>`} | ${`[b]TEXT[/b]`} | ${`also supporting _bolder_ to some degree`}
      ${`<strong>TEXT</strong>`}                          | ${`[b]TEXT[/b]`} | ${`CKEditor 5 default data view representation`}
      ${`<b>TEXT</b>`}                                    | ${`[b]TEXT[/b]`} | ${`alternative HTML 5 representation`}
      ${`<b style="font-weight: normal">TEXT</b>`}        | ${undefined}     | ${`vetoed bold tag; undefined, so other rules may kick in`}
      ${`<b style="font-weight: lighter">TEXT</b>`}       | ${undefined}     | ${`vetoed bold tag; undefined, so other rules may kick in`}
      ${`<i style="font-weight: bold;">TEXT</i>`}         | ${`[b]TEXT[/b]`} | ${`corner case: "<i>" itself will be handled by outer rules`}
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
