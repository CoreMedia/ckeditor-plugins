import MutableElement from "../../src/dataprocessor/MutableElement";
// TODO[cke] Works in IDE, but not from console build. What's wrong here?
//import "@types/jest";

enum ChildType {
  Text,
  Element,
}

type NamePatchChildrenTuple = [string, (me: MutableElement) => void, ChildType[]?];

/**
 * Creates child nodes of the given types.
 *
 * @param childTypes types of children
 * @param children array to store created children in
 * @param element element to attach created child notes to
 */
function createChildren(childTypes: ChildType[] | undefined | null, children: Node[], element: HTMLDivElement) {
  if (!!childTypes) {
    childTypes.forEach((v, k) => {
      let child: ChildNode;
      switch (v) {
        case ChildType.Text:
          child = window.document.createTextNode("child " + k);
          break;
        case ChildType.Element:
          child = window.document.createElement("span");
          child.appendChild(window.document.createTextNode("nested child " + k));
          break;
      }
      children.push(child);
      element.appendChild(child);
    });
  }
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
 * Persisting
 *
 * =============================================================================
 */

/* ---------------------------------------------------[ persist(): No-Op ]--- */

test("should not do anything on persist without modifications", () => {
  const htmlDivElement = window.document.createElement("div");
  const mutableElement = new MutableElement(htmlDivElement);
  expect(mutableElement.persist()).toStrictEqual(true);
});

/* ----------------------------------------------[ persist(): Attributes ]--- */

test("should add attributes to attributes of existing element", () => {
  const htmlDivElement = window.document.createElement("div");
  const mutableElement = new MutableElement(htmlDivElement);
  mutableElement.attributes["new:attr"] = "someValue";

  expect(mutableElement.attributes).toHaveProperty("new:attr", "someValue");

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("new:attr")).toStrictEqual("someValue");
});

test("should overwrite attributes of existing element", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("overwrite:attr", "oldValue");
  const mutableElement = new MutableElement(htmlDivElement);
  mutableElement.attributes["overwrite:attr"] = "newValue";

  expect(mutableElement.attributes).toHaveProperty("overwrite:attr", "newValue");

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("overwrite:attr")).toStrictEqual("newValue");
});

test("should overwrite attributes of existing element in loop", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("overwrite:attr", "oldValue");
  const mutableElement = new MutableElement(htmlDivElement);

  Object.keys(mutableElement.attributes).forEach((key) => {
    mutableElement.attributes[key] = "newValue";
  });

  expect(mutableElement.attributes).toHaveProperty("overwrite:attr", "newValue");

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("overwrite:attr")).toStrictEqual("newValue");
});

test("should overwrite attributes of existing element in loop respecting already added", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("overwrite:attr", "oldValue");
  const mutableElement = new MutableElement(htmlDivElement);

  mutableElement.attributes["new:attr"] = "previousNew";

  Object.keys(mutableElement.attributes).forEach((key) => {
    mutableElement.attributes[key] = "newValue";
  });

  expect(mutableElement.attributes).toHaveProperty("overwrite:attr", "newValue");

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("overwrite:attr")).toStrictEqual("newValue");
  expect(htmlDivElement.getAttribute("new:attr")).toStrictEqual("newValue");
});

test("should delete attributes of existing element", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("delete:attr", "oldValue");
  const mutableElement = new MutableElement(htmlDivElement);
  mutableElement.attributes["delete:attr"] = null;

  expect(mutableElement.attributes).toHaveProperty("delete:attr", null);

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("delete:attr")).toStrictEqual(null);
});

test("should delete attributes of existing element in loop", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("delete:attr", "oldValue");
  const mutableElement = new MutableElement(htmlDivElement);

  Object.keys(mutableElement.attributes).forEach((key) => {
    delete mutableElement.attributes[key];
  });

  expect(mutableElement.attributes).toHaveProperty("delete:attr", null);

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("delete:attr")).toStrictEqual(null);
});

test("should delete attributes of existing element in loop respecting added ones", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("delete:attr", "oldValue");
  const mutableElement = new MutableElement(htmlDivElement);

  mutableElement.attributes["new:attr"] = "new";

  Object.keys(mutableElement.attributes).forEach((key) => {
    delete mutableElement.attributes[key];
  });

  expect(mutableElement.attributes).toHaveProperty("delete:attr", null);

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("delete:attr")).toStrictEqual(null);
  expect(htmlDivElement.getAttribute("new:attr")).toStrictEqual(null);
});

