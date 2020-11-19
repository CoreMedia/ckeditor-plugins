import Document from "./document";
import Element from "./element";

export default class UpcastWriter {
  constructor (document:Document);
  clone(element: Element, deep: boolean): Element;
}
