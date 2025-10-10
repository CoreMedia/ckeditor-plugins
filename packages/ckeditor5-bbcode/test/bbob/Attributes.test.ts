import "global-jsdom/register";
import test, { describe, TestContext } from "node:test";
import expect from "expect";
import { TagAttrs } from "@bbob/plugin-helper/es";
import {
  forEachAttribute,
  setAttributesFromTagAttrs,
  stripUniqueAttr,
  uniqueAttrToAttr,
} from "../../src/bbob/Attributes";

void describe("Attributes", () => {
  void describe("forEachAttribute", () => {
    void test("should do nothing on empty record", () => {
      let called = false;
      forEachAttribute({}, () => (called = true));
      expect(called).toBe(false);
    });

    void test("should process expected entries", () => {
      const probe: TagAttrs = {
        src: "SRC",
        otherSrc: "SRC",
        lorem: "LOREM",
        empty: "",
      };
      const processedEntries: [string, string][] = [];
      forEachAttribute(probe, (name, value) => processedEntries.push([name, value]));
      expect(Object.fromEntries(processedEntries)).toMatchObject(probe);
    });
  });

  void describe("setAttributesFromTagAttrs", () => {
    void test("should not set any attribute on empty attributes", () => {
      const el = document.createElement("div");
      const originalLength = el.attributes.length;
      setAttributesFromTagAttrs(el, {});
      expect(el.attributes.length).toBe(originalLength);
    });

    void test("should set normal attributes as given", () => {
      const el = document.createElement("div");
      const attrs: TagAttrs = {
        class: "CLASS",
        style: "STYLE",
        title: "",
      };
      setAttributesFromTagAttrs(el, attrs);
      Object.entries(attrs).forEach(([name, value]) => {
        expect(el.getAttribute(name)).toBe(value);
      });
    });

    void test("should ignore invalid attributes, but process others", () => {
      const el = document.createElement("div");
      const invalidKey = "[invalid key]";
      const attrs: TagAttrs = {
        class: "CLASS",
        [invalidKey]: "INVALID",
        style: "STYLE",
      };
      setAttributesFromTagAttrs(el, attrs);
      Object.entries(attrs)
        .filter(([name]) => name !== invalidKey)
        .forEach(([name, value]) => {
          expect(el.getAttribute(name)).toBe(value);
        });
    });
  });

  /**
   * This is to some degree an integration test with BBob. If they consider
   * to change the representation/handling of unique attributes the following
   * tests may break, and we may need to investigate how to deal with the
   * results.
   */
  void describe("stripUniqueAttr (BBob integration)", () => {
    void test("should get only 'otherAttrs' for empty attributes", () => {
      const attr = stripUniqueAttr({});
      expect(attr.uniqueAttrValue).toBeUndefined();
      expect(attr.otherAttrs).toMatchObject({});
    });

    void test("should get only 'otherAttrs' for attributes not having a unique attribute", () => {
      const attrs = {
        one: "1",
        two: "2",
      };
      const attr = stripUniqueAttr(attrs);
      expect(attr.uniqueAttrValue).toBeUndefined();
      expect(attr.otherAttrs).toMatchObject(attrs);
    });

    void test("should extract unique attribute, if it is the only attribute", () => {
      const uniqueAttr = "https://example.org/";
      const attrs = {
        // Typical representation of a URL, for example, in [url=https://example.org/].
        [uniqueAttr]: uniqueAttr,
      };
      const attr = stripUniqueAttr(attrs);
      expect(attr.uniqueAttrValue).toBe(uniqueAttr);
      expect(attr.otherAttrs).toMatchObject({});
    });

    void test("should extract unique attribute, and separate from others", () => {
      const uniqueAttr = "https://example.org/";
      const otherAttrs = {
        one: "1",
        two: "2",
      };
      const attrs = {
        // For current implementation, it is important that other attributes
        // come first.
        ...otherAttrs,
        // Typical representation of a URL, for example, in [url=https://example.org/].
        [uniqueAttr]: uniqueAttr,
      };
      const attr = stripUniqueAttr(attrs);
      expect(attr.uniqueAttrValue).toBe(uniqueAttr);
      expect(attr.otherAttrs).toMatchObject(otherAttrs);
    });
  });

  void describe("uniqueAttrToAttr", () => {
    type AutCall = (uniqueAttrName: string, attrs: TagAttrs, uniqueDefault: string) => TagAttrs;
    const aut = {
      callWithDefaults: (uniqueAttrName: string, attrs: TagAttrs) => uniqueAttrToAttr(uniqueAttrName, attrs),
      callWithOverrideEnabled: (uniqueAttrName: string, attrs: TagAttrs) =>
        uniqueAttrToAttr(uniqueAttrName, attrs, true),
      callWithOverrideDisabled: (uniqueAttrName: string, attrs: TagAttrs) =>
        uniqueAttrToAttr(uniqueAttrName, attrs, false),
      callWithDefaultSupplied: (uniqueAttrName: string, attrs: TagAttrs, uniqueDefault: string) =>
        uniqueAttrToAttr(uniqueAttrName, attrs, true, () => uniqueDefault),
    };

    const emptyAttrCases: { autCall: AutCall; callType: string }[] = [
      {
        autCall: aut.callWithDefaults,
        callType: "call with defaults",
      },
      {
        autCall: aut.callWithOverrideEnabled,
        callType: "call with override enabled",
      },
      {
        autCall: aut.callWithOverrideDisabled,
        callType: "call with override disabled",
      },
    ] as const;

    void test("cases", async (t: TestContext) => {
      for (const [i, { autCall, callType }] of emptyAttrCases.entries()) {
        await t.test(`[${i}] should return empty attributes unchanged: ${callType}`, () => {
          const result = autCall("unique", {}, "uniqueDefault");
          expect(result).toMatchObject({});
        });
      }
    });

    void test("should use default unique attribute for empty attributes", () => {
      const autCall = aut.callWithDefaultSupplied;
      const uniqueKey = "unique";
      const uniqueDefault = "uniqueDefault";
      const result = autCall(uniqueKey, {}, uniqueDefault);
      expect(result).toMatchObject({ [uniqueKey]: uniqueDefault });
    });

    const uniqueAttrCases = [
      {
        autCall: aut.callWithDefaults,
        callType: "call with defaults",
      },
      {
        autCall: aut.callWithOverrideEnabled,
        callType: "call with override enabled",
      },
      {
        autCall: aut.callWithDefaultSupplied,
        callType: "call with supplied default",
      },
    ];

    void test("cases", async (t: TestContext) => {
      for (const [i, { autCall, callType }] of uniqueAttrCases.entries()) {
        await t.test(`[${i}] should override from unique attributes: ${callType}`, () => {
          const uniqueKey = "unique";
          const uniqueValueInAttrs = "uniqueValueInAttrs";
          const uniqueValue = "uniqueValue";
          const uniqueDefault = "uniqueDefault";
          const result = autCall(
            uniqueKey,
            { [uniqueKey]: uniqueValueInAttrs, [uniqueValue]: uniqueValue },
            uniqueDefault,
          );
          expect(result).toMatchObject({ [uniqueKey]: uniqueValue });
        });
      }
    });

    void test("should prefer existing attribute, when override is disabled", () => {
      const autCall = aut.callWithOverrideDisabled;
      const uniqueKey = "unique";
      const uniqueValueInAttrs = "uniqueValueInAttrs";
      const uniqueValue = "uniqueValue";
      const result = autCall(uniqueKey, { [uniqueKey]: uniqueValueInAttrs, [uniqueValue]: uniqueValue });

      expect(result).toMatchObject({ [uniqueKey]: uniqueValueInAttrs });
    });
  });
});
