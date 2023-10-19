import { paragraphAwareContent, ParagraphAwareContentOptions } from "../../src/bbob/Paragraphs";
import { toNode } from "../../src/bbob/TagNodes";
import { TagNode } from "@bbob/plugin-helper/es";

type ContentFixture = NonNullable<TagNode["content"]>;

const p = (content: ContentFixture): TagNode => toNode("p", {}, content);
/**
 * Just any inline tag-node.
 */
const b = (content: ContentFixture): TagNode => toNode("b", {}, content);
/**
 * Shortcut to add `quote` node.
 */
const q = (content: ContentFixture): TagNode => toNode("quote", {}, content);

describe(`Paragraphs`, () => {
  // ==========================================================================================[ paragraphAwareContent ]
  describe(`paragraphAwareContent`, () => {
    // -------------------------------------------------------------------------------------------------[ content=null ]
    describe(`content=null`, () => {
      it(`should return "null" with default options`, () => {
        expect(paragraphAwareContent(null)).toBeNull();
      });

      it(`should return "null" even with "requireParagraph=true"`, () => {
        expect(paragraphAwareContent(null, { requireParagraph: true })).toBeNull();
      });
    });

    // ---------------------------------------------------------------------------------------------------[ content=[] ]
    describe(`content=[]`, () => {
      it(`should return "[]" with default options`, () => {
        expect(paragraphAwareContent([])).toMatchObject([]);
      });

      it(`should return "[]" wrapped in paragraph with "requireParagraph=true"`, () => {
        const expected = [toNode("p", {}, [])];
        expect(paragraphAwareContent([], { requireParagraph: true })).toMatchObject(expected);
      });
    });

    // ---------------------------------------------------------------------------------------------[ content=string[] ]
    describe(`content=string[]: Content only containing strings without EOL characters`, () => {
      it(`should skip extra paragraph (requireParagraphs=default false)`, () => {
        const input = ["lorem", "ipsum"];
        expect(paragraphAwareContent(input)).toMatchObject(input);
      });

      it(`should wrap content into paragraph (requireParagraphs=true)`, () => {
        const input = ["lorem", "ipsum"];
        const expected = [toNode("p", {}, input)];
        expect(paragraphAwareContent(input, { requireParagraph: true })).toMatchObject(expected);
      });
    });

    // -----------------------------------------------------------------------------------[ content=(string|TagNode)[] ]
    describe(`content=(string|TagNode)[]: Content only containing strings and tag-nodes without EOL characters`, () => {
      it.each`
        input                               | comment
        ${[b(["lorem"]), "ipsum", "dolor"]} | ${"tag-node at start"}
        ${["lorem", b(["ipsum"]), "dolor"]} | ${"tag-node in the middle"}
        ${["lorem", "ipsum", b(["dolor"])]} | ${"tag-node at the end"}
      `(
        `[$#] should skip extra paragraph (requireParagraphs=default false, $comment): $input`,
        ({ input }: { input: ContentFixture }) => {
          expect(paragraphAwareContent(input)).toMatchObject(input);
        },
      );

      it.each`
        input                               | comment
        ${[b(["lorem"]), "ipsum", "dolor"]} | ${"tag-node at start"}
        ${["lorem", b(["ipsum"]), "dolor"]} | ${"tag-node in the middle"}
        ${["lorem", "ipsum", b(["dolor"])]} | ${"tag-node at the end"}
      `(
        `[$#] should wrap content into paragraph (requireParagraphs=default true, $comment): $input`,
        ({ input }: { input: ContentFixture }) => {
          const expected = [toNode("p", {}, input)];
          const actual = paragraphAwareContent(input, { requireParagraph: true });
          expect(actual).toMatchObject(expected);
        },
      );
    });

    // ------------------------------------------------------------------------------------------------[ content=EOL[] ]
    describe(`content=EOL[]: Content consisting of EOLs only`, () => {
      it.each`
        input                 | expected  | comment
        ${["\n"]}             | ${["\n"]} | ${"keep single newline as is"}
        ${["\n", "\n"]}       | ${["\n"]} | ${"squash newlines, keep at least one"}
        ${["\n", "\n", "\n"]} | ${["\n"]} | ${"squash newlines, keep at least one"}
      `(
        "[$#] should transform from $input to $expected (all defaults): $comment",
        ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
          const actual = paragraphAwareContent(input);
          expect(actual).toMatchObject(expected);
        },
      );

      it.each`
        input                 | expected   | comment
        ${["\n"]}             | ${[p([])]} | ${"Design scope: Trim irrelevant newline"}
        ${["\n", "\n"]}       | ${[p([])]} | ${"Design scope: Trim irrelevant newline"}
        ${["\n", "\n", "\n"]} | ${[p([])]} | ${"Design scope: Trim irrelevant newline"}
      `(
        "[$#] should transform from $input to $expected (requireParagraph=true): $comment",
        ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
          const options: ParagraphAwareContentOptions = { requireParagraph: true };
          const actual = paragraphAwareContent(input, options);
          expect(actual).toMatchObject(expected);
        },
      );
    });

    // ---------------------------------------------------------------------------------------[ content=(string|EOL)[] ]
    describe(`content=(string|EOL)[]: Content only containing strings (including EOL characters)`, () => {
      describe("Default Options", () => {
        it.each`
          input                       | expected                    | comment
          ${["\n", "ipsum", "dolor"]} | ${["\n", "ipsum", "dolor"]} | ${"keep single EOL at start"}
          ${["lorem", "\n", "dolor"]} | ${["lorem", "\n", "dolor"]} | ${"keep single EOL in the middle"}
          ${["lorem", "ipsum", "\n"]} | ${["lorem", "ipsum", "\n"]} | ${"keep single EOL at end"}
        `(
          `[$#] should keep single newline characters ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input);
            expect(actual).toMatchObject(expected);
          },
        );

        it.each`
          input                             | expected                        | comment
          ${["\n", "\n", "ipsum", "dolor"]} | ${["\n", "ipsum", "dolor"]}     | ${"Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior."}
          ${["lorem", "\n", "\n", "dolor"]} | ${[p(["lorem"]), p(["dolor"])]} | ${"respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph"}
          ${["lorem", "ipsum", "\n", "\n"]} | ${["lorem", "ipsum", "\n"]}     | ${"Design Scope: Squash newlines at the end as irrelevant to trigger as-paragraph-behavior."}
        `(
          `[$#] should handle consecutive EOL at threshold ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input);
            expect(actual).toMatchObject(expected);
          },
        );
      });

      describe("requireParagraph=true", () => {
        const options: ParagraphAwareContentOptions = { requireParagraph: true };

        it.each`
          input                       | expected                         | comment
          ${["\n", "ipsum", "dolor"]} | ${[p(["\n", "ipsum", "dolor"])]} | ${"keep single EOL at start"}
          ${["lorem", "\n", "dolor"]} | ${[p(["lorem", "\n", "dolor"])]} | ${"keep single EOL in the middle"}
          ${["lorem", "ipsum", "\n"]} | ${[p(["lorem", "ipsum"])]}       | ${"trim EOL at end"}
        `(
          `[$#] should keep single newline characters ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input, options);
            expect(actual).toMatchObject(expected);
          },
        );

        it.each`
          input                             | expected                         | comment
          ${["\n", "\n", "ipsum", "dolor"]} | ${[p(["\n", "ipsum", "dolor"])]} | ${"Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior."}
          ${["lorem", "\n", "\n", "dolor"]} | ${[p(["lorem"]), p(["dolor"])]}  | ${"respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph"}
          ${["lorem", "ipsum", "\n", "\n"]} | ${[p(["lorem", "ipsum"])]}       | ${"trim EOL at end"}
        `(
          `[$#] should handle consecutive EOL at threshold ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input, options);
            expect(actual).toMatchObject(expected);
          },
        );
      });
    });

    // -------------------------------------------------------------------------------[ content=(string|TagNode|EOL)[] ]
    describe(`content=(string|TagNode|EOL)[]: Content containing anything (including EOL characters)`, () => {
      describe("Default Options", () => {
        it.each`
          input                            | expected                         | comment
          ${["\n", b(["ipsum"]), "dolor"]} | ${["\n", b(["ipsum"]), "dolor"]} | ${"keep single EOL at start"}
          ${[b(["lorem"]), "\n", "dolor"]} | ${[b(["lorem"]), "\n", "dolor"]} | ${"keep single EOL in the middle"}
          ${["lorem", b(["ipsum"]), "\n"]} | ${["lorem", b(["ipsum"]), "\n"]} | ${"keep single EOL at end"}
        `(
          `[$#] should keep single newline characters ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input);
            expect(actual).toMatchObject(expected);
          },
        );

        it.each`
          input                                  | expected                             | comment
          ${["\n", "\n", b(["ipsum"]), "dolor"]} | ${["\n", b(["ipsum"]), "dolor"]}     | ${"Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior."}
          ${[b(["lorem"]), "\n", "\n", "dolor"]} | ${[p([b(["lorem"])]), p(["dolor"])]} | ${"respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph"}
          ${["lorem", b(["ipsum"]), "\n", "\n"]} | ${["lorem", b(["ipsum"]), "\n"]}     | ${"Design Scope: Squash newlines at the end as irrelevant to trigger as-paragraph-behavior."}
        `(
          `[$#] should handle consecutive EOL at threshold ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input);
            console.debug("DEBUG", {
              input: JSON.stringify(input),
              actual: JSON.stringify(actual),
              expected: JSON.stringify(expected),
            });
            expect(actual).toMatchObject(expected);
          },
        );
      });

      describe("requireParagraph=true", () => {
        const options: ParagraphAwareContentOptions = { requireParagraph: true };

        it.each`
          input                            | expected                              | comment
          ${["\n", b(["ipsum"]), "dolor"]} | ${[p(["\n", b(["ipsum"]), "dolor"])]} | ${"keep single EOL at start"}
          ${[b(["lorem"]), "\n", "dolor"]} | ${[p([b(["lorem"]), "\n", "dolor"])]} | ${"keep single EOL in the middle"}
          ${["lorem", b(["ipsum"]), "\n"]} | ${[p(["lorem", b(["ipsum"])])]}       | ${"trim EOL at end"}
        `(
          `[$#] should keep single newline characters ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input, options);
            expect(actual).toMatchObject(expected);
          },
        );

        it.each`
          input                                  | expected                              | comment
          ${["\n", "\n", b(["ipsum"]), "dolor"]} | ${[p(["\n", b(["ipsum"]), "dolor"])]} | ${"Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior."}
          ${[b(["lorem"]), "\n", "\n", "dolor"]} | ${[p([b(["lorem"])]), p(["dolor"])]}  | ${"respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph"}
          ${["lorem", b(["ipsum"]), "\n", "\n"]} | ${[p(["lorem", b(["ipsum"])])]}       | ${"trim EOL at end"}
        `(
          `[$#] should handle consecutive EOL at threshold ($comment): $input`,
          ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
            const actual = paragraphAwareContent(input, options);
            expect(actual).toMatchObject(expected);
          },
        );
      });
    });

    // -------------------------------------------------------------------------------------------[ Block Tag Handling ]
    describe("Block Tag Handling", () => {
      it.each`
        input                                                                                  | expected                                                               | comment
        ${[q(["lorem"])]}                                                                      | ${[q(["lorem"])]}                                                      | ${"single quote block only"}
        ${["lorem", q(["ipsum"]), "dolor"]}                                                    | ${[p(["lorem"]), q(["ipsum"]), p(["dolor"])]}                          | ${"add paragraphs only before and after"}
        ${["lorem", "\n", "\n", "ipsum", "\n", "\n", q(["dolor"]), "sit", "\n", "\n", "amet"]} | ${[p(["lorem"]), p(["ipsum"]), q(["dolor"]), p(["sit"]), p(["amet"])]} | ${"quote embedded in paragraphs"}
      `(
        "[$#] should not wrap (default) block tags within paragraphs: $comment",
        ({ input, expected }: { input: ContentFixture; expected: ContentFixture }) => {
          const options: ParagraphAwareContentOptions = { requireParagraph: true };
          const actual = paragraphAwareContent(input, options);
          expect(actual).toMatchObject(expected);
        },
      );
    });
  });
});
