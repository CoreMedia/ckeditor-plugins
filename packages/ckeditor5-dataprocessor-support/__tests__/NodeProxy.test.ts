import { NodeProxy } from "../src";

const PARSER = new DOMParser();

interface NodeProxyAction {
  (proxy: NodeProxy): any;
}

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

  test.each([[true], [false]])(
    "Should respect mutable state %p",
    (mutable: boolean) => {
      const proxy = new NodeProxy(rootNode, mutable);
      expect(proxy.mutable).toStrictEqual(mutable);
    }
  );

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
    const proxy = NodeProxy.wrap(rootNode);
    expect(proxy?.delegate).toStrictEqual(rootNode);
  });

  test("Should default to mutable state.", () => {
    const proxy = NodeProxy.wrap(rootNode);
    expect(proxy?.mutable).toStrictEqual(true);
  });

  test.each([[true], [false]])(
    "Should respect mutable state %p",
    (mutable: boolean) => {
      const proxy = NodeProxy.wrap(rootNode, mutable);
      expect(proxy?.mutable).toStrictEqual(mutable);
    }
  );

  test.each([[undefined], [null]])("Should return null when wrapping falsy values like %p.",
    (value) => {
    const proxy = NodeProxy.wrap(value);
    expect(proxy).toStrictEqual(null);
  });
});


describe("Immutable NodeProxy", () => {

  interface ImmutableTestData {
    action: NodeProxyAction;
    expectException: boolean;
  }

  type ImmutableTest = [
    string,
    ImmutableTestData,
  ];

  const testData: ImmutableTest[] = [
    [
      "IMMUTABLE#1: Reading Property `remove` should be possible.",
      {
        action: (p) => p.remove,
        expectException: false,
      },
    ],
    [
      "IMMUTABLE#2: Setting Property `remove` should NOT be possible.",
      {
        action: (p) => p.remove = true,
        expectException: true,
      },
    ],
    [
      "IMMUTABLE#3: Reading Property `replaceByChildren` should be possible.",
      {
        action: (p) => p.replaceByChildren,
        expectException: false,
      },
    ],
    [
      "IMMUTABLE#4: Setting Property `replaceByChildren` should NOT be possible.",
      {
        action: (p) => p.replaceByChildren = true,
        expectException: true,
      },
    ],
  ];

  let immutableProxy: NodeProxy;

  beforeEach(() => {
    const document = PARSER.parseFromString("<div/>", "text/xml");
    const rootNode = document.getRootNode();
    immutableProxy = new NodeProxy(rootNode, false);
  });

  test.each<ImmutableTest>(testData)("(%#) %p", (name, testData) => {
    if (testData.expectException) {
      expect(() => testData.action(immutableProxy)).toThrowError();
    } else {
      expect(() => testData.action(immutableProxy)).not.toThrowError();
    }
  });
});
