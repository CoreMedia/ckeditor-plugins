import { MutableElement, ElementFilterRule } from "../../src/dataprocessor";
import "jest-xml-matcher";

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
    rules: (ElementFilterRule | undefined)[];
    from: string;
    to: string;
    restart?: string;
  }
];

describe("MutableElement.applyRules()", () => {
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
      "should respect added xlink namespace attributes",
      {
        rules: [
          (me) => {
            me.attributes["xlink:href"] = "https://example.org/";
          },
        ],
        from: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el xlink:href="https://example.org/">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should respect added xml namespace attributes",
      {
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
        rules: [
          (me) => {
            me.attributes["xlink:href"] = null;
          },
        ],
        from: '<parent>Lorem <el xlink:href="https://example.org/">Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
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
      "should blindly add attributes of unknown namespace prefix (decision, which may be vetoed)",
      {
        rules: [
          (me) => {
            me.attributes["unknown:namespace"] = "value";
          },
        ],
        from: '<parent>Lorem <el>Ipsum</el> Dolor</parent>',
        to: '<parent>Lorem <el unknown:namespace="value">Ipsum</el> Dolor</parent>',
      },
    ],
    [
      "should be able removing attributes with unregistered namespace prefix",
      {
        rules: [
          (me) => {
            me.attributes["unknown:namespace"] = null;
          },
        ],
        from: '<parent>Lorem <el unknown:namespace="value">Ipsum</el> Dolor</parent>',
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
      "should replace by prefixed element",
      {
        rules: [
          (me) => {
            me.name = "prefixed:" + me.name;
          },
        ],
        from: '<parent>Lorem <el attr="value"><c1>Child 1</c1><c2>Child 1</c2></el> Ipsum</parent>',
        to: '<parent>Lorem <prefixed:el attr="value"><c1>Child 1</c1><c2>Child 1</c2></prefixed:el> Ipsum</parent>',
        restart: "//prefixed:el",
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
    document.body.innerHTML = testData.from.trim();
    const element: Element = <Element>(
      document.evaluate("//el", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue
    );

    const mutableElement = new MutableElement(element);
    const result = mutableElement.applyRules(...testData.rules);

    expect(document.body.innerHTML).toEqualXML(testData.to);

    let restartFrom: Node | null = null;
    if (testData.restart) {
      restartFrom = <Node>(
        document.evaluate(testData.restart, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue
      );
    }

    expect(result).toStrictEqual(restartFrom);
  });
});
