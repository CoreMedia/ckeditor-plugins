// noinspection HtmlUnknownAttribute


import "global-jsdom/register";
import test, { describe } from "node:test";
import * as aut from "../../src/rules/TableElements";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { bijective, TestDirection, toData, toView } from "./TestDirection";
import { RulesTester } from "./RulesTester";

void describe("TableElements", () => {
  const ruleConfigurations = aut.tableElements;
  const text = "T";
  const text1 = "T1";
  const text2 = "T2";

  const tableTests: {
    data: string;
    direction: TestDirection;
    view: string;
  }[] = [
    {
      data: `<table><tbody><tr><td>${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tbody><tr><td>${text}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr><td class="td--header">${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tbody><tr><th>${text}</th></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr class="tr--header"><td>${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><thead><tr><td>${text}</td></tr></thead></table>`,
    },
    {
      data: `<table><tbody><tr class="tr--footer"><td>${text}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tfoot><tr><td>${text}</td></tr></tfoot></table>`,
    },
    {
      data: `<table><tr><td>${text}</td></tr></table>`,
      direction: toView,
      view: `<table><tbody><tr><td>${text}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr><td>${text}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><tr><td>${text}</td></tr></table>`,
    },
    {
      data: `<table><tbody><tr><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><tbody><tr><td>${text1}</td></tr></tbody><tbody><tr><td>${text2}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr class="tr--header"><td class="td--header">${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><thead><tr><th>${text1}</th></tr></thead><tbody><tr><td>${text2}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody><tr class="tr--header"><td class="td--header">${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><tbody><tr><td>${text2}</td></tr></tbody><thead><tr><th>${text1}</th></tr></thead></table>`,
    },
    {
      data: `<table><tbody><tr><td>${text1}</td></tr><tr class="tr--footer"><td>${text2}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><tbody><tr><td>${text1}</td></tr></tbody><tfoot><tr><td>${text2}</td></tr></tfoot></table>`,
    },
    {
      data: `<table><tbody><tr><td>${text1}</td></tr><tr class="tr--footer"><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><tfoot><tr><td>${text2}</td></tr></tfoot><tbody><tr><td>${text1}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody class="CLASS"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: bijective,
      view: `<table><thead class="CLASS"><tr><td>${text1}</td></tr></thead><tbody class="CLASS"><tr><td>${text2}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody class="CLASS"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><thead class="CLASS"><tr><td>${text1}</td></tr></thead><tbody><tr><td>${text2}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody class="CLASS"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><thead><tr><td>${text1}</td></tr></thead><tbody class="CLASS"><tr><td>${text2}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody class="BODY"><tr class="tr--header"><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><thead class="HEAD"><tr><td>${text1}</td></tr></thead><tbody class="BODY"><tr><td>${text2}</td></tr></tbody></table>`,
    },
    {
      data: `<table><tbody class="BODY"><tr><td>${text1}</td></tr><tr class="tr--footer"><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><tbody class="BODY"><tr><td>${text1}</td></tr></tbody><tfoot class="FOOT"><tr><td>${text2}</td></tr></tfoot></table>`,
    },
    {
      data: `<table><tbody class="BODY1"><tr><td>${text1}</td></tr><tr><td>${text2}</td></tr></tbody></table>`,
      direction: toData,
      view: `<table><tbody class="BODY1"><tr><td>${text1}</td></tr></tbody><tbody class="BODY2"><tr><td>${text2}</td></tr></tbody></table>`,
    },
  ];

  for (const [index, { data, direction, view }] of tableTests.entries()) {
    void test(`[${index}] Should provide mapping from data ${direction} view`, () => {
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
