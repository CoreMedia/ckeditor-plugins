import { asHTMLElement, requireHTMLElement } from "./DOMUtils";
import { bbCodeListItem } from "../src";

describe("BBCodeListItem", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeListItem;

    it.each`
      dataView           | expected
      ${`<li>TEXT</li>`} | ${`[*] TEXT\n`}
    `(
      "$[$#] Should process '$dataView' to '$expected'",
      ({ dataView, expected }: { dataView: string; expected: string | undefined }) => {
        const embeddedInListDataView = `<ul>${dataView}</ul>`;
        const listElement = requireHTMLElement(embeddedInListDataView);
        const element = asHTMLElement(listElement.firstElementChild);
        if (!element) {
          throw new Error(`Test setup error: Could not find the required <li> element: ${embeddedInListDataView}.`);
        }
        const content = element.textContent ?? "";
        const bbCode = rule.toData(element, content);
        expect(bbCode).toEqual(expected);
      },
    );
  });
});
