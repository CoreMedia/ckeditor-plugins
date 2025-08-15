import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/DivElements";
import { bijective, TestDirection } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("DivElements", () => {
  const ruleConfigurations = [aut.divElements];
  const text = "T";

  describe.each`
    data                                     | direction    | view
    ${`<p class="p--div">${text}</p>`}       | ${bijective} | ${`<div>${text}</div>`}
    ${`<p class="CLASS p--div">${text}</p>`} | ${bijective} | ${`<div class="CLASS">${text}</div>`}
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
