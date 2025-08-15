import { bbCodeStrikethrough } from "../src";
import { requireHTMLElement } from "./DOMUtils";

describe("BBCodeStrikethrough", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeStrikethrough;

    // noinspection HtmlDeprecatedTag,XmlDeprecatedElement
    it.each`
      dataView                                                      | expected         | comment
      ${`<span style="text-decoration: line-through;">TEXT</span>`} | ${`[s]TEXT[/s]`} | ${`BBob HTML 5 Preset Result (toView)`}
      ${`<s>TEXT</s>`}                                              | ${`[s]TEXT[/s]`} | ${`CKEditor 5 default data view representation`}
      ${`<del>TEXT</del>`}                                          | ${`[s]TEXT[/s]`} | ${`alternative HTML5 representation`}
      ${`<strike>TEXT</strike>`}                                    | ${`[s]TEXT[/s]`} | ${`alternative (deprecated) representation`}
      ${`<s style="text-decoration: none;">TEXT</s>`}               | ${undefined}     | ${`vetoed by style; undefined, so other rules may kick in`}
      ${`<i style="text-decoration: line-through;">TEXT</i>`}       | ${`[s]TEXT[/s]`} | ${`corner case: "<i>" itself will be handled by outer rules`}
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
