import test, { describe, TestContext } from "node:test";
import expect from "expect";
import {
  DEFAULT_TARGETS_ARRAY,
  getDefaultTargetDefinition,
  requireDefaultTargetDefinition,
} from "../../../src/linktarget/config/DefaultTarget";

const defaultTargetCases = [
  { name: "_self", title: "Open in Current Tab" },
  { name: "_blank", title: "Open in New Tab" },
  { name: "_embed", title: "Show Embedded" },
  { name: "_other", title: "Open in Frame" },
];

const defTarget = "Default Standard Target";
const xLinkBehavior = "While used for xlink:show, not part of our standard definitions";
const htmlBehavior = "While standard HTML target, not part of our standard definitions";

const definitionExistsCases = [
  { name: "_self", exists: true, comment: defTarget },
  { name: "_blank", exists: true, comment: defTarget },
  { name: "_embed", exists: true, comment: defTarget },
  { name: "_other", exists: true, comment: defTarget },
  { name: "_other", exists: true, comment: defTarget },
  { name: "_none", exists: false, comment: xLinkBehavior },
  { name: "_parent", exists: false, comment: htmlBehavior },
  { name: "_top", exists: false, comment: htmlBehavior },
  { name: "custom", exists: false, comment: "Any custom target is not expected to be defined by default" },
];

void describe("DefaultTarget", () => {
  void describe("DEFAULT_TARGETS_ARRAY", () => {
    void test("should contain entries in expected order", () => {
      const names = DEFAULT_TARGETS_ARRAY.map((definition) => definition.name);
      // These are the buttons we want to see in the given order by default,
      // if no other configuration got provided.
      expect(names).toEqual(["_self", "_blank", "_embed", "_other"]);
    });

    void test("cases", async (t: TestContext) => {
      for (const [i, { name, title: expectedTitle }] of defaultTargetCases.entries()) {
        await t.test(`[${i}] Should provide expected title for ${name}: ${expectedTitle}`, () => {
          const options = DEFAULT_TARGETS_ARRAY.find((definition) => name === definition.name);
          // Precondition-check
          expect(options).toBeDefined();
          const { title: actualTitle } = options ?? { title: "unexpected undefined state" };
          expect(actualTitle).toStrictEqual(expectedTitle);
        });
      }
    });

    void test("cases", async (t: TestContext) => {
      for (const [i, { name }] of defaultTargetCases.entries()) {
        await t.test(`[${i}] Should provide an icon ${name}`, () => {
          const options = DEFAULT_TARGETS_ARRAY.find((definition) => name === definition.name);
          // Precondition-check
          expect(options).toBeDefined();
          // default: provoke failure, unexpected as previous check guaranteed options to be defined.
          const { icon: actualIcon } = options ?? { icon: false };
          expect(actualIcon).toBeTruthy();
        });
      }
    });

    void describe("getDefaultTargetDefinition", () => {
      void test("cases", async (t: TestContext) => {
        for (const [i, { name, exists, comment }] of definitionExistsCases.entries()) {
          await t.test(`[${i}] Expecting default definition for ${name}? ${exists} (${comment})`, () => {
            const definition = getDefaultTargetDefinition(name);
            if (exists) {
              expect(definition).toBeDefined();
            } else {
              expect(definition).toBeUndefined();
            }
          });
        }
      });

      void test("cases", async (t: TestContext) => {
        for (const [i, { name, title: expectedTitle }] of defaultTargetCases.entries()) {
          await t.test(`[${i}] Should provide expected title for ${name}: ${expectedTitle}`, () => {
            const options = getDefaultTargetDefinition(name);
            // Precondition-check
            expect(options).toBeDefined();
            const { title: actualTitle } = options ?? { title: "unexpected undefined state" };
            expect(actualTitle).toStrictEqual(expectedTitle);
          });
        }
      });

      void describe("requireDefaultTargetDefinition", () => {
        void test("cases", async (t: TestContext) => {
          for (const [i, { name, exists, comment }] of definitionExistsCases.entries()) {
            await t.test(`[${i}] Expecting default definition for ${name}? ${exists} (${comment})`, () => {
              const definitionCallback = () => requireDefaultTargetDefinition(name);
              if (exists) {
                expect(definitionCallback).not.toThrow();
              } else {
                expect(definitionCallback).toThrow();
              }
            });
          }
        });
      });
    });
  });
});