test("should modify attributes of existing element", () => {
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("overwrite:attr", "oldValue");
  htmlDivElement.setAttribute("delete:attr", "oldValue");

  const mutableElement = new MutableElement(htmlDivElement);

  expect(mutableElement.attributes["new:attr"]).toStrictEqual(null);
  expect(mutableElement.attributes["overwrite:attr"]).toStrictEqual("oldValue");
  expect(mutableElement.attributes["delete:attr"]).toStrictEqual("oldValue");

  mutableElement.attributes["new:attr"] = "someValue";
  mutableElement.attributes["overwrite:attr"] = "newValue";
  mutableElement.attributes["delete:attr"] = null;

  expect(mutableElement.attributes["new:attr"]).toStrictEqual("someValue");
  expect(mutableElement.attributes["overwrite:attr"]).toStrictEqual("newValue");
  expect(mutableElement.attributes["delete:attr"]).toStrictEqual(null);

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("new:attr")).toStrictEqual("someValue");
  expect(htmlDivElement.getAttribute("overwrite:attr")).toStrictEqual("newValue");
  expect(htmlDivElement.getAttribute("delete:attr")).toStrictEqual(null);
});

test("should modify attributes of existing element; special case: new name set is equal to existing name", () => {
  /*
   * DevNote: This test cannot distinguish, if a shortcut path has been taken,
   * i.e., if only the attributes got adjusted or a new element of the same
   * name got created. As we cannot be sure, additional checks exists for child
   * elements for example, so that any of the paths fulfill the contract.
   */
  const htmlDivElement = window.document.createElement("div");
  htmlDivElement.setAttribute("overwrite:attr", "oldValue");
  htmlDivElement.setAttribute("delete:attr", "oldValue");
  const elementText = window.document.createTextNode("the Element");
  htmlDivElement.append(elementText);

  const mutableElement = new MutableElement(htmlDivElement);
  mutableElement.name = htmlDivElement.tagName;
  mutableElement.attributes["new:attr"] = "someValue";
  mutableElement.attributes["overwrite:attr"] = "newValue";
  mutableElement.attributes["delete:attr"] = null;

  expect(mutableElement.persist()).toStrictEqual(true);
  expect(htmlDivElement.getAttribute("new:attr")).toStrictEqual("someValue");
  expect(htmlDivElement.getAttribute("overwrite:attr")).toStrictEqual("newValue");
  expect(htmlDivElement.getAttribute("delete:attr")).toStrictEqual(null);
  expect(htmlDivElement.childNodes[0]).toStrictEqual(elementText);
});

/* ------------------------------------------[ persist(): Remove Element ]--- */

test.each<NamePatchChildrenTuple>([
  [
    "me.name = null",
    function (me: MutableElement): void {
      me.name = null;
    },
    [ChildType.Element, ChildType.Element],
  ],
  [
    "me.remove = true",
    function (me: MutableElement): void {
      me.remove = true;
    },
    [ChildType.Element, ChildType.Element],
  ],
  [
    "me.remove = true; overrides me.replaceByChildren = true",
    function (me: MutableElement): void {
      me.replaceByChildren = true;
      me.remove = true;
    },
    [ChildType.Element, ChildType.Element],
  ],
])("(%#) should delete including children on: %p", (name, mutableElementAction, childTypes) => {
  const parentElement = window.document.createElement("div");
  parentElement.setAttribute("class", "parent");
  const element = window.document.createElement("div");
  element.setAttribute("class", "element");
  parentElement.appendChild(element);
  const children: Node[] = [];
  createChildren(childTypes, children, element);

  const mutableElement = new MutableElement(element);

  expect(mutableElement.replaceByChildren).toStrictEqual(false);
  expect(mutableElement.replace).toStrictEqual(false);
  expect(mutableElement.remove).toStrictEqual(false);

  mutableElementAction(mutableElement);

  expect(mutableElement.replaceByChildren).toStrictEqual(false);
  expect(mutableElement.replace).toStrictEqual(false);
  expect(mutableElement.remove).toStrictEqual(true);

  expect(mutableElement.persist()).toStrictEqual(false);
  expect(parentElement.childNodes.length).toStrictEqual(0);
  expect(element.childNodes.length).toStrictEqual(children.length);
});

/* -----------------------------[ persist(): Replace Element by Children ]--- */

