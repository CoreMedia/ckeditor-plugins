import { p, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/CodeElements";
import { bijective, TestDirection } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("CodeElements", () => {
  const ruleConfigurations = [aut.codeElements];
  const text = "T";

  describe.each`
    data                                             | direction    | view
    ${`<span class="code">${text}</span>`}           | ${bijective} | ${`<code>${text}</code>`}
    ${`<span class="CLASS code">${text}</span>`}     | ${bijective} | ${`<code class="CLASS">${text}</code>`}
    ${`<span dir="ltr" class="code">${text}</span>`} | ${bijective} | ${`<code dir="ltr">${text}</code>`}
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
    },
  );
});
