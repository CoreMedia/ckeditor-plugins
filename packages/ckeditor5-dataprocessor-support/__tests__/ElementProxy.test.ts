import ElementProxy, { ElementFilterRule, ElementFilterParams } from "../src/ElementProxy";

import "jest-xml-matcher";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

jest.mock("@ckeditor/ckeditor5-core/src/editor/editor");

// @ts-ignore
const MOCK_EDITOR = new Editor();

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
  const xPathResult: XPathResult = xmlDocument.evaluate("/parsererror/text()", xmlDocument, null, XPathResult.STRING_TYPE);
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
describe("Should Respecting (Im-)Mutable State", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("class", "testClass");
  const immutableElement = new ElementProxy(htmlDivElement, MOCK_EDITOR, {}, false);

  test("should not be able to delete element", () => {
    expect(() => immutableElement.remove = true).toThrowError();
  });

  test("should not be able to replace element by children", () => {
    expect(() => immutableElement.replaceByChildren = true).toThrowError();
  });

  test("should not be able to change name", () => {
    const getValue = () => immutableElement.name;
    const previousValue = getValue();
    expect(() => immutableElement.name = "test").toThrowError();
    expect(getValue()).toStrictEqual(previousValue);
  });

  test("should not be able to change attribute value", () => {
    const getValue = () => immutableElement.attributes["class"];
    const previousValue = getValue();
    expect(() => immutableElement.attributes["class"] = "test").toThrowError();
    expect(getValue()).toStrictEqual(previousValue);
  });

  test("should not be able to add additional class", () => {
    const getValue = () => immutableElement.classList;
    const previousValue = getValue();
    expect(() => immutableElement.classList.add("test")).toThrowError();
    expect(getValue()).toStrictEqual(previousValue);
  });

  test("should not be able to add attribute", () => {
    const getValue = () => immutableElement.attributes["id"];
    const previousValue = getValue();
    expect(() => immutableElement.attributes["id"] = "test").toThrowError();
    expect(getValue()).toStrictEqual(previousValue);
  });

  test("should not be able to delete attribute", () => {
    const getValue = () => immutableElement.attributes["id"];
    const previousValue = getValue();
    expect(() => delete immutableElement.attributes["class"]).toThrowError();
    expect(getValue()).toStrictEqual(previousValue);
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
    comment?: string,
    rules: (ElementFilterRule | undefined)[];
    from: string;
    to: string;
    restart?: string;
  }
];

describe("ElementProxy.applyRules()", () => {
  // noinspection XmlUnusedNamespaceDeclaration
  test.each<ApplyRulesData>([
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
        from: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
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
        to: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
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
        to: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should add new attributes (map-like)",
      {
        rules: [
          (me) => {
            me.node.attributes["new"] = "new value";
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
        from: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
        to: '<parent xmlns:xlink="http://www.w3.org/1999/xlink">Lorem <el xlink:href="https://example.org/">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect added xml namespace attributes and add namespace to document element",
      {
        comment: "While Chrome respects the xmlns:xml attribute in XMLSerializer, it is not respected (yet) in JEST. If this behavior changes, you may have to adapt the expected XML.",
        rules: [
          (me) => {
            me.node.attributes["xml:lang"] = "en-US";
          },
        ],
        from: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el xml:lang="en-US">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect xlink namespace when deleting attributes",
      {
        comment: "In this simple approach, we cannot remove unused namespace declarations. If we do better in the future, don't hesitate adapting the expectations.",
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
        to: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should remove attribute on attr = null",
      {
        rules: [
          (me) => {
            me.node.attributes["old"] = null;
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
            delete me.node.attributes["old"];
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
            me.node.attributes["new"] = "new value";
            Object.keys(me.node.attributes).forEach((key) => {
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
            me.node.attributes["attr"] = "prefixed:" + me.node.attributes["attr"];
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
            me.node.attributes.attr = "prefixed:" + me.node.attributes.attr;
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
              me.node.attributes[key] = "prefixed:" + me.node.attributes[key];
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
            me.node.attributes["new"] = "new value";
            Object.keys(me.node.attributes).forEach((key) => {
              me.node.attributes[key] = "prefixed:" + me.node.attributes[key];
            });
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to:
          '<parent>Lorem <el attr1="prefixed:value 1" attr2="prefixed:value 2" new="prefixed:new value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should replace all attributes in loop (including previously added, using getOwnPropertyDescriptor)",
      {
        rules: [
          (me) => {
            me.node.attributes["new"] = "new value";
            for (const key in me.node.attributes) {
              if (me.node.attributes.hasOwnProperty(key)) {
                const descriptor = Object.getOwnPropertyDescriptor(me.node.attributes, key);
                if (!!descriptor) {
                  // False positive? Checks assume, that descriptor may be undefined here. But how?
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  descriptor.set("prefixed:" + descriptor.get());
                }
              }
            }
          },
        ],
        from: '<parent>Lorem <el attr1="value 1" attr2="value 2">Ipsum</el> Dolor</parent>',
        to:
          '<parent>Lorem <el attr1="prefixed:value 1" attr2="prefixed:value 2" new="prefixed:new value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should be able to detect attribute existence by in operator",
      {
        rules: [
          (me) => {
            me.node.attributes["added"] = "";
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
        restart: "//after",
      },
    ],
    [
      "should replace by new element with new attribute",
      {
        rules: [
          (me) => {
            me.node.name = "new";
            me.node.attributes["attr"] = "value";
          },
        ],
        from: "<parent><before>Lorem </before><el><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>",
        to: '<parent><before>Lorem </before><new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//after",
      },
    ],
    [
      "should replace by new element with new attribute (no matter of order)",
      {
        rules: [
          (me) => {
            me.node.attributes["attr"] = "value";
            me.node.name = "new";
          },
        ],
        from: "<parent><before>Lorem </before><el><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>",
        to: '<parent><before>Lorem </before><new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//after",
      },
    ],
    [
      "should execute subsequent rules even after replacing by new element",
      {
        rules: [
          (me) => {
            me.node.attributes["attr"] = `before-${me.node.attributes["attr"]}`;
          },
          (me) => {
            me.node.name = "new";
          },
          (me) => {
            me.node.attributes["attr"] = `${me.node.attributes["attr"]}-after`;
          },
        ],
        from: '<parent><before>Lorem </before><el attr="value"><c1>Child 1</c1><c2>Child 1</c2></el><after> Ipsum</after></parent>',
        to: '<parent><before>Lorem </before><new attr="before-value-after"><c1>Child 1</c1><c2>Child 1</c2></new><after> Ipsum</after></parent>',
        restart: "//after",
      },
    ],
  ])("(%#) %s", (name, testData) => {
    const serializer = new XMLSerializer();
    const xpath = "//el";

    const xmlDocument: Document = requireValidXml(testData.from);
    const xmlExpectedDocument: Document = requireValidXml(testData.to);

    const xmlElement: Element = <Element>(
      xmlDocument.evaluate(xpath, xmlDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue
    );

    if (!xmlElement) {
      throw new Error(`Test Setup Issue: Unable resolving XPath '${xpath}' to element under test in: ${testData.from}`);
    }
    if (testData.restart && !xmlExpectedDocument.evaluate(testData.restart, xmlExpectedDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue) {
      throw new Error(`Test Setup Issue: Unable resolving XPATH '${testData.restart}' to expected restart node in: ${testData.to}`);
    }

    const me = new ElementProxy(xmlElement, MOCK_EDITOR);
    const appliedRulesResult = me.applyRules(...testData.rules);
    expect(serializer.serializeToString(xmlDocument)).toEqualXML(testData.to);

    if (testData.restart) {
      const expectedRestart = xmlDocument.evaluate(testData.restart, xmlDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
      expect(appliedRulesResult).toStrictEqual(expectedRestart);
    } else {
      // We don't expect any restart node to be returned.
      expect(appliedRulesResult).not.toBeInstanceOf(Node);
    }
  });
});
