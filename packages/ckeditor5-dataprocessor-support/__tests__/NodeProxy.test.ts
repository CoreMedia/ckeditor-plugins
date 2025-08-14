import "jest-xml-matcher";
import { NodeProxy } from "../src/NodeProxy";
import { jest } from "@jest/globals";

const PARSER = new DOMParser();
const SERIALIZER = new XMLSerializer();

// Add some toString to Nodes for easier debugging.
Node.prototype.toString = function nodeToString(): string {
  return `${this.nodeName}`;
};

type NodeProxyAction = (proxy: NodeProxy) => unknown;

describe("NodeProxy.constructor", () => {
  let rootNode: Node;

  beforeEach(() => {
    const document = PARSER.parseFromString("<div/>", "text/xml");
    rootNode = document.getRootNode();
  });

  test("Should default to mutable state.", () => {
    const proxy = new NodeProxy(rootNode);
    expect(proxy.mutable).toStrictEqual(true);
  });

  test.each([[true], [false]])("Should respect mutable state %p", (mutable: boolean) => {
    const proxy = new NodeProxy(rootNode, mutable);
    expect(proxy.mutable).toStrictEqual(mutable);
  });

  test("Should provide access to delegate.", () => {
    const proxy = new NodeProxy(rootNode);
    expect(proxy.delegate).toStrictEqual(rootNode);
  });
});

describe("NodeProxy.wrap", () => {
  let rootNode: Node;

  beforeEach(() => {
    const document = PARSER.parseFromString("<div/>", "text/xml");
    rootNode = document.getRootNode();
  });

  test("Should wrap given node.", () => {
    const proxy = NodeProxy.proxy(rootNode);
    expect(proxy?.delegate).toStrictEqual(rootNode);
  });

  test("Should default to mutable state.", () => {
    const proxy = NodeProxy.proxy(rootNode);
    expect(proxy?.mutable).toStrictEqual(true);
  });

  test.each([[true], [false]])("Should respect mutable state %p", (mutable: boolean) => {
    const proxy = NodeProxy.proxy(rootNode, mutable);
    expect(proxy?.mutable).toStrictEqual(mutable);
  });

  test.each([[undefined], [null]])("Should return null when wrapping falsy values like %p.", (value) => {
    const proxy = NodeProxy.proxy(value);
    expect(proxy).toStrictEqual(null);
  });
});

describe("Immutable NodeProxy", () => {
  interface ImmutableTestData {
    action: NodeProxyAction;
    expectException: boolean;
  }

  type ImmutableTest = [string, ImmutableTestData];

  const testData: ImmutableTest[] = [
    [
      "IMMUTABLE#1.1: Reading Property `remove` should be possible.",
      {
        action: (p) => p.remove,
        expectException: false,
      },
    ],
    [
      "IMMUTABLE#1.2: Setting Property `remove` should NOT be possible.",
      {
        action: (p) => (p.remove = true),
        expectException: true,
      },
    ],
    [
      "IMMUTABLE#1.3: Setting Property `remove` of parentNode should NOT be possible.",
      {
        action: (p) => (p.parentNode ? (p.parentNode.remove = true) : undefined),
        expectException: true,
      },
    ],
    [
      "IMMUTABLE#2.1: Reading Property `replaceByChildren` should be possible.",
      {
        action: (p) => p.replaceByChildren,
        expectException: false,
      },
    ],
    [
      "IMMUTABLE#2.2: Setting Property `replaceByChildren` should NOT be possible.",
      {
        action: (p) => (p.replaceByChildren = true),
        expectException: true,
      },
    ],
    [
      "IMMUTABLE#2.3: Setting Property `replaceByChildren` of parentNode should NOT be possible.",
      {
        action: (p) => (p.parentNode ? (p.parentNode.replaceByChildren = true) : undefined),
        expectException: true,
      },
    ],
    [
      "IMMUTABLE#3.1: Reading Property `removeChildren` should be possible.",
      {
        action: (p) => p.removeChildren,
        expectException: false,
      },
    ],
    [
      "IMMUTABLE#3.2: Setting Property `removeChildren` should NOT be possible.",
      {
        action: (p) => (p.removeChildren = true),
        expectException: true,
      },
    ],
    [
      "IMMUTABLE#3.3: Setting Property `removeChildren` of parentNode should NOT be possible.",
      {
        action: (p) => (p.parentNode ? (p.parentNode.removeChildren = true) : undefined),
        expectException: true,
      },
    ],
  ];

  let immutableProxy: NodeProxy;

  beforeEach(() => {
    const document = PARSER.parseFromString("<parent><child/></parent>", "text/xml");
    const childNode = document.getRootNode().firstChild as Node;
    immutableProxy = new NodeProxy(childNode, false);
  });

  test.each<ImmutableTest>(testData)("(%#) %p", (name, testData) => {
    if (testData.expectException) {
      expect(() => testData.action(immutableProxy)).toThrowError();
    } else {
      expect(() => testData.action(immutableProxy)).not.toThrowError();
    }
  });
});

