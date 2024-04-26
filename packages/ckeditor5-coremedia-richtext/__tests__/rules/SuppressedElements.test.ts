import * as aut from "../../src/rules/SuppressedElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichTextBase";
import { TestDirection, toData } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("SuppressedElements", () => {
  const ruleConfigurations = aut.suppressedElements;

  const text = "T";

  // Disabled since figure is not suppressed anymore.
  // We should make sure we don't need to suppress figures for tables
  xdescribe.each`
    data                                                         | direction | view
    ${`<table><tbody><tr><td>${text}</td></tr></tbody></table>`} | ${toData} | ${`<figure class="table"><table><tbody><tr><td>${text}</td></tr></tbody></table></figure>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      const tester = new RulesTester(ruleConfigurations, "*", "body > *");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    },
  );
});