test.each<NamePatchChildrenTuple>([
  [
    "me.name = ''",
    function (me: MutableElement): void {
      me.name = "";
    },
    [ChildType.Text, ChildType.Element],
  ],
  [
    "me.replaceByChildren = true",
    function (me: MutableElement): void {
      me.replaceByChildren = true;
    },
    [ChildType.Element, ChildType.Text],
  ],
  [
    "me.replaceByChildren = true; overrides me.remove = true",
    function (me: MutableElement): void {
      me.remove = true;
      me.replaceByChildren = true;
    },
    [ChildType.Text, ChildType.Text],
  ],
  [
    "me.replaceByChildren = true; similar to me.remove for no children",
    function (me: MutableElement): void {
      me.replaceByChildren = true;
    },
    [],
  ],
])("(%#) should replace by children children on: %p", (name, mutableElementAction, childTypes) => {
  const parentElement = window.document.createElement("div");
  parentElement.setAttribute("class", "parent");
  const beforeElement = window.document.createTextNode("before");
  const afterElement = window.document.createTextNode("after");
  const element = window.document.createElement("div");
  element.setAttribute("class", "element");

  parentElement.append(beforeElement, element, afterElement);

  const children: Node[] = [];
  createChildren(childTypes, children, element);

  const mutableElement = new MutableElement(element);

  expect(mutableElement.replaceByChildren).toStrictEqual(false);
  expect(mutableElement.replace).toStrictEqual(false);
  expect(mutableElement.remove).toStrictEqual(false);

  mutableElementAction(mutableElement);

  expect(mutableElement.replaceByChildren).toStrictEqual(true);
  expect(mutableElement.replace).toStrictEqual(false);
  expect(mutableElement.remove).toStrictEqual(false);

  const persistResult = mutableElement.persist();
  expect(element.childElementCount).toStrictEqual(0);
  expect(parentElement.childNodes.length).toStrictEqual(children.length + 2);
  if (children.length > 0) {
    expect(persistResult).toStrictEqual(children[0]);
    expect(parentElement.childNodes[0]).toStrictEqual(beforeElement);
    expect(parentElement.childNodes[1]).toStrictEqual(children[0]);
    expect(parentElement.childNodes[parentElement.childNodes.length - 1]).toStrictEqual(afterElement);
  } else {
    expect(persistResult).toStrictEqual(false);
  }
  expect(element.parentNode).toStrictEqual(null);
  expect(element.childNodes.length).toStrictEqual(0);
});

/* --------------------------------------[ persist(): Replace By Element ]--- */

test("should replace by element of given name, transferring child-nodes as well as attributes", () => {
  const parentElement = window.document.createElement("div");
  parentElement.setAttribute("class", "parent");
  const beforeElement = window.document.createTextNode("before");
  const afterElement = window.document.createTextNode("after");
  const element = window.document.createElement("span");
  const elementText = window.document.createTextNode("the Element");
  element.append(elementText);
  element.setAttribute("overwrite:attr", "overwrite");
  element.setAttribute("delete:attr", "delete");

  parentElement.append(beforeElement, element, afterElement);

  const mutableElement = new MutableElement(element);

  expect(mutableElement.name?.toLowerCase()).toStrictEqual(element.tagName.toLowerCase());
  expect(mutableElement.replaceByChildren).toStrictEqual(false);
  expect(mutableElement.replace).toStrictEqual(false);
  expect(mutableElement.remove).toStrictEqual(false);

  mutableElement.name = "strong";

  expect(mutableElement.name?.toLowerCase()).toStrictEqual("strong");
  expect(mutableElement.replaceByChildren).toStrictEqual(false);
  expect(mutableElement.replace).toStrictEqual(true);
  expect(mutableElement.remove).toStrictEqual(false);

  mutableElement.attributes["new:attr"] = "new";
  mutableElement.attributes["overwrite:attr"] = "overwritten";
  mutableElement.attributes["delete:attr"] = null;

  const persistedElement = mutableElement.persist();

  expect(persistedElement).not.toStrictEqual(element);
  expect(persistedElement).toBeInstanceOf(Element);
  expect((<Element>persistedElement).nodeName.toLowerCase()).toStrictEqual("strong");
  expect((<Element>persistedElement).childNodes.length).toStrictEqual(1);
  expect((<Element>persistedElement).childNodes[0]).toStrictEqual(elementText);
  expect((<Element>persistedElement).parentNode).toStrictEqual(parentElement);

  expect((<Element>persistedElement).getAttribute("new:attr")).toStrictEqual("new");
  expect((<Element>persistedElement).getAttribute("overwrite:attr")).toStrictEqual("overwritten");
  expect((<Element>persistedElement).getAttribute("delete:attr")).toStrictEqual(null);

  expect(parentElement.childNodes.length).toStrictEqual(3);
  expect(parentElement.childNodes[0]).toStrictEqual(beforeElement);
  expect(parentElement.childNodes[1]).toStrictEqual(persistedElement);
  expect(parentElement.childNodes[2]).toStrictEqual(afterElement);

  expect(element.parentNode).toStrictEqual(null);
  expect(element.childNodes.length).toStrictEqual(0);
});