describe("NodeProxy.isEmpty and NodeProxy.empty", () => {
  const document = PARSER.parseFromString("<parent><child/></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;

  const emptyProxy: NodeProxy = new NodeProxy(childNode);
  const nonEmptyProxy: NodeProxy = new NodeProxy(rootNode);

  test.each([
    [true, emptyProxy],
    [false, nonEmptyProxy],
  ])("(%#) Should provide expected state on proxy.empty: %p for %s", (expected, proxy) => {
    expect(proxy.empty).toStrictEqual(expected);
  });

  test.each([
    [true, emptyProxy],
    [false, nonEmptyProxy],
  ])("(%#) Should provide expected state on proxy.isEmpty(): %p for %s", (expected, proxy) => {
    expect(proxy.isEmpty()).toStrictEqual(expected);
  });

  test("Should be able to ignore children when testing for isEmpty", () => {
    const actual = nonEmptyProxy.isEmpty((c) => c.nodeName !== "child");
    expect(actual).toStrictEqual(true);
  });
});

describe("NodeProxy.ownerDocument", () => {
  const document = PARSER.parseFromString("<parent><child/></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;

  test.each([[rootNode], [childNode]])("(%#) Should provide expected ownerDocument for %s", (node) => {
    expect(new NodeProxy(node).ownerDocument).toStrictEqual(document);
  });
});

describe("NodeProxy.parentNode", () => {
  const document = PARSER.parseFromString("<parent><child/></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;

  test.each([
    [childNode, rootNode],
    [rootNode, documentRootNode],
  ])("(%#) Should provide expected parentNode for %s: %s", (childNode, parentNode) => {
    expect(new NodeProxy(childNode).parentNode?.delegate).toStrictEqual(parentNode);
  });
});

describe("NodeProxy.parentElement", () => {
  const document = PARSER.parseFromString("<parent><child/></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;

  test.each([
    [childNode, rootNode],
    [rootNode, undefined],
  ])("(%#) Should provide expected parentElement for %s: %s", (childNode, parentNode) => {
    expect(new NodeProxy(childNode).parentElement?.delegate).toStrictEqual(parentNode);
  });
});

describe("NodeProxy.name and NodeProxy.realName", () => {
  const document = PARSER.parseFromString("<parent><child/></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;

  test.each([[childNode], [rootNode]])("(%#) Should provide expected name and realName for %s", (node) => {
    const { name, realName } = new NodeProxy(node);
    expect(name).toStrictEqual(node.nodeName.toLowerCase());
    expect(realName).toStrictEqual(node.nodeName.toLowerCase());
  });
});

describe("NodeProxy.singleton", () => {
  const document = PARSER.parseFromString("<parent><child><pair1/><pair2/><pair3/></child></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;
  const pair1 = childNode.firstChild as Node;
  const pair2 = pair1.nextSibling as Node;
  const pair3 = pair2.nextSibling as Node;

  test.each([
    [documentRootNode, true],
    [rootNode, true],
    [childNode, true],
    [pair1, false],
    [pair2, false],
    [pair3, false],
  ])("(%#) Should provide expected singleton state for %s: %p", (node, expected) => {
    expect(new NodeProxy(node).singleton).toStrictEqual(expected);
  });
});

describe("NodeProxy.lastNode", () => {
  const document = PARSER.parseFromString("<parent><child><pair1/><pair2/><pair3/></child></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;
  const pair1 = childNode.firstChild as Node;
  const pair2 = pair1.nextSibling as Node;
  const pair3 = pair2.nextSibling as Node;

  test.each([
    [documentRootNode, true],
    [rootNode, true],
    [childNode, true],
    [pair1, false],
    [pair2, false],
    [pair3, true],
  ])("(%#) Should provide expected lastNode state for %s: %p", (node, expected) => {
    expect(new NodeProxy(node).lastNode).toStrictEqual(expected);
  });
});

describe("NodeProxy.findFirst", () => {
  const document = PARSER.parseFromString("<parent><child><pair1/><pair2/><pair3/></child></parent>", "text/xml");
  const documentRootNode = document.getRootNode();
  const rootNode = documentRootNode.firstChild as Node;
  const childNode = rootNode.firstChild as Node;
  const pair1 = childNode.firstChild as Node;
  const pair2 = pair1.nextSibling as Node;
  const pair3 = pair2.nextSibling as Node;

  test.each([
    [documentRootNode, rootNode],
    [rootNode, childNode],
    [childNode, pair1],
    [pair1, null],
    [pair2, null],
    [pair3, null],
  ])("(%#) Should find expected first child node for %s: %s", (node, firstChild) => {
    if (firstChild === null) {
      expect(new NodeProxy(node).findFirst()).toStrictEqual(firstChild);
    } else {
      expect(new NodeProxy(node).findFirst()?.delegate).toStrictEqual(firstChild);
    }
  });

  test.each([
    [documentRootNode, "parent", rootNode],
    [documentRootNode, "child", null],
    [rootNode, "child", childNode],
    [rootNode, "pair1", null],
    [childNode, "pair1", pair1],
    [childNode, "pair2", pair2],
    [childNode, "pair3", pair3],
    [pair1, "pair2", null],
    [pair2, "pair3", null],
    [pair3, "child", null],
  ])("(%#) Should find expected first child node for %s searching for '%s': %s", (node, childName, firstChild) => {
    if (firstChild === null) {
      expect(new NodeProxy(node).findFirst(childName)).toStrictEqual(firstChild);
    } else {
      expect(new NodeProxy(node).findFirst(childName)?.delegate).toStrictEqual(firstChild);
    }
  });

  test.each([
    [documentRootNode, () => true, rootNode],
    [documentRootNode, () => false, null],
    [rootNode, () => true, childNode],
    [rootNode, () => false, null],
    [childNode, () => true, pair1],
    [childNode, () => false, null],
    [childNode, (child: ChildNode, index: number) => index === 1, pair2],
    [childNode, (child: ChildNode, index: number, array: ChildNode[]) => index === array.length - 1, pair3],
  ])(
    "(%#) Should find expected first child node for %s searching by predicate: %s",
    (node, childPredicate, firstChild) => {
      if (firstChild === null) {
        expect(new NodeProxy(node).findFirst(childPredicate)).toStrictEqual(firstChild);
      } else {
        expect(new NodeProxy(node).findFirst(childPredicate)?.delegate).toStrictEqual(firstChild);
      }
    },
  );
});

describe("NodeProxy.persistToDom", () => {
  const dom = "<parent><child><pair1/><pair2/><pair3/></child></parent>";

  interface PersistTestData {
    nodeXPath: string;
    action: NodeProxyAction;
    expectedDom: string;
    expectedRestartFromXPath?: string;
    expectedAbort: boolean;
  }

  type PersistTest = [string, PersistTestData];

  const testData: PersistTest[] = [
    [
      "PERSIST#1: Should not modify DOM if no operations got applied.",
      {
        nodeXPath: "//child",
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        action: () => {},
        expectedDom: "<parent><child><pair1/><pair2/><pair3/></child></parent>",
        expectedAbort: false,
      },
    ],
    [
      "PERSIST#2: Should remove child not and descendants if requested.",
      {
        nodeXPath: "//child",
        action: (node) => (node.remove = true),
        expectedDom: "<parent/>",
        expectedAbort: true,
      },
    ],
    [
      "PERSIST#3: Should be able to veto removal.",
      {
        nodeXPath: "//child",
        action: (node) => {
          node.remove = true;
          node.remove = false;
        },
        expectedDom: "<parent><child><pair1/><pair2/><pair3/></child></parent>",
        expectedAbort: false,
      },
    ],
    [
      "PERSIST#4: Should replace child by its descendants if requested.",
      {
        nodeXPath: "//child",
        action: (node) => (node.replaceByChildren = true),
        expectedDom: "<parent><pair1/><pair2/><pair3/></parent>",
        expectedAbort: true,
        expectedRestartFromXPath: "//pair1",
      },
    ],
    [
      "PERSIST#5: Should remove node instead on replace children if having no children.",
      {
        nodeXPath: "//pair1",
        action: (node) => (node.replaceByChildren = true),
        expectedDom: "<parent><child><pair2/><pair3/></child></parent>",
        expectedAbort: true,
      },
    ],
    [
      "PERSIST#6: Should be able to veto replacement by children.",
      {
        nodeXPath: "//child",
        action: (node) => {
          node.replaceByChildren = true;
          node.replaceByChildren = false;
        },
        expectedDom: "<parent><child><pair1/><pair2/><pair3/></child></parent>",
        expectedAbort: false,
      },
    ],
    [
      "PERSIST#7: Should remove children if requested.",
      {
        nodeXPath: "//child",
        action: (node) => (node.removeChildren = true),
        expectedDom: "<parent><child/></parent>",
        expectedAbort: false,
      },
    ],
    [
      "PERSIST#8: Should be able to veto removal of children.",
      {
        nodeXPath: "//child",
        action: (node) => {
          node.removeChildren = true;
          node.removeChildren = false;
        },
        expectedDom: "<parent><child><pair1/><pair2/><pair3/></child></parent>",
        expectedAbort: false,
      },
    ],
  ];

  describe.each<PersistTest>(testData)("(%#) %s", (name, data) => {
    test.each([[true], [false]])("(%#) has ownerDocument: %s", (hasOwnerDocument: boolean) => {
      const document = PARSER.parseFromString(dom, "text/xml");
      const node = document.evaluate(data.nodeXPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE)
        .singleNodeValue as Node;
      const proxy = new NodeProxy(node);

      if (!hasOwnerDocument) {
        // https://stackoverflow.com/questions/43697455/how-to-mock-replace-getter-function-of-object-with-jest
        Object.defineProperty(proxy, "ownerDocument", {
          get: jest.fn(() => null),
        });
      }

      let expectedRestartFrom: Node | undefined;
      if (data.expectedRestartFromXPath) {
        expectedRestartFrom = document.evaluate(
          data.expectedRestartFromXPath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
        ).singleNodeValue as Node;
      }
      data.action(proxy);
      const { continueWith, abort } = proxy.persistToDom();

      expect(continueWith).toStrictEqual(expectedRestartFrom);
      expect(abort).toStrictEqual(data.expectedAbort);

      const newDom = SERIALIZER.serializeToString(document);
      expect(newDom).toEqualXML(data.expectedDom);
    });
  });
});
