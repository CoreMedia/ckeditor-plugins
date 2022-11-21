import { createDocument, isDocumentFragment, isElement, isParentNode, isText } from "../dom/Dom";
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";

export interface HtmlToRichTextOptions {
  withChildren: boolean;
}

export const defaultHtmlToRichTextOptions: HtmlToRichTextOptions = {
  withChildren: true,
};

export enum ElementAction {
  /**
   * Only remove element, but keep children (which are then attached
   * to parent).
   */
  remove,
  /**
   * Remove the element as well as its children.
   */
  removeRecursively,
}

interface TransformationResponse {
  /**
   * The transformed node. Unset, if to remove the node.
   */
  node?: Node;
  /**
   * If children still need to be processed. If `true`, all direct
   * child nodes will be processed next. `false` may be used, for example,
   * if the children already got processed during transformation. If
   * `transformed` is unset `true` will process the children and return them
   * bundled into a document fragment. Otherwise, if unset, `false` will signal
   * _remove node and all its children_.
   *
   * TODO: Possibly we need caching and expose the convert, so that transformatoin
   *   functions may call the transformer to manually transform children.
   */
  processChildren: boolean;
}

export class HtmlDomToRichTextConverter {
  readonly #rtDocument: Document;

  constructor() {
    this.#rtDocument = createDocument({
      namespace: "http://www.coremedia.com/2003/richtext-1.0",
      qualifiedName: "div",
    });
  }

  htmlToRichText(domNode: Node, options?: Partial<HtmlToRichTextOptions>): Node {
    const withDefaults = {
      ...defaultHtmlToRichTextOptions,
      ...options,
    };
    const { withChildren } = withDefaults;

    if (isText(domNode)) {
      // TODO: Provide filter options here. Perhaps even merge with other processing.
      return domNode;
    }
    let transformed: TransformationResponse | undefined;
    // TODO: mapViewToDom - do we require some kind of caching? May be required, if we want to allow the outside to call transformation.
    if (isDocumentFragment(domNode)) {
      transformed = this.transformDocumentFragment();
    }
    if (isElement(domNode)) {
      // TODO: DomConverter handles elements with xmlns namespace here... just skip it?
      transformed = this.transformElement(domNode);
    }
    // TODO: DomConverter ignores all other types. Do we need to respect them?
    if (!transformed) {
      // We did not map, let's create just an empty fragment.
      return this.createDocumentFragment();
    }
    const { node, processChildren } = transformed;
    const nodeOrFragment = node ?? this.createDocumentFragment();
    // TODO: processChildren is only used as veto.
    if (isParentNode(domNode)) {
      if (withChildren && processChildren) {
        if (isParentNode(nodeOrFragment)) {
          nodeOrFragment.append(...this.transformChildNodes(domNode, withDefaults));
        } else {
          // We may want to log, that processing children got requested, but
          // node does not allow adding children, thus, they are ignored.
        }
      }
    }
    return nodeOrFragment;
  }

  *transformChildNodes(parent: ParentNode, options?: Partial<HtmlToRichTextOptions>): IterableIterator<Node> {
    for (const child of parent.childNodes) {
      if (isParentNode(child)) {
        yield* this.transformChildNodes(child, options);
      }
      yield this.htmlToRichText(child, options);
    }
  }

  /**
   * Creates empty document fragment. This may also serve to represent
   * _removal_ of nodes, such as comments.
   */
  createDocumentFragment(): DocumentFragment {
    return this.#rtDocument.createDocumentFragment();
  }

  transformDocumentFragment(): TransformationResponse {
    return {
      node: this.createDocumentFragment(),
      processChildren: true,
    };
  }

  transformElement(domElement: Element): TransformationResponse {
    const matcherPattern: MatcherPattern = {} as MatcherPattern;
    // TODO: undefined should signal to remove it instead. But what about replace-by-children?
    // TODO: Should also take care of copying attributes.
    // TODO: We may even allow a document fragment to split up elements.
    // TODO: Possibly allow to signal, not to manually process children anymore
    // TODO: CONTINUE HERE?!?!? Possibly, as we now want to apply some mapping.
    return { processChildren: true };
  }
}
