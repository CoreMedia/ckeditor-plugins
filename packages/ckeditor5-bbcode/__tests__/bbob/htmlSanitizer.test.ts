import { AllowedAttributePredicate, htmlSanitizer } from "../../src/bbob/htmlSanitizer";
import bbob from "@bbob/core/es";
import { render } from "@bbob/html/es";

describe("htmlSanitizer", () => {
  describe("Default Configuration", () => {
    const plugin = htmlSanitizer();
    const processor = bbob(plugin);
    const process = (bbCode: string): string => processor.process(bbCode, { render }).html;

    it.each`
      input                       | expected                  | comment
      ${``}                       | ${``}                     | ${`Empty string handling`}
      ${`Lorem`}                  | ${`Lorem`}                | ${`unsuspicious string handling`}
      ${`[b]T[/b]`}               | ${`<b>T</b>`}             | ${`unsuspicious element handling`}
      ${`<b>T</b>`}               | ${`&lt;b&gt;T&lt;/b&gt;`} | ${`encode HTML elements by default`}
      ${`[b onclick=xss()]T[/b]`} | ${`<b>T</b>`}             | ${`remove suspicious attributes`}
      ${`[b oNcLick=xss()]T[/b]`} | ${`<b>T</b>`}             | ${`remove suspicious attributes`}
    `(
      "[$#] $comment: Should process '$input' to '$expected'",
      ({ input, expected }: { input: string; expected: string }) => {
        expect(process(input)).toBe(expected);
      },
    );
  });

  /**
   * While not recommended in context as CKEditor 5-Plugin, this customization
   * option matches a similar feature of Markdown. And: Internally it clearly
   * shows where escaping happens and why.
   */
  describe("Allow HTML", () => {
    const plugin = htmlSanitizer({ allowHtml: true });
    const processor = bbob(plugin);
    const process = (bbCode: string): string => processor.process(bbCode, { render }).html;

    it.each`
      input                       | expected      | comment
      ${``}                       | ${``}         | ${`Empty string handling`}
      ${`Lorem`}                  | ${`Lorem`}    | ${`unsuspicious string handling`}
      ${`[b]T[/b]`}               | ${`<b>T</b>`} | ${`unsuspicious element handling`}
      ${`<b>T</b>`}               | ${`<b>T</b>`} | ${`enabled by option: let HTML elements pass through`}
      ${`[b onclick=xss()]T[/b]`} | ${`<b>T</b>`} | ${`still: remove suspicious attributes`}
    `(
      "[$#] $comment: Should process '$input' to '$expected'",
      ({ input, expected }: { input: string; expected: string }) => {
        expect(process(input)).toBe(expected);
      },
    );
  });

  describe("Custom Attribute Filter", () => {
    /**
     * Allows only `class` attribute for `b` and `i` tags. Allows `id`
     * attribute for any tag.
     */
    const isAllowedAttribute: AllowedAttributePredicate = (attr: string, tag: string) => {
      if (["b", "i"].includes(tag)) {
        return attr === "class";
      }
      return attr === "id";
    };
    const plugin = htmlSanitizer({ isAllowedAttribute });
    const processor = bbob(plugin);
    const process = (bbCode: string): string => processor.process(bbCode, { render }).html;

    it.each`
      input                           | expected                    | comment
      ${`[b class=CLASS]T[/b]`}       | ${`<b class="CLASS">T</b>`} | ${`b.class passes custom filter`}
      ${`[u class=CLASS]T[/u]`}       | ${`<u>T</u>`}               | ${`u.class is blocked by custom filter`}
      ${`[u class=CLASS id=ID]T[/u]`} | ${`<u id="ID">T</u>`}       | ${`u.class is blocked by custom filter, only u.id passes`}
    `(
      "[$#] $comment: Should process '$input' to '$expected'",
      ({ input, expected }: { input: string; expected: string }) => {
        expect(process(input)).toBe(expected);
      },
    );
  });
});
