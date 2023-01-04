/* eslint-disable jsdoc/require-returns-check,@typescript-eslint/unified-signatures */
import { createElement, removeClass } from "./Elements";
import { querySelectorAllDirectChildren, querySelectorDirectChild } from "./ParentNodes";

/**
 * Type-Guard for DOM `HTMLTableElement`.
 *
 * @param value - value to guard
 */
export const isHTMLTableElement = (value: unknown): value is HTMLTableElement => value instanceof HTMLTableElement;

/**
 * Wraps the given `<table>` element into a wrapper, which provides some
 * convenience especially for `<table>` elements in non-HTML schema
 * like CoreMedia Rich Text 1.0.
 *
 * In contrast to just instantiating `HTMLTableElementWrapper`, this method
 * only creates a wrapper for applicable elements and returns `undefined`
 * otherwise.
 *
 * @param delegate - delegate to wrap
 */
export const wrapIfTableElement = (delegate: Element | HTMLTableElement): HTMLTableElementWrapper | undefined => {
  if (delegate.localName !== "table" && !isHTMLTableElement(delegate)) {
    return undefined;
  }
  // Safe to create wrapper without possibly triggering exception.
  return new HTMLTableElementWrapper(delegate);
};

/**
 * Convenience wrapper for tables in different schemas. While for HTML schemas
 * as used for data view representation in CKEditor 5 high level methods can
 * be used to modify a table (`HTMLTableElement`), the same convenience cannot
 * be used for `<table>` elements as retrieved via CoreMedia Rich Text 1.0
 * data.
 *
 * This wrapper will provide similar convenience for both, like, for example,
 * creating `<tbody>` elements, accessing `<thead>` elements, etc.
 */
export class HTMLTableElementWrapper {
  /**
   * The wrapped (raw) element.
   */
  readonly #delegate: Element | HTMLTableElement;
  /**
   * Represents high-level API, which may be used for tables as retrieved
   * from data view of CKEditor 5.
   */
  readonly #tableDelegate: HTMLTableElement | undefined;

  /**
   * Constructor.
   *
   * @param delegate element to wrap
   * @throws Error, if the given element is no `<table>`.
   */
  constructor(delegate: Element | HTMLTableElement) {
    this.#delegate = delegate;
    if (isHTMLTableElement(delegate)) {
      this.#tableDelegate = delegate;
    } else {
      if (delegate.localName !== "table") {
        throw new Error(`Unsupported element to wrap: localName=${delegate.localName}`);
      }
    }
  }

  /**
   * Signals, if native `HTMLTableElement` API is used.
   */
  get native(): boolean {
    return !!this.#tableDelegate;
  }

  /**
   * Get owner document.
   */
  get ownerDocument(): Document {
    return this.#delegate.ownerDocument;
  }

  /**
   * Get first child, if any.
   */
  get firstChild(): Node | null {
    return this.#delegate.firstChild;
  }

  /**
   * Removes the given child.
   *
   * @param child - child node to remove
   */
  removeChild<T extends Node>(child: T): T {
    return this.#delegate.removeChild(child);
  }

  insertBefore<T extends Node>(node: T, child: Node | null): T {
    return this.#delegate.insertBefore(node, child);
  }

  insertAfter<T extends Node>(node: T, child: Node | null): T {
    // https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
    return this.insertBefore(node, child?.nextSibling ?? null);
  }

