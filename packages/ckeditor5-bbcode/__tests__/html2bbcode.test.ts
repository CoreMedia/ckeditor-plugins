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

describe("html2bbcode", () => {
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
      it.each`
        dataView                            | expectedData                | comment
        ${`${openElement}T${closeElement}`} | ${`${openTag}T${closeTag}`} | ${`default`}
      `(
        "[$#] Should process data view '$dataView' to: $expectedData ($comment)",
        ({ dataView, expectedData }: { dataView: string; expectedData: string }) => {
          aut.expectTransformation({ dataView, expectedData });
        },
      );
    },
  );

  describe("[url]", () => {
    it.each`
      dataView                                                                   | expectedData                                                                      | comment
      ${`<a href="${url.absolute}">T</a>`}                                       | ${`[url="${url.absolute}"]T[/url]`}                                               | ${`default (absolute)`}
      ${`<a href="${url.absolute}">${url.absolute}</a>`}                         | ${`[url]${url.absolute}[/url]`}                                                   | ${`pretty print (absolute)`}
      ${`<a href="${url.absolute}"><i>T</i></a>`}                                | ${`[url="${url.absolute}"][i]T[/i][/url]`}                                        | ${`nested element support (inner)`}
      ${`<i><a href="${url.absolute}">T</a></i>`}                                | ${`[i][url="${url.absolute}"]T[/url][/i]`}                                        | ${`nested element support (outer)`}
      ${`<a href="${url.absolute}?brackets=[]">T</a>`}                           | ${`[url="${url.absolute}?brackets=%5B%5D"]T[/url]`}                               | ${`escape brackets in URL`}
      ${`<a href="${url.absolute}?brackets=[]">${url.absolute}?brackets=[]</a>`} | ${`[url="${url.absolute}?brackets=%5B%5D"]${url.absolute}?brackets=\\[\\][/url]`} | ${`different escaping for different contexts`}
      ${`<a href="${url.relative}">T</a>`}                                       | ${`[url="${url.relative}"]T[/url]`}                                               | ${`default (relative)`}
      ${`<a href="${url.relative}">${url.relative}</a>`}                         | ${`[url]${url.relative}[/url]`}                                                   | ${`pretty print (relative)`}
    `(
      "[$#] Should process data view '$dataView' to: $expectedData ($comment)",
      ({ dataView, expectedData }: { dataView: string; expectedData: string }) => {
        aut.expectTransformation({ dataView, expectedData });
      },
    );
  });

  describe("[img]", () => {
    // noinspection HtmlRequiredAltAttribute
    it.each`
      dataView                                                       | expectedData                                                  | comment
      ${`<img src="${url.absolute}">`}                               | ${`[img]${url.absolute}[/img]`}                               | ${`default (absolute)`}
      ${`<a href="${url.absolute}"><img src="${url.absolute}"></a>`} | ${`[url="${url.absolute}"][img]${url.absolute}[/img][/url]`}  | ${`linked image`}
      ${`<i>BEFORE<img src="${url.absolute}">AFTER</i>`}             | ${`[i]BEFORE[img]${url.absolute}[/img]AFTER[/i]`}             | ${`images are inline`}
      ${`<img src="${url.absolute}?brackets=[]">`}                   | ${`[img]${url.absolute}?brackets=%5B%5D[/img]`}               | ${`escape brackets in URL`}
      ${`<img src="${url.relative}">`}                               | ${`[img]${url.relative}[/img]`}                               | ${`default (relative)`}
      ${`BEFORE<img src="">AFTER`}                                   | ${`BEFOREAFTER`}                                              | ${`design-scope: Remove irrelevant image with empty src`}
      ${`<img alt="ALT" src="${url.absolute}">`}                     | ${`[img alt="ALT"]${url.absolute}[/img]`}                     | ${`alt attribute support (default)`}
      ${`BEFORE<img alt="ALT" src="">AFTER`}                         | ${`BEFOREAFTER`}                                              | ${`design-scope: Remove irrelevant image with empty src, even if alt is set`}
      ${`<img alt="with space" src="${url.absolute}">`}              | ${`[img alt="with space"]${url.absolute}[/img]`}              | ${`attribute with spaces; latest, that we require quotes for BBob`}
      ${`<img alt="let's &quot;quote&quot;" src="${url.absolute}">`} | ${`[img alt="let's \\"quote\\""]${url.absolute}[/img]`}       | ${`alt text quote challenge (must not escape BBCode attribute)`}
      ${`<img alt="in [brackets]" src="${url.absolute}">`}           | ${`[img alt="in &#x5B;brackets&#x5D;"]${url.absolute}[/img]`} | ${`alt text with square brackets; for best robustness in BBCode parsers encoded; design-scope: This introduces entities and thus assumes BBCode is always processed to some XML format.`}
    `(
      "[$#] Should process data view '$dataView' to: $expectedData ($comment)",
      ({ dataView, expectedData }: { dataView: string; expectedData: string }) => {
        aut.expectTransformation({ dataView, expectedData });
      },
    );
  });
});
