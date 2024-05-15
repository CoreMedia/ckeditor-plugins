import {
  forEachAttribute,
  setAttributesFromTagAttrs,
  stripUniqueAttr,
  uniqueAttrToAttr,
} from "../../src/bbob/Attributes";
import { TagAttrs } from "@bbob/plugin-helper/es";

describe("Attributes", () => {
  describe("forEachAttribute", () => {
    it("should do nothing on empty record", () => {
      let called = false;
      forEachAttribute({}, () => (called = true));
      expect(called).toBe(false);
    });

    it("should process expected entries", () => {
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

  describe("setAttributesFromTagAttrs", () => {
    it("should not set any attribute on empty attributes", () => {
      const el = document.createElement("div");
      const originalLength = el.attributes.length;
      setAttributesFromTagAttrs(el, {});
      expect(el.attributes.length).toBe(originalLength);
    });

    it("should set normal attributes as given", () => {
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

    it("should ignore invalid attributes, but process others", () => {
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
  describe("stripUniqueAttr (BBob integration)", () => {
    it("should get only 'otherAttrs' for empty attributes", () => {
      const attr = stripUniqueAttr({});
      expect(attr.uniqueAttrValue).toBeUndefined();
      expect(attr.otherAttrs).toMatchObject({});
    });

    it("should get only 'otherAttrs' for attributes not having a unique attribute", () => {
      const attrs = {
        one: "1",
        two: "2",
      };
      const attr = stripUniqueAttr(attrs);
      expect(attr.uniqueAttrValue).toBeUndefined();
      expect(attr.otherAttrs).toMatchObject(attrs);
    });

    it("should extract unique attribute, if it is the only attribute", () => {
      const uniqueAttr = "https://example.org/";
      const attrs = {
        // Typical representation of a URL, for example, in [url=https://example.org/].
        [uniqueAttr]: uniqueAttr,
      };
      const attr = stripUniqueAttr(attrs);
      expect(attr.uniqueAttrValue).toBe(uniqueAttr);
      expect(attr.otherAttrs).toMatchObject({});
    });

    it("should extract unique attribute, and separate from others", () => {
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

  describe("uniqueAttrToAttr", () => {
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

    it.each`
      autCall                         | callType
      ${aut.callWithDefaults}         | ${"call with defaults"}
      ${aut.callWithOverrideEnabled}  | ${"call with override enabled"}
      ${aut.callWithOverrideDisabled} | ${"call with override disabled"}
    `("[$#] should return empty attributes unchanged: $callType", ({ autCall }: { autCall: AutCall }) => {
      const result = autCall("unique", {}, "uniqueDefault");
      expect(result).toMatchObject({});
    });

    it("should use default unique attribute for empty attributes", () => {
      const autCall = aut.callWithDefaultSupplied;
      const uniqueKey = "unique";
      const uniqueDefault = "uniqueDefault";
      const result = autCall(uniqueKey, {}, uniqueDefault);
      expect(result).toMatchObject({ [uniqueKey]: uniqueDefault });
    });

    it.each`
      autCall                        | callType
      ${aut.callWithDefaults}        | ${"call with defaults"}
      ${aut.callWithOverrideEnabled} | ${"call with override enabled"}
      ${aut.callWithDefaultSupplied} | ${"call with supplied default"}
    `("[$#] should override from unique attributes: $callType", ({ autCall }: { autCall: AutCall }) => {
      const uniqueKey = "unique";
      const uniqueValueInAttrs = "uniqueValueInAttrs";
      const uniqueValue = "uniqueValue";
      const uniqueDefault = "uniqueDefault";
      const result = autCall(uniqueKey, { [uniqueKey]: uniqueValueInAttrs, [uniqueValue]: uniqueValue }, uniqueDefault);
      expect(result).toMatchObject({ [uniqueKey]: uniqueValue });
    });

    it("should prefer existing attribute, when override is disabled", () => {
      const autCall = aut.callWithOverrideDisabled;
      const uniqueKey = "unique";
      const uniqueValueInAttrs = "uniqueValueInAttrs";
      const uniqueValue = "uniqueValue";
      const result = autCall(uniqueKey, { [uniqueKey]: uniqueValueInAttrs, [uniqueValue]: uniqueValue });

      expect(result).toMatchObject({ [uniqueKey]: uniqueValueInAttrs });
    });
  });
});
