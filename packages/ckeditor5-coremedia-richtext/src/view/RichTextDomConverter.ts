import { DomConverter } from "@ckeditor/ckeditor5-engine";
import { BlockFillerMode } from "@ckeditor/ckeditor5-engine/src/view/domconverter";
import { createDocument, DomDocumentFragment, DomNode, DomText, isComment, isElement, isText } from "../dom/Dom";
import { ViewDocument, ViewDocumentFragment, ViewNode } from "../lib/CKEditorEngineView";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

/**
 * DomConverter dedicated to CoreMedia Rich Text 1.0.
 */
export class RichTextDomConverter extends DomConverter {
  static readonly #logger: Logger = LoggerProvider.getLogger("RichTextDomConverter");

  readonly #rtDocument: Document;

  constructor(
    viewDocument: ViewDocument,
    options: { renderingMode?: "data" | "editing"; blockFillerMode?: BlockFillerMode | undefined }
  ) {
    super(viewDocument, {
      renderingMode: "data",
      // TODO: We may want to use `markedNbsp` here, to later be able removing this fillers.
      blockFillerMode: "nbsp",
      ...options,
    });

    this.#rtDocument = createDocument({
      namespace: "http://www.coremedia.com/2003/richtext-1.0",
      qualifiedName: "div",
    });

    /*
     * We need to mark xdiff:span as elements preserving spaces. Otherwise,
     * CKEditor would consider adding filler nodes inside xdiff:span elements
     * only containing spaces. As xdiff:span is only meant to be used in
     * read-only CKEditor, there is no issue, preventing the filler node
     * from being inserted.
     *
     * Possible alternative: When mapping `xdiff:span` we could replace any
     * whitespaces with non-breakable-spaces. This solution is cumbersome,
     * though, so this solution was the easiest one.
     *
     * See also: ckeditor/ckeditor5#12324
     */
    // TODO: Eventually, this should be done in Differencing Plugin.
    // @ts-expect-error Typings at DefinitelyTyped only allow this to contain
    // `pre` element. But for TypeScript migration, CKEditor replaced typing
    // by `string[]` instead.
    this.preElements.push("xdiff:span");
  }

  //@ts-expect-error - Typings at DefinitelyTyped outdated.
  viewToDom(
    viewNode: ViewNode | ViewDocumentFragment,
    options: { bind?: boolean; withChildren?: boolean } = {}
  ): DomNode | DomDocumentFragment {
    //@ts-expect-error - Typings at DefinitelyTyped outdated.
    const htmlDataNode: DomNode | DomDocumentFragment = super.viewToDom(viewNode, options);
    if (isText(htmlDataNode)) {
      // TODO: Apply text filters here.
      return htmlDataNode;
    }
    if (isComment(htmlDataNode)) {
      // Ignoring for now. May be extended to wrap a comment into some
      return htmlDataNode;
    }
    if (isElement(htmlDataNode)) {
      return htmlDataNode;
    }
    /*
     * Notes regarding original DomConverter.
     *
     * * _shouldRenameElement is just for security considerations.
     * * withChildren defaults to true.
     * * DomConverter always creates HTML Elements.
     * * It would be a bad idea to try to copy and adapt DomConverter, as it
     *   knows many details how to handle certain node types (like triggering
     *   to render them).
     * * viewChildrenToDom processes children and appends each of them to the
     *   created element. In other words: ... should we skip processing children?
     *
     * TODO: Unfortunately, we may be at a dead end here. We need to have a look
     *  at viewChildrenToDom, if we can somehow get "into" it. Otherwise, we
     *  cannot do anything in here regarding RichText, as there are no (public)
     *  extension points to intervene creation of elements. All in all, we may
     *  be back to the data-processor behaving similar as we have seen in the
     *  DomConverter, but doing extra overhead of again processing all child
     *  elements.
     */
    return {} as DomDocumentFragment;
  }

  /**
   * Creates empty document fragment. This may also serve to represent
   * _removal_ of nodes, such as comments.
   */
  #createEmptyFragment(): DomDocumentFragment {
    return this.#rtDocument.createDocumentFragment();
  }
}
