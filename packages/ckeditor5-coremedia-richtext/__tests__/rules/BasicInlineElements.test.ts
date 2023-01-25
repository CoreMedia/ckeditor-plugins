import * as aut from "../../src/rules/BasicInlineElements";
import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/RichTextBase";
import { bijective, TestDirection, toData } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("BasicInlineElements", () => {
  const ruleConfigurations = aut.basicInlineElements;
  const text = "T";

  describe.each`
    data                                        | direction    | view
    ${`<strong>${text}</strong>`}               | ${toData}    | ${`<b>${text}</b>`}
    ${`<span class="underline">${text}</span>`} | ${bijective} | ${`<u>${text}</u>`}
    ${`<em>${text}</em>`}                       | ${bijective} | ${`<i>${text}</i>`}
    ${`<span class="strike">${text}</span>`}    | ${bijective} | ${`<s>${text}</s>`}
    ${`<span class="strike">${text}</span>`}    | ${toData}    | ${`<del>${text}</del>`}
    ${`<span class="strike">${text}</span>`}    | ${toData}    | ${`<strike>${text}</strike>`}
  `(
    "[$#] Should provide mapping from data $direction view: $data $direction $view",
    ({ data, direction, view }: { data: string; direction: TestDirection; view: string }) => {
      const dataString = richtext(p(data));
      const htmlString = `<body><p>${view}</p></body>`;
      const tester = new RulesTester(ruleConfigurations, "p > *");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    }
  );
});
