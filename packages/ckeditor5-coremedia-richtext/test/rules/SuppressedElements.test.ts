import { describe } from "node:test";
import { richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import * as aut from "../../src/rules/SuppressedElements";
import { RulesTester } from "./RulesTester";
import { toData } from "./TestDirection";

void describe("SuppressedElements", () => {
  const ruleConfigurations = aut.suppressedElements;

  const text = "T";
  const direction = toData;
  const data = `<table><tbody><tr><td>${text}</td></tr></tbody></table>`;
  const view = `<figure class="table"><table><tbody><tr><td>${text}</td></tr></tbody></table></figure>`;

  void describe(`Should provide mapping from data ${direction} view: ${data} ${direction} ${view}`, () => {
    const dataString = richtext(data);
    const htmlString = `<body>${view}</body>`;
    const tester = new RulesTester(ruleConfigurations, "*", "body > *");

    tester.executeTests({
      dataString,
      direction,
      htmlString,
    });
  });
});
