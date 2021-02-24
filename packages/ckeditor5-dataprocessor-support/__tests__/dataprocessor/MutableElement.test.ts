import { MutableElement, ElementFilterRule } from "../../src/dataprocessor";
import "jest-xml-matcher";

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
  const mutableElement = new MutableElement(htmlDivElement);
  expect(mutableElement.element).toStrictEqual(htmlDivElement);
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

describe("MutableElement.applyRules()", () => {
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
          (me: MutableElement) => {
            me.name = "el";
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
          (me: MutableElement) => {
            me.name = "eL";
          },
        ],
        from: "<parent><el>Element</el></parent>",
        to: "<parent><el>Element</el></parent>",
      },
    ],
    [
      "should remove by return value `false`",
      {
        rules: [() => false],
        from: "<parent>Lorem <el>Element</el> Ipsum</parent>",
        to: "<parent>Lorem  Ipsum</parent>",
      },
    ],
    [
      "should remove by me.name = null",
      {
        rules: [
          (me: MutableElement) => {
            me.name = null;
          },
        ],
        from: "<parent>Lorem <el>Element</el> Ipsum</parent>",
        to: "<parent>Lorem  Ipsum</parent>",
      },
    ],
    [
      "should remove by me.remove = true",
      {
        rules: [(me) => (me.remove = true)],
        from: "<parent>Lorem <el>Element</el> Ipsum</parent>",
        to: "<parent>Lorem  Ipsum</parent>",
      },
    ],
    [
      "should replace by children by me.name = ''",
      {
        rules: [
          (me) => {
            me.name = "";
          },
        ],
        from: "<parent>Lorem <el><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>",
        to: "<parent>Lorem <c1>Child 1</c1><c2>Child 1</c2> Ipsum</parent>",
        restart: "//c1",
      },
    ],
    [
      "should replace by children by me.replaceByChildren = true",
      {
        rules: [
          (me) => {
            me.replaceByChildren = true;
          },
        ],
        from: "<parent>Lorem <el><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>",
        to: "<parent>Lorem <c1>Child 1</c1><c2>Child 1</c2> Ipsum</parent>",
        restart: "//c1",
      },
    ],
    [
      "should add new attributes (map-like)",
      {
        rules: [
          (me) => {
            me.attributes["new"] = "new value";
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
            me.attributes.new = "new value";
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
            me.attributes["xlink:href"] = "https://example.org/";
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
            me.attributes["xml:lang"] = "en-US";
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
            me.attributes["xlink:href"] = null;
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
            me.attributes["xml:lang"] = null;
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
            me.attributes["old"] = null;
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
            delete me.attributes["old"];
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
            delete me.attributes.old;
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
            Object.keys(me.attributes).forEach((key) => {
              delete me.attributes[key];
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
            me.attributes["new"] = "new value";
            Object.keys(me.attributes).forEach((key) => {
              delete me.attributes[key];
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
            me.attributes["attr"] = "prefixed:" + me.attributes["attr"];
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
            me.attributes.attr = "prefixed:" + me.attributes.attr;
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
            Object.keys(me.attributes).forEach((key) => {
              me.attributes[key] = "prefixed:" + me.attributes[key];
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
            me.attributes["new"] = "new value";
            Object.keys(me.attributes).forEach((key) => {
              me.attributes[key] = "prefixed:" + me.attributes[key];
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
            me.attributes["new"] = "new value";
            for (const key in me.attributes) {
              if (me.attributes.hasOwnProperty(key)) {
                const descriptor = Object.getOwnPropertyDescriptor(me.attributes, key);
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
            me.attributes["added"] = "";
            ["added", "existing", "not_existing"].forEach((v) => {
              const existing: boolean = v in me.attributes;
              me.attributes[v] = String(existing);
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
            me.name = "new";
          },
        ],
        from: '<parent>Lorem <el attr="value"><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>',
        to: '<parent>Lorem <new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new> Ipsum</parent>',
        restart: "//new",
      },
    ],
    [
      "should replace by new element with new attribute",
      {
        rules: [
          (me) => {
            me.name = "new";
            me.attributes["attr"] = "value";
          },
        ],
        from: "<parent>Lorem <el><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>",
        to: '<parent>Lorem <new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new> Ipsum</parent>',
        restart: "//new",
      },
    ],
    [
      "should replace by new element with new attribute (no matter of order)",
      {
        rules: [
          (me) => {
            me.attributes["attr"] = "value";
            me.name = "new";
          },
        ],
        from: "<parent>Lorem <el><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>",
        to: '<parent>Lorem <new attr="value"><c1>Child 1</c1><c2>Child 1</c2></new> Ipsum</parent>',
        restart: "//new",
      },
    ],
    [
      "should not execute subsequent rules after replacing by new element",
      {
        rules: [
          (me) => {
            me.attributes["attr"] = "new value";
          },
          (me) => {
            me.name = "new";
          },
          (me) => {
            me.attributes["attr"] = "skipped";
          },
        ],
        from: '<parent>Lorem <el attr="value"><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>',
        to: '<parent>Lorem <new attr="new value"><c1>Child 1</c1><c2>Child 1</c2></new> Ipsum</parent>',
        restart: "//new",
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

    const me = new MutableElement(xmlElement);
    const appliedRulesResult = me.applyRules(...testData.rules);
    expect(serializer.serializeToString(xmlDocument)).toEqualXML(testData.to)

    if (testData.restart) {
      const expectedRestart = xmlDocument.evaluate(testData.restart, xmlDocument, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue;
      expect(appliedRulesResult).toStrictEqual(expectedRestart);
    } else {
      // We don't expect any restart node to be returned.
      expect(appliedRulesResult).not.toBeInstanceOf(Node);
    }
  });
});
