/* eslint no-null/no-null: off */
import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { isRaw } from "../src/AdvancedTypes";

void describe("AdvancedTypes", () => {
  void describe("isRaw", () => {
    void test("Demonstrate Use Case", () => {
      const value = "some value";
      const obj: unknown = { value };

      let actual1: string | undefined;
      let actual2: string | undefined;

      if (typeof obj === "object" && !!obj) {
        if ("value" in obj) {
          // @ts-expect-error Due to microsoft/TypeScript#21732 this access will
          // be marked as error. If this shows an error, the issue seems to be
          // fixed, and the workaround can be removed.
          actual1 = obj.value;
        }
      }
      if (isRaw(obj, "value")) {
        // This would fail without isRaw having microsoft/TypeScript#21732
        if (typeof obj.value === "string") {
          actual2 = obj.value;
        }
      }
      expect(actual1).toStrictEqual(actual2);
    });

    const cases = ["string", ["string"], "", null, undefined, 0, 42, [0, 42], true, false, {}, { key: "value" }];

    void test("cases", async (t: TestContext) => {
      for (const [i, value] of cases.entries()) {
        await t.test(`[${i}] Should signal 'true' for existing property having value: '${value}'.`, () => {
          const obj = { value };
          expect(isRaw(obj, "value")).toStrictEqual(true);
        });
      }
    });

    void test("Should signal `false for missing property", () => {
      const value = "some value";
      const obj: unknown = { value };
      expect(isRaw(obj, "notExisting")).toStrictEqual(false);
    });
  });
});
