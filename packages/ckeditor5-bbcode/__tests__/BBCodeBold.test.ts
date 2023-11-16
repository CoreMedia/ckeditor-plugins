import { requireHTMLElement } from "./DOMUtils";
import { BBCodeBold, bbCodeBold } from "../src";
import { IsBoldFontWeight } from "../src/rules/BBCodeBold";

describe("BBCodeBold", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeBold;

    it.each`
      dataView                                            | expected         | comment
      ${`<span style="font-weight: bold;">TEXT</span>`}   | ${`[b]TEXT[/b]`} | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<span style="font-weight: bolder;">TEXT</span>`} | ${`[b]TEXT[/b]`} | ${`also supporting _bolder_ to some degree`}
      ${`<strong>TEXT</strong>`}                          | ${`[b]TEXT[/b]`} | ${`CKEditor 5 default data view representation`}
      ${`<b>TEXT</b>`}                                    | ${`[b]TEXT[/b]`} | ${`alternative HTML 5 representation`}
      ${`<b style="font-weight: normal;">TEXT</b>`}       | ${undefined}     | ${`vetoed bold tag; undefined, so other rules may kick in`}
      ${`<b style="font-weight: lighter;">TEXT</b>`}      | ${undefined}     | ${`vetoed bold tag; undefined, so other rules may kick in`}
      ${`<b style="font-weight: bold;">TEXT</b>`}         | ${`[b]TEXT[/b]`} | ${`weight and tag agree`}
      ${`<b style="font-weight: 400;">TEXT</b>`}          | ${undefined}     | ${`veto by numeric font-weight (400)`}
      ${`<span style="font-weight: 700;">TEXT</span>`}    | ${`[b]TEXT[/b]`} | ${`Bold just by font-weight.`}
      ${`<strong style="font-weight: 1;">TEXT</strong>`}  | ${undefined}     | ${`Minimum font-weight.`}
      ${`<span style="font-weight: 1000;">TEXT</span>`}   | ${`[b]TEXT[/b]`} | ${`Maximum font-weight.`}
      ${`<i style="font-weight: bold;">TEXT</i>`}         | ${`[b]TEXT[/b]`} | ${`corner case: "<i>" itself will be handled by outer rules`}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element, element.textContent ?? "");
        expect(bbCode).toEqual(expected);
      },
    );
  });

  describe("Custom Configuration", () => {
    /**
     * For demonstration only: Don't judge on font-weight, just on tag name.
     */
    const ignoreFontWeight: IsBoldFontWeight = (assumedBold) => assumedBold;
    const rule = new BBCodeBold({
      isBold: ignoreFontWeight,
    });

    it.each`
      dataView                                            | expected         | comment
      ${`<span style="font-weight: bold;">TEXT</span>`}   | ${undefined}     | ${`Respect custom isBold rule to ignore font-weight style`}
      ${`<span style="font-weight: bolder;">TEXT</span>`} | ${undefined}     | ${`Respect custom isBold rule to ignore font-weight style`}
      ${`<strong>TEXT</strong>`}                          | ${`[b]TEXT[/b]`} | ${`CKEditor 5 default data view representation`}
      ${`<b style="font-weight: normal;">TEXT</b>`}       | ${`[b]TEXT[/b]`} | ${`Respect custom isBold rule to ignore font-weight style`}
      ${`<b style="font-weight: lighter;">TEXT</b>`}      | ${`[b]TEXT[/b]`} | ${`Respect custom isBold rule to ignore font-weight style`}
      ${`<b style="font-weight: 400;">TEXT</b>`}          | ${`[b]TEXT[/b]`} | ${`Respect custom isBold rule to ignore font-weight style`}
      ${`<span style="font-weight: 700;">TEXT</span>`}    | ${undefined}     | ${`Respect custom isBold rule to ignore font-weight style`}
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
