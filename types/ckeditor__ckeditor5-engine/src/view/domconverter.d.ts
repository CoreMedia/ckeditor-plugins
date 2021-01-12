import Document from "./document";
import { MatcherPattern } from "./matcher";
import Node from "./node";
import DocumentFragment from "./documentfragment";

export default class DomConverter {
  constructor(document: Document, options?: {
    blockFillerMode?: string
  });

  registerRawContentMatcher(pattern: MatcherPattern): void;

  viewToDom(viewNode: Node | DocumentFragment, domDocument: Document, options?: {
    bind?: boolean,
    withChildren?: boolean,
  }): Node | DocumentFragment;
}
