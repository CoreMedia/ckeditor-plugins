import MutableElement from "../../src/dataprocessor/MutableElement";
// TODO[cke] Works in IDE, but not from console build. What's wrong here?
//import "@types/jest";

test("should wrap DOM element", () => {
  const htmlDivElement = window.document.createElement("div");
  const mutableElement = new MutableElement(htmlDivElement);
  expect(mutableElement.element).toStrictEqual(htmlDivElement);
});
