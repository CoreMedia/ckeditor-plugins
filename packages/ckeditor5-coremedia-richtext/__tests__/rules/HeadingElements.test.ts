import * as aut from "../../src/rules/HeadingElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { bijective, TestDirection } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("HeadingElements", () => {
  const ruleConfigurations = [aut.headingElements];

  const text = "T";

  describe.each`
    data                                           | direction    | view
    ${`<p class="p--heading-1">${text}</p>`}       | ${bijective} | ${`<h1>${text}</h1>`}
    ${`<p class="p--heading-2">${text}</p>`}       | ${bijective} | ${`<h2>${text}</h2>`}
    ${`<p class="p--heading-3">${text}</p>`}       | ${bijective} | ${`<h3>${text}</h3>`}
    ${`<p class="p--heading-4">${text}</p>`}       | ${bijective} | ${`<h4>${text}</h4>`}
    ${`<p class="p--heading-5">${text}</p>`}       | ${bijective} | ${`<h5>${text}</h5>`}
    ${`<p class="p--heading-6">${text}</p>`}       | ${bijective} | ${`<h6>${text}</h6>`}
    ${`<p class="CLASS p--heading-1">${text}</p>`} | ${bijective} | ${`<h1 class="CLASS">${text}</h1>`}
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
