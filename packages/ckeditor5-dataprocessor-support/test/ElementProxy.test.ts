/* eslint no-null/no-null: off */

import "global-jsdom/register";
import test, { describe } from "node:test";
import expect from "expect";
import { Editor } from "ckeditor5";
import type { ElementFilterParams, ElementFilterRule } from "../src/ElementProxy";
import { ElementProxy } from "../src/ElementProxy";
import "./config";

//@ts-expect-error We should rather mock ClassicEditor or similar here.
const MOCK_EDITOR = new Editor({ licenseKey: process.env.CKEDITOR_LICENSE_KEY });

/*
 * =============================================================================
 *
 * Helper Functions
 *
 * =============================================================================
 */

function requireValidXml(xmlString: string): Document {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(xmlString, "text/xml");
  const xPathResult: XPathResult = xmlDocument.evaluate(
    "/parsererror/text()",
    xmlDocument,
    null,
    XPathResult.STRING_TYPE,
  );
  if (xPathResult.stringValue) {
    throw new Error(`Error while parsing XML: ${xPathResult.stringValue}\n\tXML: ${xmlString}`);
  }
  return xmlDocument;
}

/*
 * =============================================================================
 *
 * Wrapping
 *
 * =============================================================================
 */

test("should wrap DOM element", () => {
  const htmlDivElement = window.document.createElement("div");
  const mutableElement = new ElementProxy(htmlDivElement, MOCK_EDITOR);
  expect(mutableElement.element).toStrictEqual(htmlDivElement);
});

/*
 * =============================================================================
 *
 * Mutability Handling
 *
 * =============================================================================
 */
void describe("Should Respecting (Im-)Mutable State", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("class", "testClass");
  const immutableElement = new ElementProxy(htmlDivElement, MOCK_EDITOR, {}, false);
  void test("should not be able to delete element", () => {
    expect(() => (immutableElement.remove = true)).toThrow(Error);
  });
  void test("should not be able to replace element by children", () => {
    expect(() => (immutableElement.replaceByChildren = true)).toThrow(Error);
  });
  void test("should not be able to change name", () => {
    const getValue = () => immutableElement.name;
    const previousValue = getValue();
    expect(() => (immutableElement.name = "test")).toThrow(Error);
    expect(getValue()).toStrictEqual(previousValue);
  });
  void test("should not be able to change attribute value", () => {
    const getValue = () => immutableElement.attributes.class;
    const previousValue = getValue();
    expect(() => (immutableElement.attributes.class = "test")).toThrow(Error);
    expect(getValue()).toStrictEqual(previousValue);
  });
  void test("should not be able to add additional class", () => {
    const getValue = () => immutableElement.classList;
    const previousValue = getValue();
    expect(() => immutableElement.classList.add("test")).toThrow(Error);
    expect(getValue()).toStrictEqual(previousValue);
  });
  void test("should not be able to add attribute", () => {
    const getValue = () => immutableElement.attributes.id;
    const previousValue = getValue();
    expect(() => (immutableElement.attributes.id = "test")).toThrow(Error);
    expect(getValue()).toStrictEqual(previousValue);
  });
  void test("should not be able to delete attribute", () => {
    const getValue = () => immutableElement.attributes.id;
    const previousValue = getValue();
    expect(() => delete immutableElement.attributes.class).toThrow(Error);
    expect(getValue()).toStrictEqual(previousValue);
  });
});

/*
 * =============================================================================
 *
 * classList Attribute Handling
 *
 * =============================================================================
 */