  /**
   * Returns all direct rows in the table, either as direct children of
   * `<table>` or within one of the table sections `<thead>`, `<tbody>`, or
   * `<tfoot>`.
   *
   * In contrast to `HTMLTableElement.rows` the result is static.
   */
  get rows(): Element[] {
    if (this.#tableDelegate) {
      return [...this.#tableDelegate.rows];
    }
    return this.querySelectorAllDirectChildrenInSectionsAndSelf("tr");
  }

  /**
   * Returns all existing direct table sections.
   */
  get sections(): (Element | HTMLTableSectionElement)[] {
    return [this.tHead, ...this.tBodies, this.tFoot].filter(Boolean) as Element[];
  }

  /**
   * Returns all `<tbody>` elements, which are available as snapshot.
   * Note, that while in HTML a table may have multiple `<tbody>` elements,
   * CoreMedia RichText 1.0 may have only one element.
   */
  get tBodies(): (Element | HTMLTableSectionElement)[] {
    if (this.#tableDelegate) {
      return [...this.#tableDelegate.tBodies];
    }
    return querySelectorAllDirectChildren(this.#delegate, "tbody");
  }

  /**
   * Returns the first existing `<tbody>` element, if available.
   */
  get firstTBody(): Element | HTMLTableSectionElement | null {
    return this.tBodies.find(Boolean) ?? null;
  }

  /**
   * Returns the last existing `<tbody>` element, if available.
   */
  get lastTBody(): Element | HTMLTableSectionElement | null {
    const { tBodies } = this;
    return tBodies[tBodies.length - 1] ?? null;
  }

  /**
   * Returns the `<thead>` element, if available.
   */
  get tHead(): Element | HTMLTableSectionElement | null {
    if (this.#tableDelegate) {
      return this.#tableDelegate.tHead;
    }
    return querySelectorDirectChild(this.#delegate, "thead");
  }

  /**
   * Returns the `<thead>` element, if available.
   */
  get tFoot(): Element | HTMLTableSectionElement | null {
    if (this.#tableDelegate) {
      return this.#tableDelegate.tFoot;
    }
    return querySelectorDirectChild(this.#delegate, "tfoot");
  }

  /**
   * Creates a new `<tbody>` associated to current table. If multiple
   * `<tbody>` elements exist, the new one is placed after the existing
   * ones.
   */
  createTBody(): Element | HTMLTableSectionElement {
    if (this.#tableDelegate) {
      return this.#tableDelegate.createTBody();
    }

    const result = createElement(this.ownerDocument, "tbody");

    return this.insertAfter(result, this.lastTBody);
  }

  /**
   * If no `<tbody>` is existing yet, a `<tbody>` element will be created.
   * Otherwise, the first existing `<tbody>` will be returned.
   */
  ensureTBody(): Element | HTMLTableSectionElement {
    const result = this.firstTBody;

    if (!result) {
      return this.createTBody();
    }

    return result;
  }

  /**
   * If no `<thead>` is existing yet, a `<thead>` will be created.
   * Otherwise, the existing `<thead>` will be returned.
   */
  createTHead(): Element | HTMLTableSectionElement {
    if (this.#tableDelegate) {
      return this.#tableDelegate.createTHead();
    }

    let result = this.tHead;

    if (!result) {
      result = createElement(this.ownerDocument, "thead");
      this.#delegate.insertBefore(result, this.firstChild);
    }

    return result;
  }

  /**
   * If no `<tfoot>` is existing yet, a `<tfoot>` will be created.
   * Otherwise, the existing `<tfoot>` will be returned.
   */
  createTFoot(): Element | HTMLTableSectionElement {
    if (this.#tableDelegate) {
      return this.#tableDelegate.createTFoot();
    }

    let result = this.tHead;

    if (!result) {
      result = createElement(this.ownerDocument, "tfoot");
      this.#delegate.insertBefore(result, this.firstChild);
    }

    return result;
  }

  /**
   * Deletes a possibly existing `<thead>`.
   */
  deleteTHead(): void {
    if (this.#tableDelegate) {
      return this.#tableDelegate.deleteTHead();
    }

    const element = this.tHead;

    if (element) {
      this.removeChild(element);
    }
  }

  /**
   * Deletes a possibly existing `<tfoot>`.
   */
  deleteTFoot(): void {
    if (this.#tableDelegate) {
      return this.#tableDelegate.deleteTFoot();
    }

    const element = this.tFoot;

    if (element) {
      this.removeChild(element);
    }
  }

  /**
   * Removes any table sections, which are possibly empty after
   * processing.
   */
  removeEmptySections(): void {
    this.sections.forEach((section) => {
      if (section.childElementCount === 0) {
        section.remove();
      }
    });
  }

  /**
   * Merges all sections in table into one `<tbody>` element. Note, that
   * this removes any `<thead>` and `<tfoot>` sections. For processing such
   * as in CKEditor 5 data-processing you may want to mark corresponding rows
   * before, that they originally belonged to `<thead>` or `<tfoot>` like
   * applying a _reserved class_.
   */
  mergeAllRowsOfAllSectionsIntoTBody(): void {
    const { rows } = this;
    const tBody = this.createTBody();
    rows.forEach((row) => {
      tBody.append(row);
    });
    this.removeEmptySections();
  }

  /**
   * Moves all rows containing a given class name to `<thead>` section.
   *
   * @param className - class name to select row elements to move
   * @param remove - if to remove the denoting class name from class list
   */
  moveRowsWithClassToTHead(className: string, remove = true): void {
    const { rows } = this;
    const tHead = this.createTHead();
    rows
      .filter((row) => row.classList.contains(className))
      .forEach((row) => {
        tHead.append(row);
        if (remove) {
          removeClass(row, className);
        }
      });
    this.removeEmptySections();
  }

  /**
   * Moves all rows containing a given class name to `<tfoot>` section.
   *
   * @param className - class name to select row elements to move
   * @param remove - if to remove the denoting class name from class list
   */
  moveRowsWithClassToTFoot(className: string, remove = true): void {
    const { rows } = this;
    const tHead = this.createTHead();
    rows
      .filter((row) => row.classList.contains(className))
      .forEach((row) => {
        tHead.append(row);
        if (remove) {
          removeClass(row, className);
        }
      });
    this.removeEmptySections();
  }

  /**
   * Merges possibly existing multiple `<tbody>` into one.
   * Note, that while HTML supports multiple `<tbody>` elements,
   * CoreMedia Rich Text 1.0 does not.
   */
  mergeTBodies(): void {
    const tBody = this.createTBody();
    this.tBodies.forEach((current) => {
      if (current.isSameNode(tBody)) {
        // Skip first/target tBody.
        return;
      }
      const range = this.ownerDocument.createRange();
      range.selectNodeContents(current);
      tBody.append(range.extractContents());
      current.remove();
    });
  }

  /**
   * Retrieve all direct children and direct children of all sections
   * that match the given selectors.
   *
   * @param selectors - selectors to match
   */
  querySelectorAllDirectChildrenInSectionsAndSelf(selectors: string): Element[] {
    const acceptedParents = [this.#delegate, ...this.sections];
    return acceptedParents.flatMap((parent) =>
      [...parent.querySelectorAll(selectors)].filter((e) => parent.isSameNode(e.parentElement))
    );
  }
}
