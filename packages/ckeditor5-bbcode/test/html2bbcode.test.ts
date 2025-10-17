import type { TestContext } from "node:test";
import { describe, test } from "node:test";
import expect from "expect";
import { bbCodeDefaultRules } from "../src";
import { html2bbcode } from "../src/html2bbcode";
import { parseAsFragment } from "./DOMUtils";

const rules = bbCodeDefaultRules;

const aut = {
  expectTransformation: ({ dataView, expectedData }: { dataView: string; expectedData: string }): void => {
    const actualData = html2bbcode(parseAsFragment(dataView), rules);
    try {
      expect(actualData).toBe(expectedData);
    } catch (e) {
      console.debug("Failed expectations.", {
        dataView,
        actualData,
        expectedData,
      });
      throw e;
    }
  },
};

const url = {
  absolute: "https://example.org/",
  relative: "/example",
};

void describe("html2bbcode", () => {
  const bbcodeCases = [
    {
      tag: "[b] (style)",
      openElement: '<span style="font-weight: bold;">',
      closeElement: "</span>",
      openTag: "[b]",
      closeTag: "[/b]",
    },
    { tag: "[b] (strong)", openElement: "<strong>", closeElement: "</strong>", openTag: "[b]", closeTag: "[/b]" },
    { tag: "[b] (b)", openElement: "<b>", closeElement: "</b>", openTag: "[b]", closeTag: "[/b]" },
    {
      tag: "[color]",
      openElement: '<span style="color: red;">',
      closeElement: "</span>",
      openTag: "[color=red]",
      closeTag: "[/color]",
    },
    {
      tag: "[size]",
      openElement: '<span class="text-small">',
      closeElement: "</span>",
      openTag: "[size=85]",
      closeTag: "[/size]",
    },
    { tag: "[h1]", openElement: "<h1>", closeElement: "</h1>", openTag: "[h1]", closeTag: "[/h1]" },
    { tag: "[h2]", openElement: "<h2>", closeElement: "</h2>", openTag: "[h2]", closeTag: "[/h2]" },
    { tag: "[h3]", openElement: "<h3>", closeElement: "</h3>", openTag: "[h3]", closeTag: "[/h3]" },
    { tag: "[h4]", openElement: "<h4>", closeElement: "</h4>", openTag: "[h4]", closeTag: "[/h4]" },
    { tag: "[h5]", openElement: "<h5>", closeElement: "</h5>", openTag: "[h5]", closeTag: "[/h5]" },
    { tag: "[h6]", openElement: "<h6>", closeElement: "</h6>", openTag: "[h6]", closeTag: "[/h6]" },
    {
      tag: "[i] (style)",
      openElement: '<span style="font-style: italic;">',
      closeElement: "</span>",
      openTag: "[i]",
      closeTag: "[/i]",
    },
    { tag: "[i] (i)", openElement: "<i>", closeElement: "</i>", openTag: "[i]", closeTag: "[/i]" },
    { tag: "[i] (em)", openElement: "<em>", closeElement: "</em>", openTag: "[i]", closeTag: "[/i]" },
    {
      tag: "[s] (style)",
      openElement: '<span style="text-decoration: line-through;">',
      closeElement: "</span>",
      openTag: "[s]",
      closeTag: "[/s]",
    },
    { tag: "[s] (del)", openElement: "<del>", closeElement: "</del>", openTag: "[s]", closeTag: "[/s]" },
    { tag: "[s] (strike)", openElement: "<strike>", closeElement: "</strike>", openTag: "[s]", closeTag: "[/s]" },
    {
      tag: "[u] (style)",
      openElement: '<span style="text-decoration: underline;">',
      closeElement: "</span>",
      openTag: "[u]",
      closeTag: "[/u]",
    },
    { tag: "[u] (u)", openElement: "<u>", closeElement: "</u>", openTag: "[u]", closeTag: "[/u]" },
    { tag: "[u] (ins)", openElement: "<ins>", closeElement: "</ins>", openTag: "[u]", closeTag: "[/u]" },
    {
      tag: "[url]",
      openElement: `<a href="${url.absolute}">`,
      closeElement: "</a>",
      openTag: `[url="${url.absolute}"]`,
      closeTag: "[/url]",
    },
  ] as const;

  for (const { tag, openTag, closeTag, openElement, closeElement } of bbcodeCases) {
    describe(`${tag} (Standard Behaviors)`, () => {
      const cases = [
        {
          dataView: `${openElement}T${closeElement}`,
          expectedData: `${openTag}T${closeTag}`,
          comment: `default`,
        },
      ];

      void test("cases", async (t: TestContext) => {
        for (const [i, { dataView, expectedData, comment }] of cases.entries()) {
          await t.test(`[${i}] Should process data view '${dataView}' to: '${expectedData}' (${comment})`, () => {
            aut.expectTransformation({ dataView, expectedData });
          });
        }
      });
    });
  }

  void describe("[url]", () => {
    const cases = [
      {
        dataView: `<a href="${url.absolute}">T</a>`,
        expectedData: `[url="${url.absolute}"]T[/url]`,
        comment: "default (absolute)",
      },
      {
        dataView: `<a href="${url.absolute}">${url.absolute}</a>`,
        expectedData: `[url]${url.absolute}[/url]`,
        comment: "pretty print (absolute)",
      },
      {
        dataView: `<a href="${url.absolute}"><i>T</i></a>`,
        expectedData: `[url="${url.absolute}"][i]T[/i][/url]`,
        comment: "nested element support (inner)",
      },
      {
        dataView: `<i><a href="${url.absolute}">T</a></i>`,
        expectedData: `[i][url="${url.absolute}"]T[/url][/i]`,
        comment: "nested element support (outer)",
      },
      {
        dataView: `<a href="${url.absolute}?brackets=[]">T</a>`,
        expectedData: `[url="${url.absolute}?brackets=%5B%5D"]T[/url]`,
        comment: "escape brackets in URL",
      },
      {
        dataView: `<a href="${url.absolute}?brackets=[]">${url.absolute}?brackets=[]</a>`,
        expectedData: `[url="${url.absolute}?brackets=%5B%5D"]${url.absolute}?brackets=\\[\\][/url]`,
        comment: "different escaping for different contexts",
      },
      {
        dataView: `<a href="${url.relative}">T</a>`,
        expectedData: `[url="${url.relative}"]T[/url]`,
        comment: "default (relative)",
      },
      {
        dataView: `<a href="${url.relative}">${url.relative}</a>`,
        expectedData: `[url]${url.relative}[/url]`,
        comment: "pretty print (relative)",
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expectedData, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process data view '${dataView}' to: '${expectedData}' (${comment})`, () => {
          aut.expectTransformation({ dataView, expectedData });
        });
      }
    });
  });

  void describe("[img]", () => {
    // noinspection HtmlRequiredAltAttribute
    const cases = [
      {
        dataView: `<img src="${url.absolute}">`,
        expectedData: `[img]${url.absolute}[/img]`,
        comment: "default (absolute)",
      },
      {
        dataView: `<a href="${url.absolute}"><img src="${url.absolute}"></a>`,
        expectedData: `[url="${url.absolute}"][img]${url.absolute}[/img][/url]`,
        comment: "linked image",
      },
      {
        dataView: `<i>BEFORE<img src="${url.absolute}">AFTER</i>`,
        expectedData: `[i]BEFORE[img]${url.absolute}[/img]AFTER[/i]`,
        comment: "images are inline",
      },
      {
        dataView: `<img src="${url.absolute}?brackets=[]">`,
        expectedData: `[img]${url.absolute}?brackets=%5B%5D[/img]`,
        comment: "escape brackets in URL",
      },
      {
        dataView: `<img src="${url.relative}">`,
        expectedData: `[img]${url.relative}[/img]`,
        comment: "default (relative)",
      },
      {
        dataView: `BEFORE<img src="">AFTER`,
        expectedData: `BEFOREAFTER`,
        comment: "design-scope: Remove irrelevant image with empty src",
      },
      {
        dataView: `<img alt="ALT" src="${url.absolute}">`,
        expectedData: `[img alt="ALT"]${url.absolute}[/img]`,
        comment: "alt attribute support (default)",
      },
      {
        dataView: `BEFORE<img alt="ALT" src="">AFTER`,
        expectedData: `BEFOREAFTER`,
        comment: "design-scope: Remove irrelevant image with empty src, even if alt is set",
      },
      {
        dataView: `<img alt="with space" src="${url.absolute}">`,
        expectedData: `[img alt="with space"]${url.absolute}[/img]`,
        comment: "attribute with spaces; latest, that we require quotes for BBob",
      },
      {
        dataView: `<img alt="let's &quot;quote&quot;" src="${url.absolute}">`,
        expectedData: `[img alt="let's \\"quote\\""]${url.absolute}[/img]`,
        comment: "alt text quote challenge (must not escape BBCode attribute)",
      },
      {
        dataView: `<img alt="in [brackets]" src="${url.absolute}">`,
        expectedData: `[img alt="in &#x5B;brackets&#x5D;"]${url.absolute}[/img]`,
        comment:
          "alt text with square brackets; for best robustness in BBCode parsers encoded; design-scope: This introduces entities and thus assumes BBCode is always processed to some XML format.",
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { dataView, expectedData, comment }] of cases.entries()) {
        await t.test(`[${i}] Should process data view '${dataView}' to: '${expectedData}' (${comment})`, () => {
          aut.expectTransformation({ dataView, expectedData });
        });
      }
    });
  });
});
