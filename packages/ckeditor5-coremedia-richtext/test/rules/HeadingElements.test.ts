import { describe } from "node:test";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/HeadingElements";
import { RulesTester } from "./RulesTester";
import type { TestDirection } from "./TestDirection";
import { bijective } from "./TestDirection";

void describe("HeadingElements", () => {
  const ruleConfigurations = [aut.headingElements];

  const text = "T";

  const headingTestCases: { data: string; direction: TestDirection; view: string }[] = [
    { data: `<p class="p--heading-1">${text}</p>`, direction: bijective, view: `<h1>${text}</h1>` },
    { data: `<p class="p--heading-2">${text}</p>`, direction: bijective, view: `<h2>${text}</h2>` },
    { data: `<p class="p--heading-3">${text}</p>`, direction: bijective, view: `<h3>${text}</h3>` },
    { data: `<p class="p--heading-4">${text}</p>`, direction: bijective, view: `<h4>${text}</h4>` },
    { data: `<p class="p--heading-5">${text}</p>`, direction: bijective, view: `<h5>${text}</h5>` },
    { data: `<p class="p--heading-6">${text}</p>`, direction: bijective, view: `<h6>${text}</h6>` },
    { data: `<p class="CLASS p--heading-1">${text}</p>`, direction: bijective, view: `<h1 class="CLASS">${text}</h1>` },
  ];

  for (const [index, { data, direction, view }] of headingTestCases.entries()) {
    void describe(`[${index}] Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
      const dataString = richtext(data);
      const htmlString = `<body>${view}</body>`;
      const tester = new RulesTester(ruleConfigurations, "*", "body > *");

      tester.executeTests({
        dataString,
        direction,
        htmlString,
      });
    });
  }
});
