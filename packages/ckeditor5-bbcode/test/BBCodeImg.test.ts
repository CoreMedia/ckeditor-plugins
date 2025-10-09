import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeImg } from "../src/rules/BBCodeImg";

void describe("BBCodeImg", () => {

  void test("Default Configuration", async (t: TestContext) => {
    const rule = bbCodeImg;
    const someUrl = "https://example.org/";

    const cases: { dataView: string; expected: string | undefined; comment: string }[] = [
      {
        dataView: `<img src="${someUrl}">`,
        expected: `[img]${someUrl}[/img]`,
        comment: "Default Mapping Use-Case",
      },
      {
        dataView: `<img src="${someUrl}?openBracket=[">`,
        expected: `[img]${someUrl}?openBracket=%5B[/img]`,
        comment: "Escape Open-Bracket [",
      },
      {
        dataView: `<img src="${someUrl}?closeBracket=]">`,
        expected: `[img]${someUrl}?closeBracket=%5D[/img]`,
        comment: "Escape Close-Bracket [",
      },
      {
        dataView: `<img src="${someUrl}?quote=&quot;">`,
        expected: `[img]${someUrl}?quote="[/img]`,
        comment: `Don't escape double quote as it is rendered as content`,
      },
      {
        dataView: `<img src="">`,
        expected: undefined,
        comment: `As there is no representation for "empty URLs" in BBCode, not mapping to [img]`,
      },
      {
        dataView: `<img src="/relative">`,
        expected: `[img]/relative[/img]`,
        comment: "Keep relative URLs (1)",
      },
      {
        dataView: `<img src="?search=param">`,
        expected: `[img]?search=param[/img]`,
        comment: "Keep relative URLs, search-param only (2)",
      },
      {
        dataView: `<img src="#hash">`,
        expected: `[img]#hash[/img]`,
        comment: "Keep relative URLs, hash-param only (3)",
      },
    ];

    for (const { dataView, expected, comment } of cases) {
      await t.test(`Should process '${dataView}' to '${expected}' (${comment})`, () => {
        const element = requireHTMLElement(dataView);
        const bbCode = rule.toData(element);
        expect(bbCode).toEqual(expected);
      });
    }
  });
});
