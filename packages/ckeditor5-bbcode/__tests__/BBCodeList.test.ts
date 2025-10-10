import { bbCodeList } from "../src";
import { requireHTMLElement } from "./DOMUtils";

// No integration test here. Simulate, we already mapped the children.
const mockListItemsContent = (el: HTMLElement): string =>
  Array.from(el.children)
    .map((e) => `[*] ${e.textContent ?? ""}`)
    .join("\n");

describe("BBCodeList", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeList;

    it.each`
      dataView                                                         | expected                           | comment
      ${`<ul><li>TEXT</li></ul>`}                                      | ${`[list]\n[*] TEXT\n[/list]\n`}   | ${""}
      ${`<ol><li>TEXT</li></ol>`}                                      | ${`[list=1]\n[*] TEXT\n[/list]\n`} | ${""}
      ${`<ol type="1"><li>TEXT</li></ol>`}                             | ${`[list=1]\n[*] TEXT\n[/list]\n`} | ${""}
      ${`<ol type="a"><li>TEXT</li></ol>`}                             | ${`[list=a]\n[*] TEXT\n[/list]\n`} | ${""}
      ${`<ol type="A"><li>TEXT</li></ol>`}                             | ${`[list=A]\n[*] TEXT\n[/list]\n`} | ${""}
      ${`<ol type="i"><li>TEXT</li></ol>`}                             | ${`[list=i]\n[*] TEXT\n[/list]\n`} | ${""}
      ${`<ol type="I"><li>TEXT</li></ol>`}                             | ${`[list=I]\n[*] TEXT\n[/list]\n`} | ${""}
      ${`<ol style="list-style-type: lower-roman"><li>TEXT</li></ol>`} | ${`[list=1]\n[*] TEXT\n[/list]\n`} | ${"Due to BBob Preset-HTML5 Restrictions not respecting list-style-type for now."}
      ${`<ul><li>TEXT\n\n</li></ul>`}                                  | ${`[list]\n[*] TEXT\n[/list]\n`}   | ${"pretty-print trimming"}
    `(
      "[$#] Should process '$dataView' to '$expected' ($comment)",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const element = requireHTMLElement(dataView);
        const content = mockListItemsContent(element);
        const bbCode = rule.toData(element, content);
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
