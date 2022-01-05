import { formatLink } from "../../src/rules/IdHelper";

describe("IdHelper", () => {
  test.each`
    href                                      | expected
    ${""}                                     | ${""}
    ${"https://example.org/"}                 | ${"https://example.org/"}
    ${"content/2"}                            | ${"content/2"}
    ${"coremedia:///cap/content/2"}           | ${"content/2"}
    ${"content/2#properties.data"}            | ${"content/2#properties.data"}
    ${"coremedia:///cap/blob/content/2#data"} | ${"content/2#properties.data"}
  `("[$#] `$href` -> `$expected`", ({ href, expected }) => {
    const actual = formatLink(href);
    expect(actual).toStrictEqual(expected);
  });
});