void describe("ElementProxy.classList", () => {
  let domElement = window.document.createElement("div");
  // DOM Element to compare handling with.
  const cmpElement = window.document.createElement("div");
  let proxy = new ElementProxy(domElement, MOCK_EDITOR);

  /**
   * Sets the class attribute value for both, DOM reference as
   * proxied DOM element. If `null`, the class attribute is removed
   * instead.
   *
   * @param domClass - class to set; `null`to remove class attribute
   */
  const setClass = (domClass: string | null): void => {
    if (typeof domClass === "string") {
      domElement.setAttribute("class", domClass);
      cmpElement.setAttribute("class", domClass);
    } else {
      domElement.removeAttribute("class");
      cmpElement.removeAttribute("class");
    }
  };

  /**
   * Runs several validations on proxy and the proxied DOM element. In addition
   * to that, provides a comparison of proxy and real DOM element behavior.
   *
   * @param valueBefore - the value, the class attribute had before; used to validate,
   * that the proxied DOM element did not change
   * @param expectedValue - expected value of class attribute; will be validated on proxy as well as on reference
   * DOM element
   * @param expectedCount - number of class entries we expect
   */
  const validate = (valueBefore: string | null, expectedValue: string, expectedCount: number): void => {
    // Proxy: Should represent expected classList.value.
    expect(proxy.classList.value).toStrictEqual(expectedValue);
    // Proxy: Should represent expected classList.length.
    expect(proxy.classList.length).toStrictEqual(expectedCount);
    // Proxy vs. Default: classList.value should be same on proxy and reference DOM element.
    expect(proxy.classList.value).toStrictEqual(cmpElement.classList.value);
    // Proxy vs. Default: classList.length should be same on proxy and reference DOM element.
    expect(proxy.classList.length).toStrictEqual(cmpElement.classList.length);
    // Proxy: Don't change proxied element (yet, will be done on `persist`).
    expect(domElement.getAttribute("class")).toStrictEqual(valueBefore);
  };
  beforeEach(() => {
    domElement = window.document.createElement("div");
    proxy = new ElementProxy(domElement, MOCK_EDITOR);
  });
  void describe("classList.value", () => {
    const classCases = [
      ["", "Empty class should stay as is."],
      ["some--class", "Plain class should stay as is."],
      [" \tsome--class", "Should not normalize leading space characters."],
      ["some--class\t ", "Should not normalize trailing space characters."],
      ["some--class\t some--other-class", "Should not normalize inner space characters."],
    ];

    for (const [domClass, comment] of classCases) {
      describe(`[${comment}] classList.value for unmodified state`, () => {
        void test("Should not normalize on plain get", () => {
          setClass(domClass);
          expect(proxy.classList.value).toStrictEqual(domClass);
        });

        void test("Should not normalize on plain set", () => {
          proxy.classList.value = domClass;
          cmpElement.classList.value = domClass;
          expect(proxy.classList.value).toStrictEqual(domClass);
          expect(proxy.classList.value).toStrictEqual(cmpElement.classList.value);
        });
      });
    }
  });
  void describe("classList.add", () => {
    const addCases: [string | null, string | string[], string, number, string][] = [
      [null, "new", "new", 1, "Should add class if not existing"],
      ["old", "new", "old new", 2, "Should add new class after previous"],
      [" \told1 \told2 \t", "new", "old1 old2 new", 3, "Should normalize old data on modification"],
      ["old", ["new1", "new2"], "old new1 new2", 3, "Should be able adding multiple values"],
    ];

    for (const [before, add, after, count, comment] of addCases) {
      void test(`[${comment}] classList.add: [${before}] + [${add}] = [${after}] (${count})`, () => {
        setClass(before);

        if (typeof add === "string") {
          proxy.classList.add(add);
          cmpElement.classList.add(add);
        } else {
          proxy.classList.add(...add);
          cmpElement.classList.add(...add);
        }

        validate(before, after, count);
      });
    }

    const invalidAddCases = [
      "new value",
      " new",
      "new ",
      "new\tvalue",
      "\tnew",
      "new\t",
      "",
      ["other", ""],
      ["other", "new value"],
    ];

    for (const add of invalidAddCases) {
      void test(`[classList.add] Should fail adding invalid token '${add}'.`, () => {
        setClass("some");

        let proxyFunc: () => void;
        let cmpFunc: () => void;

        if (typeof add === "string") {
          proxyFunc = () => proxy.classList.add(add);
          cmpFunc = () => cmpElement.classList.add(add);
        } else {
          proxyFunc = () => proxy.classList.add(...add);
          cmpFunc = () => cmpElement.classList.add(...add);
        }

        expect(proxyFunc).toThrow();
        expect(cmpFunc).toThrow();
      });
    }
  });
  void describe("classList.remove", () => {
    const removeCases = [
      { before: null, remove: "any", after: "", count: 0, comment: "Should not fail on remove from unset" },
      { before: "", remove: "any", after: "", count: 0, comment: "Should not fail on remove from empty" },
      {
        before: " \told1 \told2 \t",
        remove: "any",
        after: "old1 old2",
        count: 2,
        comment: "Should normalize, even if removed value does not exist",
      },
      { before: "old trash", remove: "trash", after: "old", count: 1, comment: "Should remove given value" },
      {
        before: "trash old trash",
        remove: "trash",
        after: "old",
        count: 1,
        comment: "Should completely remove given value, even if it existed multiple times",
      },
      {
        before: "trash1 old trash2",
        remove: ["trash1", "trash2"],
        after: "old",
        count: 1,
        comment: "Should remove all given values",
      },
      {
        before: " \told1 \ttrash \told2 \t",
        remove: "trash",
        after: "old1 old2",
        count: 2,
        comment: "Should normalize old data on modification",
      },
    ];

    for (const { before, remove, after, count, comment } of removeCases) {
      void test(`[classList.remove] ${comment}: [${before}] - [${remove}] = [${after}] (${count})`, () => {
        setClass(before);
        if (typeof remove === "string") {
          proxy.classList.remove(remove);
          cmpElement.classList.remove(remove);
        } else {
          proxy.classList.remove(...remove);
          cmpElement.classList.remove(...remove);
        }
        validate(before, after, count);
      });
    }

    const invalidRemoveCases = [
      "new value",
      " new",
      "new ",
      "new\tvalue",
      "\tnew",
      "new\t",
      "",
      ["other", ""],
      ["other", "new value"],
    ];

    for (const remove of invalidRemoveCases) {
      void test(`[classList.remove] Should fail removing invalid token '${remove}'`, () => {
        setClass("some");

        let proxyFunc: () => void;
        let cmpFunc: () => void;

        if (typeof remove === "string") {
          proxyFunc = () => proxy.classList.remove(remove);
          cmpFunc = () => cmpElement.classList.remove(remove);
        } else {
          proxyFunc = () => proxy.classList.remove(...remove);
          cmpFunc = () => cmpElement.classList.remove(...remove);
        }

        expect(proxyFunc).toThrow();
        expect(cmpFunc).toThrow();
      });
    }
  });
  void describe("classList.replace", () => {
    const replaceCases = [
      {
        before: null,
        replace: "any",
        replaceBy: "other",
        after: "",
        count: 0,
        comment: "Should not fail on replace on unset",
      },
      {
        before: "",
        replace: "any",
        replaceBy: "other",
        after: "",
        count: 0,
        comment: "Should not fail on replace on empty",
      },
      {
        before: "old",
        replace: "any",
        replaceBy: "other",
        after: "old",
        count: 1,
        comment: "Should not change on no match",
      },
      {
        before: "b-value-e",
        replace: "value",
        replaceBy: "new",
        after: "b-value-e",
        count: 1,
        comment: "Should not replace partial matches",
      },
      {
        before: "old",
        replace: "old",
        replaceBy: "new",
        after: "new",
        count: 1,
        comment: "Should replace given class",
      },
      {
        before: "old old",
        replace: "old",
        replaceBy: "new",
        after: "new",
        count: 1,
        comment: "Should replace given class, removing duplicates",
      },
      {
        before: "before old after",
        replace: "old",
        replaceBy: "new",
        after: "before new after",
        count: 3,
        comment: "Should replace given class at same location",
      },
      {
        before: " \tbefore \told \tafter \t",
        replace: "old",
        replaceBy: "new",
        after: "before new after",
        count: 3,
        comment: "Should normalize on replace",
      },
      {
        before: "old value",
        replace: "old",
        replaceBy: "value",
        after: "value",
        count: 1,
        comment: "Should remove duplicates after replacement",
      },
    ];

    for (const { before, replace, replaceBy, after, count, comment } of replaceCases) {
      void test(`[classList.replace] ${comment}: [${before}]/s/[${replace}]/[${replaceBy}]/g = [${after}] (${count})`, () => {
        setClass(before);
        proxy.classList.replace(replace, replaceBy);
        cmpElement.classList.replace(replace, replaceBy);
        validate(before, after, count);
      });
    }

    const invalidReplaceCases = [
      { replace: " \told \t", replaceBy: "new" },
      { replace: "old", replaceBy: " \tnew \t" },
    ];

    for (const { replace, replaceBy } of invalidReplaceCases) {
      void test(`[classList.replace] Should fail replacing with invalid tokens: '${replace}' by '${replaceBy}'.`, () => {
        setClass("some");
        const proxyFunc = () => proxy.classList.replace(replace, replaceBy);
        const cmpFunc = () => cmpElement.classList.replace(replace, replaceBy);
        expect(proxyFunc).toThrow();
        expect(cmpFunc).toThrow();
      });
    }
  });
  void describe("classList.toggle", () => {
    const toggleCases = [
      {
        before: null,
        toggle: "toggled",
        force: undefined,
        after: "toggled",
        count: 1,
        comment: "Should add value on unset",
      },
      {
        before: "",
        toggle: "toggled",
        force: undefined,
        after: "toggled",
        count: 1,
        comment: "Should add value on empty",
      },
      {
        before: "toggling",
        toggle: "toggling",
        force: undefined,
        after: "",
        count: 0,
        comment: "Should remove value on match",
      },
      {
        before: "old1 toggling old2",
        toggle: "toggling",
        force: undefined,
        after: "old1 old2",
        count: 2,
        comment: "Should remove value within others on match",
      },
      {
        before: " \told1 \ttoggling \told2 \t",
        toggle: "toggling",
        force: undefined,
        after: "old1 old2",
        count: 2,
        comment: "Should normalize original value",
      },
      {
        before: "toggling old toggling",
        toggle: "toggling",
        force: undefined,
        after: "old",
        count: 1,
        comment: "Should toggle all matches off",
      },
      {
        before: "old",
        toggle: "toggled",
        force: undefined,
        after: "old toggled",
        count: 2,
        comment: "Should add toggled last",
      },
      {
        before: "b-value-e",
        toggle: "value",
        force: undefined,
        after: "b-value-e value",
        count: 2,
        comment: "Should ignore partial matches",
      },
      {
        before: "old",
        toggle: "toggling",
        force: true,
        after: "old toggling",
        count: 2,
        comment: "Should add class enforcing addition if not existing yet",
      },
      {
        before: "old toggling",
        toggle: "toggling",
        force: true,
        after: "old toggling",
        count: 2,
        comment: "Should not change enforcing toggled class if existing",
      },
      {
        before: "old",
        toggle: "toggling",
        force: false,
        after: "old",
        count: 1,
        comment: "Should not change enforcing removal of toggled class if not existing",
      },
      {
        before: "old toggling",
        toggle: "toggling",
        force: false,
        after: "old",
        count: 1,
        comment: "Should remove value class enforcing removal if still existing",
      },
    ];

    for (const { before, toggle, force, after, count, comment } of toggleCases) {
      void test(`[classList.toggle] ${comment}: [${before}]/toggle/[${toggle}]/f=${force} = [${after}] (${count})`, () => {
        setClass(before);
        proxy.classList.toggle(toggle, force);
        cmpElement.classList.toggle(toggle, force);
        validate(before, after, count);
      });
    }

    const invalidToggleCases = [
      { toggle: " \ttoggling \t", force: undefined },
      { toggle: " \ttoggling \t", force: true },
      { toggle: " \ttoggling \t", force: false },
    ];

    for (const { toggle, force } of invalidToggleCases) {
      void test(`[classList.toggle] Should fail toggling to invalid token '${toggle}' (force-mode: ${force})`, () => {
        setClass("some");
        const proxyFunc = () => proxy.classList.toggle(toggle, force);
        const cmpFunc = () => cmpElement.classList.toggle(toggle, force);
        expect(proxyFunc).toThrow();
        expect(cmpFunc).toThrow();
      });
    }
  });
});

