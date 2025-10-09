import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
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
  // noinspection HtmlDeprecatedTag,XmlDeprecatedElement
  describe.each`
    tag               | openElement                                        | closeElement   | openTag                      | closeTag
    ${`[b] (style)`}  | ${`<span style="font-weight: bold;">`}             | ${`</span>`}   | ${`[b]`}                     | ${`[/b]`}
    ${`[b] (strong)`} | ${`<strong>`}                                      | ${`</strong>`} | ${`[b]`}                     | ${`[/b]`}
    ${`[b] (b)`}      | ${`<b>`}                                           | ${`</b>`}      | ${`[b]`}                     | ${`[/b]`}
    ${`[color]`}      | ${`<span style="color: red;">`}                    | ${`</span>`}   | ${`[color=red]`}             | ${`[/color]`}
    ${`[size]`}       | ${`<span class="text-small">`}                     | ${`</span>`}   | ${`[size=85]`}               | ${`[/size]`}
    ${`[h1]`}         | ${`<h1>`}                                          | ${`</h1>`}     | ${`[h1]`}                    | ${`[/h1]`}
    ${`[h2]`}         | ${`<h2>`}                                          | ${`</h2>`}     | ${`[h2]`}                    | ${`[/h2]`}
    ${`[h3]`}         | ${`<h3>`}                                          | ${`</h3>`}     | ${`[h3]`}                    | ${`[/h3]`}
    ${`[h4]`}         | ${`<h4>`}                                          | ${`</h4>`}     | ${`[h4]`}                    | ${`[/h4]`}
    ${`[h5]`}         | ${`<h5>`}                                          | ${`</h5>`}     | ${`[h5]`}                    | ${`[/h5]`}
    ${`[h6]`}         | ${`<h6>`}                                          | ${`</h6>`}     | ${`[h6]`}                    | ${`[/h6]`}
    ${`[i] (style)`}  | ${`<span style="font-style: italic;">`}            | ${`</span>`}   | ${`[i]`}                     | ${`[/i]`}
    ${`[i] (i)`}      | ${`<i>`}                                           | ${`</i>`}      | ${`[i]`}                     | ${`[/i]`}
    ${`[i] (em)`}     | ${`<em>`}                                          | ${`</em>`}     | ${`[i]`}                     | ${`[/i]`}
    ${`[s] (style)`}  | ${`<span style="text-decoration: line-through;">`} | ${`</span>`}   | ${`[s]`}                     | ${`[/s]`}
    ${`[s] (del)`}    | ${`<del>`}                                         | ${`</del>`}    | ${`[s]`}                     | ${`[/s]`}
    ${`[s] (strike)`} | ${`<strike>`}                                      | ${`</strike>`} | ${`[s]`}                     | ${`[/s]`}
    ${`[u] (style)`}  | ${`<span style="text-decoration: underline;">`}    | ${`</span>`}   | ${`[u]`}                     | ${`[/u]`}
    ${`[u] (u)`}      | ${`<u>`}                                           | ${`</u>`}      | ${`[u]`}                     | ${`[/u]`}
    ${`[u] (ins)`}    | ${`<ins>`}                                         | ${`</ins>`}    | ${`[u]`}                     | ${`[/u]`}
    ${`[url]`}        | ${`<a href="${url.absolute}">`}                    | ${`</a>`}      | ${`[url="${url.absolute}"]`} | ${`[/url]`}
  `(
    "$tag (Standard Behaviors)",
    ({
      openElement,
      closeElement,
      openTag,
      closeTag,
    }: {
      openElement: string;
      closeElement: string;
      openTag: string;
      closeTag: string;
    }) => {
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
    },
  );

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
