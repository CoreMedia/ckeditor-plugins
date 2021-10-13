import Element from "./element";

export default class ContainerElement extends Element {
  parent: Element | DocumentFragment | null;
}
