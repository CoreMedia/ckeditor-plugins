/* eslint-disable @typescript-eslint/no-floating-promises */
import "global-jsdom/register";
import test, { describe } from "node:test";
import * as aut from "../../src/rules/HeadingElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { bijective, TestDirection } from "./TestDirection";
import { RulesTester } from "./RulesTester";

describe("HeadingElements", () => {
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
    test(`[${index}] Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
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
