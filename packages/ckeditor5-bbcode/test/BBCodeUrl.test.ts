import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { requireHTMLElement } from "./DOMUtils";
import { bbCodeUrl } from "../src/rules/BBCodeUrl";

describe("BBCodeUnderline", () => {
  describe("Default Configuration", () => {
    const rule = bbCodeUrl;
    const someUrl = "https://example.org/";

    const cases = [
      {
        dataView: `<a href="${someUrl}">TEXT</a>`,
        expected: `[url="${someUrl}"]TEXT[/url]`,
        comment: `Default Mapping Use-Case`,
      },
      {
        dataView: `<a href="${someUrl}">${someUrl}</a>`,
        expected: `[url]${someUrl}[/url]`,
        comment: `Pretty-Print: Shorten, if applicable`,
      },
      {
        dataView: `<a href="${someUrl}?openBracket=[">TEXT</a>`,
        expected: `[url="${someUrl}?openBracket=%5B"]TEXT[/url]`,
        comment: `Escape Open-Bracket [`,
      },
      {
        dataView: `<a href="${someUrl}?closeBracket=]">TEXT</a>`,
        expected: `[url="${someUrl}?closeBracket=%5D"]TEXT[/url]`,
        comment: `Escape Close-Bracket [`,
      },
      {
        dataView: `<a href="${someUrl}?quote=&quot;">TEXT</a>`,
        expected: `[url="${someUrl}?quote=%22"]TEXT[/url]`,
        comment: `Escape Double Quote in Attribute`,
      },
      {
        dataView: `<a href="${someUrl}?quote=&quot;">${someUrl}?quote="</a>`,
        expected: `[url]${someUrl}?quote="[/url]`,
        comment: `Don't escape double quote when rendered as content`,
      },
      {
        dataView: `<a href="${someUrl}?brackets=][">${someUrl}?brackets=\\]\\[</a>`,
        expected: `[url="${someUrl}?brackets=%5D%5B"]${someUrl}?brackets=\\]\\[[/url]`,
        comment: `Escaping of text-content done by previous (outside) processing`,
      },
      {
        dataView: `<a href="">TEXT</a>`,
        expected: undefined,
        comment: `As there is no representation for "empty URLs" in BBCode, not mapping to [url]`,
      },
      {
        dataView: `<a href="/relative">TEXT</a>`,
        expected: `[url="/relative"]TEXT[/url]`,
        comment: `Keep relative URLs (1)`,
      },
      {
        dataView: `<a href="?search=param">TEXT</a>`,
        expected: `[url="?search=param"]TEXT[/url]`,
        comment: `Keep relative URLs, search-param only (2)`,
      },
      {
        dataView: `<a href="#hash">TEXT</a>`,
        expected: `[url="#hash"]TEXT[/url]`,
        comment: `Keep relative URLs, hash-param only (3)`,
      },
    ] as const;

    test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expected, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process '${dataView}' to '${expected}' (${comment})`, () => {
          const element = requireHTMLElement(dataView);
          const bbCode = rule.toData(element, element.textContent ?? "");
          expect(bbCode).toEqual(expected);
        });
      }
    });
  });
});