/*
 * =============================================================================
 *
 * applyRules()
 *
 * =============================================================================
 */

type ApplyRulesData = [
  string,
  {
    comment?: string;
    rules: (ElementFilterRule | undefined)[];
    from: string;
    to: string;
    restart?: string;
  },
];
void describe("ElementProxy.applyRules()", () => {
  const applyRulesTests: ApplyRulesData[] = [
    [
      "should do nothing on empty rule set",
      {
        rules: [],
        from: "<parent><el>Element</el></parent>",
        to: "<parent><el>Element</el></parent>",
      },
    ],
    [
      "should do nothing on only undefined rule sets",
      {
        rules: [undefined, undefined],
        from: "<parent><el>Element</el></parent>",
        to: "<parent><el>Element</el></parent>",
      },
    ],
    [
      "should do nothing for same-name",
      {
        rules: [
          (params: ElementFilterParams) => {
            params.node.name = "el";
          },
        ],
        from: "<parent><el>Element</el></parent>",
        to: "<parent><el>Element</el></parent>",
      },
    ],
    [
      "should do nothing for same-name (ignoring case)",
      {
        rules: [
          (params: ElementFilterParams) => {
            params.node.name = "eL";
          },
        ],
        from: "<parent><el>Element</el></parent>",
        to: "<parent><el>Element</el></parent>",
      },
    ],
    [
      "should remove by me.remove = true",
      {
        rules: [(me) => (me.node.remove = true)],
        from: "<parent>Lorem <el>Element</el> Ipsum</parent>",
        to: "<parent>Lorem  Ipsum</parent>",
      },
    ],
    [
      "should replace by children by me.replaceByChildren = true",
      {
        rules: [
          (me) => {
            me.node.replaceByChildren = true;
          },
        ],
        from: "<parent>Lorem <el><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>",
        to: "<parent>Lorem <c1>Child 1</c1><c2>Child 1</c2> Ipsum</parent>",
        restart: "//c1",
      },
    ],
    [
      "classList: should add new class",
      {
        rules: [
          (me) => {
            me.node.classList.add("class--new");
          },
        ],
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el class="class--new">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "classList: should add class to existing classes",
      {
        rules: [
          (me) => {
            me.node.classList.add("class--new");
          },
        ],
        from: '<parent>Lorem <el class="class--old">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el class="class--old class--new">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "classList: should remove class",
      {
        rules: [
          (me) => {
            me.node.classList.remove("class--remove");
          },
        ],
        from: '<parent>Lorem <el class="class--before class--remove class-after">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el class="class--before class-after">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "classList: should remove class attribute if empty",
      {
        rules: [
          (me) => {
            me.node.classList.remove("class--remove");
          },
        ],
        from: '<parent>Lorem <el class="class--remove">Ipsum</el> Dolor</parent>',
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "classList: should replace class",
      {
        rules: [
          (me) => {
            me.node.classList.replace("class--old", "class--new");
          },
        ],
        from: '<parent>Lorem <el class="class--before class--old class-after">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el class="class--before class--new class-after">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "classList: should toggle class on",
      {
        rules: [
          (me) => {
            me.node.classList.toggle("class--new");
          },
        ],
        from: '<parent>Lorem <el class="class--old">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el class="class--old class--new">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "classList: should toggle class off",
      {
        rules: [
          (me) => {
            me.node.classList.toggle("class--old");
          },
        ],
        from: '<parent>Lorem <el class="class--old">Ipsum</el> Dolor</parent>',
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "should add new attributes (map-like)",
      {
        rules: [
          (me) => {
            me.node.attributes.new = "new value";
          },
        ],
        // If we ever see this fail because of attribute order, please remove
        // the 'old' attribute completely.
        from: '<parent>Lorem <el old="old value">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el old="old value" new="new value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should add new attributes (property-like)",
      {
        rules: [
          (me) => {
            me.node.attributes.new = "new value";
          },
        ],
        // If we ever see this fail because of attribute order, please remove
        // the 'old' attribute completely.
        from: '<parent>Lorem <el old="old value">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el old="old value" new="new value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect added xlink namespace attributes and add namespace to document element",
      {
        rules: [
          (me) => {
            me.node.attributes["xlink:href"] = "https://example.org/";
          },
        ],
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent xmlns:xlink="http://www.w3.org/1999/xlink">Lorem <el xlink:href="https://example.org/">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect added xml namespace attributes and add namespace to document element",
      {
        comment:
          "While Chrome respects the xmlns:xml attribute in XMLSerializer, it is not respected (yet) in JEST. If this behavior changes, you may have to adapt the expected XML.",
        rules: [
          (me) => {
            me.node.attributes["xml:lang"] = "en-US";
          },
        ],
        from: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
        to: '<parent>Lorem <el xml:lang="en-US">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect xlink namespace when deleting attributes",
      {
        comment:
          "In this simple approach, we cannot remove unused namespace declarations. If we do better in the future, don't hesitate adapting the expectations.",
        rules: [
          (me) => {
            me.node.attributes["xlink:href"] = null;
          },
        ],
        from: '<parent xmlns:xlink="http://www.w3.org/1999/xlink">Lorem <el xlink:href="https://example.org/">Ipsum</el> Dolor</parent>',
        to: '<parent xmlns:xlink="http://www.w3.org/1999/xlink">Lorem <el>Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect xml namespace when deleting attributes",
      {
        rules: [
          (me) => {
            me.node.attributes["xml:lang"] = null;
          },
        ],
        from: '<parent>Lorem <el xml:lang="en-US">Ipsum</el> Dolor</parent>',
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "should remove attribute on attr = null",
      {
        rules: [
          (me) => {
            me.node.attributes.old = null;
          },
        ],
        from: '<parent>Lorem <el old="old value" other="other">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el other="other">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should remove attribute on delete attr (map-like)",
      {
        rules: [
          (me) => {
            delete me.node.attributes.old;
          },
        ],
        from: '<parent>Lorem <el old="old value" other="other">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el other="other">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should remove attribute on delete attr (property-like)",
      {
        rules: [
          (me) => {
            delete me.node.attributes.old;
          },
        ],
        from: '<parent>Lorem <el old="old value" other="other">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el other="other">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should remove all attributes in loop",
      {
        rules: [
          (me) => {
            Object.keys(me.node.attributes).forEach((key) => {
              // To fix, we may migrate attributes to Map<> instead.

              delete me.node.attributes[key];
            });
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "should remove all attributes in loop (including previously added)",
      {
        rules: [
          (me) => {
            me.node.attributes.new = "new value";
            Object.keys(me.node.attributes).forEach((key) => {
              // To fix, we may migrate attributes to Map<> instead.

              delete me.node.attributes[key];
            });
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to: "<parent>Lorem <el>Ipsum</el> Dolor</parent>",
      },
    ],
    [
      "should replace attribute value (map-like)",
      {
        rules: [
          (me) => {
            me.node.attributes.attr = `prefixed:${me.node.attributes.attr}`;
          },
        ],
        // If we ever see this fail because of attribute order, please remove
        // the 'old' attribute completely.
        from: '<parent>Lorem <el attr="value" other="other">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el attr="prefixed:value" other="other">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should replace attribute value (property-like)",
      {
        rules: [
          (me) => {
            me.node.attributes.attr = `prefixed:${me.node.attributes.attr}`;
          },
        ],
        // If we ever see this fail because of attribute order, please remove
        // the 'old' attribute completely.
        from: '<parent>Lorem <el attr="value" other="other">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el attr="prefixed:value" other="other">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should replace all attributes in loop",
      {
        rules: [
          (me) => {
            Object.keys(me.node.attributes).forEach((key) => {
              me.node.attributes[key] = `prefixed:${me.node.attributes[key]}`;
            });
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el attr1="prefixed:value 1" attr2="prefixed:value 2">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should replace all attributes in loop (including previously added)",
      {
        rules: [
          (me) => {
            me.node.attributes.new = "new value";
            Object.keys(me.node.attributes).forEach((key) => {
              me.node.attributes[key] = `prefixed:${me.node.attributes[key]}`;
            });
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el attr1="prefixed:value 1" attr2="prefixed:value 2" new="prefixed:new value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should replace all attributes in loop (including previously added, using getOwnPropertyDescriptor)",
      {
        rules: [
          (me) => {
            me.node.attributes.new = "new value";
            for (const key in me.node.attributes) {
              if (me.node.attributes.hasOwnProperty(key)) {
                const descriptor = Object.getOwnPropertyDescriptor(me.node.attributes, key);
                if (descriptor) {
                  // False positive? Checks assume, that descriptor may be undefined here. But how?

                  // @ts-expect-error Possibly false positive.
                  descriptor.set(`prefixed:${descriptor.get()}`);
                }
              }
            }
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el attr1="prefixed:value 1" attr2="prefixed:value 2" new="prefixed:new value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should be able to detect attribute existence by in operator",
      {
        rules: [
          (me) => {
            me.node.attributes.added = "";
            ["added", "existing", "not_existing"].forEach((v) => {
              const existing: boolean = v in me.node.attributes;
              me.node.attributes[v] = String(existing);
            });
          },
        ],
        from: '<parent>Lorem <el existing="">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el existing="true" added="true" not_existing="false">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should replace by new element",
      {
        rules: [
          (me) => {
            me.node.name = "new";
          },
        ],
        from: '<parent><before>Lorem </before><el attr="value"><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>',
        to: '<parent><before>Lorem </before><new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//new",
      },
    ],
    [
      "should replace by new element with new attribute",
      {
        rules: [
          (me) => {
            me.node.name = "new";
            me.node.attributes.attr = "value";
          },
        ],
        from: "<parent><before>Lorem </before><el><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>",
        to: '<parent><before>Lorem </before><new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//new",
      },
    ],
    [
      "should replace by new element with new attribute (no matter of order)",
      {
        rules: [
          (me) => {
            me.node.attributes.attr = "value";
            me.node.name = "new";
          },
        ],
        from: "<parent><before>Lorem </before><el><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>",
        to: '<parent><before>Lorem </before><new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//new",
      },
    ],
    [
      "should stop executing subsequent rules after replacement by new element",
      /*
       * For example children must not be processed, as they will be processed
       * with the new identity of the node. Also, the generic `$` goal should
       * be executed for the replaced element only, not as part of the current
       * replacement iteration.
       */
      {
        rules: [
          (me) => {
            me.node.attributes.attr = `before-${me.node.attributes.attr}`;
          },
          (me) => {
            me.node.name = "new";
          },
          (me) => {
            me.node.attributes.attr = `${me.node.attributes.attr}-after`;
          },
        ],
        from: '<parent><before>Lorem </before><el attr="value"><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>',
        to: '<parent><before>Lorem </before><new attr="before-value"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//new",
      },
    ],
  ];

  const serializer = new XMLSerializer();
  for (const [name, testData] of applyRulesTests) {
    void test(`(${name})`, () => {
      const xpath = "//el";
      const xmlDocument: Document = requireValidXml(testData.from);
      const xmlExpectedDocument: Document = requireValidXml(testData.to);
      const xmlElement: Element = xmlDocument.evaluate(xpath, xmlDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
        .singleNodeValue as Element;
      if (!xmlElement) {
        throw new Error(
          `Test Setup Issue: Unable resolving XPath '${xpath}' to element under test in: ${testData.from}`,
        );
      }
      if (
        testData.restart &&
        !xmlExpectedDocument.evaluate(testData.restart, xmlExpectedDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
          .singleNodeValue
      ) {
        throw new Error(
          `Test Setup Issue: Unable resolving XPATH '${testData.restart}' to expected restart node in: ${testData.to}`,
        );
      }
      const me = new ElementProxy(xmlElement, MOCK_EDITOR);
      const appliedRulesResult = me.applyRules(...testData.rules);
      expect(serializer.serializeToString(xmlDocument)).toEqual(testData.to);
      if (testData.restart) {
        const expectedRestart = xmlDocument.evaluate(
          testData.restart,
          xmlDocument,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
        ).singleNodeValue;
        expect(appliedRulesResult).toStrictEqual(expectedRestart);
      } else {
        // We don't expect any restart node to be returned.
        expect(appliedRulesResult).not.toBeInstanceOf(Node);
      }
    });
  }
});
