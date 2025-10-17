import type { TestContext } from "node:test";
import test, { describe } from "node:test";
import expect from "expect";
import type { ParagraphAwareContentOptions } from "../../src/bbob/Paragraphs";
import { paragraphAwareContent } from "../../src/bbob/Paragraphs";

const { TagNode } = await import("@bbob/plugin-helper");

type TagNodeType = ReturnType<typeof TagNode.create>;

type ContentFixture = NonNullable<TagNodeType["content"]>;

const p = (content: ContentFixture): TagNodeType => TagNode.create("p", {}, content);
/**
 * Just any inline tag-node.
 */
const b = (content: ContentFixture): TagNodeType => TagNode.create("b", {}, content);
/**
 * Shortcut to add `quote` node.
 */
const q = (content: ContentFixture): TagNodeType => TagNode.create("quote", {}, content);

describe(`Paragraphs`, () => {
  // ==========================================================================================[ paragraphAwareContent ]
  describe(`paragraphAwareContent`, () => {
    // ---------------------------------------------------------------------------------------------------[ content=[] ]
    describe(`content=[]`, () => {
      void test(`should return "[]" with default options`, () => {
        expect({ expected: paragraphAwareContent([]) }).toMatchObject({ expected: [] });
      });

      void test(`should return "[]" wrapped in paragraph with "requireParagraph=true"`, () => {
        const expected = [TagNode.create("p", {}, [])];
        expect({ expected: paragraphAwareContent([], { requireParagraph: true }) }).toMatchObject({ expected });
      });
    });

    // ---------------------------------------------------------------------------------------------[ content=string[] ]
    describe(`content=string[]: Content only containing strings without EOL characters`, () => {
      void test(`should skip extra paragraph (requireParagraphs=default false)`, () => {
        const input = ["lorem", "ipsum"];
        expect({ expected: paragraphAwareContent(input) }).toMatchObject({ expected: input });
      });

      void test(`should wrap content into paragraph (requireParagraphs=true)`, () => {
        const input = ["lorem", "ipsum"];
        const expected = [TagNode.create("p", {}, input)];
        expect({ expected: paragraphAwareContent(input, { requireParagraph: true }) }).toMatchObject({ expected });
      });
    });

    // -----------------------------------------------------------------------------------[ content=(string|TagNodeType)[] ]
    describe(`content=(string|TagNode)[]: Content only containing strings and tag-nodes without EOL characters`, () => {
      const cases: { input: ContentFixture; comment: string }[] = [
        {
          input: [b(["lorem"]), "ipsum", "dolor"],
          comment: "tag-node at start",
        },
        {
          input: ["lorem", b(["ipsum"]), "dolor"],
          comment: "tag-node in the middle",
        },
        {
          input: ["lorem", "ipsum", b(["dolor"])],
          comment: "tag-node at the end",
        },
      ] as const;

      void test("cases", async (t: TestContext) => {
        for (const [i, { input, comment }] of cases.entries()) {
          await t.test(
            `[${i}] should skip extra paragraph (requireParagraphs=default false, ${comment}): ${input}`,
            () => {
              expect({ expected: paragraphAwareContent(input) }).toMatchObject({ expected: input });
            },
          );
        }
      });

      const wrapParagraphCases: { input: (TagNodeType | string)[]; comment: string }[] = [
        { input: [b(["lorem"]), "ipsum", "dolor"], comment: "tag-node at start" },
        { input: ["lorem", b(["ipsum"]), "dolor"], comment: "tag-node in the middle" },
        { input: ["lorem", "ipsum", b(["dolor"])], comment: "tag-node at the end" },
      ];

      void test("cases", async (t: TestContext) => {
        for (const [i, { input, comment }] of wrapParagraphCases.entries()) {
          await t.test(
            `[${i}] should wrap content into paragraph (requireParagraphs=default true, ${comment}): ${input}`,
            () => {
              const expected = [TagNode.create("p", {}, input)];
              const actual = paragraphAwareContent(input, { requireParagraph: true });
              expect({ expected: actual }).toMatchObject({ expected });
            },
          );
        }
      });
    });

    // ------------------------------------------------------------------------------------------------[ content=EOL[] ]
    describe(`content=EOL[]: Content consisting of EOLs only`, () => {
      const cases: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
        { input: ["\n"], expected: ["\n"], comment: "keep single newline as is" },
        { input: ["\n", "\n"], expected: ["\n"], comment: "squash newlines, keep at least one" },
        { input: ["\n", "\n", "\n"], expected: ["\n"], comment: "squash newlines, keep at least one" },
      ] as const;

      void test("cases", async (t: TestContext) => {
        for (const [i, { input, expected, comment }] of cases.entries()) {
          await t.test(`[${i}] should transform from ${input} to ${expected} (all defaults): ${comment}`, () => {
            const actual = paragraphAwareContent(input);
            expect({ expected: actual }).toMatchObject({ expected });
          });
        }
      });

      const trimNewlineCases: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
        { input: ["\n"], expected: [p([])], comment: "Design scope: Trim irrelevant newline" },
        { input: ["\n", "\n"], expected: [p([])], comment: "Design scope: Trim irrelevant newline" },
        { input: ["\n", "\n", "\n"], expected: [p([])], comment: "Design scope: Trim irrelevant newline" },
      ] as const;

      void test("cases", async (t: TestContext) => {
        for (const [i, { input, expected, comment }] of trimNewlineCases.entries()) {
          await t.test(
            `[${i}] should transform from ${input} to ${expected} (requireParagraph=true): ${comment}`,
            () => {
              const options: ParagraphAwareContentOptions = { requireParagraph: true };
              const actual = paragraphAwareContent(input, options);
              expect({ expected: actual }).toMatchObject({ expected });
            },
          );
        }
      });

      // ---------------------------------------------------------------------------------------[ content=(string|EOL)[] ]
      describe(`content=(string|EOL)[]: Content only containing strings (including EOL characters)`, () => {
        void describe("Default Options", () => {
          const singleEOLCases: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", "ipsum", "dolor"],
              expected: ["\n", "ipsum", "dolor"],
              comment: "keep single EOL at start",
            },
            {
              input: ["lorem", "\n", "dolor"],
              expected: ["lorem", "\n", "dolor"],
              comment: "keep single EOL in the middle",
            },
            { input: ["lorem", "ipsum", "\n"], expected: ["lorem", "ipsum", "\n"], comment: "keep single EOL at end" },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of singleEOLCases.entries()) {
              await t.test(`[${i}] should keep single newline characters (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });

          const squashNewlinesCases: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", "\n", "ipsum", "dolor"],
              expected: ["\n", "ipsum", "dolor"],
              comment: "Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior.",
            },
            {
              input: ["lorem", "\n", "\n", "dolor"],
              expected: [p(["lorem"]), p(["dolor"])],
              comment:
                "respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph",
            },
            {
              input: ["lorem", "ipsum", "\n", "\n"],
              expected: ["lorem", "ipsum", "\n"],
              comment: "Design Scope: Squash newlines at the end as irrelevant to trigger as-paragraph-behavior.",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of squashNewlinesCases.entries()) {
              await t.test(`[${i}] should handle consecutive EOL at threshold (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });
        });

        void describe("requireParagraph=true", () => {
          const options: ParagraphAwareContentOptions = { requireParagraph: true };

          const paragraphizeSingleEOLCases: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", "ipsum", "dolor"],
              expected: [p(["\n", "ipsum", "dolor"])],
              comment: "keep single EOL at start",
            },
            {
              input: ["lorem", "\n", "dolor"],
              expected: [p(["lorem", "\n", "dolor"])],
              comment: "keep single EOL in the middle",
            },
            {
              input: ["lorem", "ipsum", "\n"],
              expected: [p(["lorem", "ipsum"])],
              comment: "trim EOL at end",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of paragraphizeSingleEOLCases.entries()) {
              await t.test(`[${i}] should keep single newline characters (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input, options);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });

          const paragraphizeMultipleEOLCases: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", "\n", "ipsum", "dolor"],
              expected: [p(["\n", "ipsum", "dolor"])],
              comment: "Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior.",
            },
            {
              input: ["lorem", "\n", "\n", "dolor"],
              expected: [p(["lorem"]), p(["dolor"])],
              comment:
                "respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph",
            },
            {
              input: ["lorem", "ipsum", "\n", "\n"],
              expected: [p(["lorem", "ipsum"])],
              comment: "trim EOL at end",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of paragraphizeMultipleEOLCases.entries()) {
              await t.test(`[${i}] should handle consecutive EOL at threshold (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input, options);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });
        });
      });

      // -------------------------------------------------------------------------------[ content=(string|TagNode|EOL)[] ]
      describe(`content=(string|TagNode|EOL)[]: Content containing anything (including EOL characters)`, () => {
        void describe("Default Options", () => {
          const singleEOLWithTagNodes: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", b(["ipsum"]), "dolor"],
              expected: ["\n", b(["ipsum"]), "dolor"],
              comment: "keep single EOL at start",
            },
            {
              input: [b(["lorem"]), "\n", "dolor"],
              expected: [b(["lorem"]), "\n", "dolor"],
              comment: "keep single EOL in the middle",
            },
            {
              input: ["lorem", b(["ipsum"]), "\n"],
              expected: ["lorem", b(["ipsum"]), "\n"],
              comment: "keep single EOL at end",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of singleEOLWithTagNodes.entries()) {
              await t.test(`[${i}] should keep single newline characters (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });

          const multipleEOLWithTagNodes: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", "\n", b(["ipsum"]), "dolor"],
              expected: ["\n", b(["ipsum"]), "dolor"],
              comment: "Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior.",
            },
            {
              input: [b(["lorem"]), "\n", "\n", "dolor"],
              expected: [p([b(["lorem"])]), p(["dolor"])],
              comment:
                "respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph",
            },
            {
              input: ["lorem", b(["ipsum"]), "\n", "\n"],
              expected: ["lorem", b(["ipsum"]), "\n"],
              comment: "Design Scope: Squash newlines at the end as irrelevant to trigger as-paragraph-behavior.",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of multipleEOLWithTagNodes.entries()) {
              await t.test(`[${i}] should handle consecutive EOL at threshold (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });
        });

        void describe("requireParagraph=true", () => {
          const options: ParagraphAwareContentOptions = { requireParagraph: true };

          const singleEOLWithTagNodes: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", b(["ipsum"]), "dolor"],
              expected: [p(["\n", b(["ipsum"]), "dolor"])],
              comment: "keep single EOL at start",
            },
            {
              input: [b(["lorem"]), "\n", "dolor"],
              expected: [p([b(["lorem"]), "\n", "dolor"])],
              comment: "keep single EOL in the middle",
            },
            {
              input: ["lorem", b(["ipsum"]), "\n"],
              expected: [p(["lorem", b(["ipsum"])])],
              comment: "trim EOL at end",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of singleEOLWithTagNodes.entries()) {
              await t.test(`[${i}] should keep single newline characters (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input, options);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });

          const multipleEOLWithTagNodes: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
            {
              input: ["\n", "\n", b(["ipsum"]), "dolor"],
              expected: [p(["\n", b(["ipsum"]), "dolor"])],
              comment: "Design Scope: Squash newlines irrelevant to trigger as-paragraph-behavior.",
            },
            {
              input: [b(["lorem"]), "\n", "\n", "dolor"],
              expected: [p([b(["lorem"])]), p(["dolor"])],
              comment:
                "respect EOL above threshold in the middle; ensure, that subsequent text-nodes must also be added to a paragraph",
            },
            {
              input: ["lorem", b(["ipsum"]), "\n", "\n"],
              expected: [p(["lorem", b(["ipsum"])])],
              comment: "trim EOL at end",
            },
          ] as const;

          void test("cases", async (t: TestContext) => {
            for (const [i, { input, expected, comment }] of multipleEOLWithTagNodes.entries()) {
              await t.test(`[${i}] should handle consecutive EOL at threshold (${comment}): ${input}`, () => {
                const actual = paragraphAwareContent(input, options);
                expect({ expected: actual }).toMatchObject({ expected });
              });
            }
          });
        });
      });

      // -------------------------------------------------------------------------------------------[ Block Tag Handling ]
      void describe("Block Tag Handling", () => {
        const quoteBlocksWithParagraphs: { input: ContentFixture; expected: ContentFixture; comment: string }[] = [
          {
            input: [q(["lorem"])],
            expected: [q(["lorem"])],
            comment: "single quote block only",
          },
          {
            input: ["lorem", q(["ipsum"]), "dolor"],
            expected: [p(["lorem"]), q(["ipsum"]), p(["dolor"])],
            comment: "add paragraphs only before and after",
          },
          {
            input: ["lorem", "\n", "\n", "ipsum", "\n", "\n", q(["dolor"]), "sit", "\n", "\n", "amet"],
            expected: [p(["lorem"]), p(["ipsum"]), q(["dolor"]), p(["sit"]), p(["amet"])],
            comment: "quote embedded in paragraphs",
          },
        ] as const;

        void test("cases", async (t: TestContext) => {
          for (const [i, { input, expected, comment }] of quoteBlocksWithParagraphs.entries()) {
            await t.test(`[${i}] should not wrap (default) block tags within paragraphs: ${comment}`, () => {
              const options: ParagraphAwareContentOptions = { requireParagraph: true };
              const actual = paragraphAwareContent(input, options);
              expect({ expected: actual }).toMatchObject({ expected });
            });
          }
        });
      });
    });
  });
});
