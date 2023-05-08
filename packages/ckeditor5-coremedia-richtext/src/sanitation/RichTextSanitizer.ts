import { ActiveStrictness, Strictness } from "../Strictness";
import { SanitationListener, silentSanitationListener } from "./SanitationListener";
import { namespaces } from "../Namespaces";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/src/ParentNodes";
import { supportedElements } from "./RichTextDtd";

/**
 * Sanitizes CoreMedia Rich Text 1.0, so that it can be stored at CoreMedia CMS
 * without validation issues. Note that less strict checking may violate this
 * goal.
 */
export class RichTextSanitizer {
  /**
   * Constructor.
   *
   * @param strictness - strictness to apply
   * @param listener - listener for sanitizing events
   */
  constructor(
    public readonly strictness: Strictness = Strictness.STRICT,
    public readonly listener: SanitationListener = silentSanitationListener
  ) {}

  /**
   * Sanitizes the given document, so that it could be stored on CoreMedia CMS
   * with enabled CoreMedia Rich Text 1.0 validation.
   *
   * Any severe issues reported to the listener should be addressed by
   * adapting the data-processing configuration accordingly.
   *
   * @param document - document to sanitize
   * @returns document (as is, but possibly with modifications applied) or
   * `false` if `documentElement` does not match requirements.
   */
  sanitize<T extends Document>(document: T): T | false {
    const { strictness } = this;

    if (strictness === Strictness.NONE) {
      // Sanitation turned off.
      return document;
    }

    this.listener.started();
    const { documentElement } = document;
    let result: T | false = document;
    // Regarding Prefix: While supported theoretically, CoreMedia Rich Text 1.0
    // with prefix is mostly unsupported in various layers of CoreMedia CMS.
    if (
      documentElement.localName !== "div" ||
      documentElement.namespaceURI !== namespaces.default ||
      documentElement.prefix
    ) {
      this.listener.fatal(`Invalid document element. Expected: <div>, Action: <${documentElement.localName}>`);
      result = false;
    } else {
      try {
        this.#sanitize(documentElement, strictness);
      } catch (e) {
        this.listener.fatal(`Sanitation failed with error: ${e}`, e);
        result = false;
      }
    }
    this.listener.stopped();
    return result;
  }

  /**
   * Sanitizes a given element. As checks for allowed children are only
   * possible, when processing of children finished, child nodes will be
   * sanitized first as recursive call.
   *
   * @param element - element to analyze
   * @param strictness - strictness level to apply (only active strictness levels supported)
   * @param depth - current element depth
   */
  #sanitize(element: Element, strictness: ActiveStrictness, depth = 0): void {
    this.listener.enteringElement(element, depth);

    if (isParentNode(element)) {
      for (const childElement of element.children) {
        this.#sanitize(childElement, strictness, depth + 1);
      }
    }

    const { listener } = this;
    const { prefix, localName } = element;

    // We don't respect prefixed elements yet. Thus, any prefixed
    // elements are by default considered invalid. This, for example,
    // is true for `<xdiff:span>`. We expect them to be removed when
    // processing the parent element.
    if (!prefix) {
      // If this element is not supported, it is expected to be cleaned up
      //  when the parent node is processed. This again requires that the root
      // element gets extra processing applied.
      supportedElements[localName]?.process(element, strictness, listener);
    }

    this.listener.leavingElement(element, depth);
  }
}
