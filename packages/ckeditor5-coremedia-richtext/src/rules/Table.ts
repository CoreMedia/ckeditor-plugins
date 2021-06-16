import { ElementsFilterRuleSetConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import { replaceByElementAndClassBackAndForth } from "./ReplaceBy";
import { ElementFilterParams } from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";

/**
 * Reserved class to denote tables cells in CoreMedia RichText, which are
 * actually `<th>` rather than `<td>`.
 */
const HEADER_CELL_CLASS = "td--header";
/**
 * Reserved class to denote table rows in CoreMedia RichText, which are meant
 * to be part of `<thead>` rather than `<tbody>`.
 */
const THEAD_ROW_CLASS = "tr--header";
/**
 * Reserved class to denote table rows in CoreMedia RichText, which are meant
 * to be part of `<tfoot>` rather than `<tbody>`.
 *
 * Note, that CKEditor 5, 24.x, does not support `<tfoot>`. Instead, any footer
 * will be moved into `<tbody>`.
 */
const TFOOT_ROW_CLASS = "tr--footer";

export const tableRules: ElementsFilterRuleSetConfiguration = {
  td: (params) => {
    params.node.removeChildren = params.node.isEmpty((el, idx, children) => {
      // !Reverted logic! `true` signals, that the element should be considered,
      //   when judging on "is empty".

      // Only filter, if there is only one child. While it may be argued, if this
      // is useful, this is the behavior as we had it for CKEditor 4.
      if (children.length !== 1) {
        return true;
      }
      // If the element has more than one child node, the following rules don't apply.
      if (el.childNodes.length > 1) {
        return true;
      }

      // Ignore, if only one br exists.
      if (el.nodeName.toLowerCase() === "br") {
        return false;
      }
      // Next gate: Further analysis only required, if current element is <p>
      if (el.nodeName.toLowerCase() !== "p") {
        return true;
      }
      // Only respect p-element, if it is considered non-empty.
      // Because of the check above, we already know, that, the element
      // has at maximum one child.
      return el.hasChildNodes() && el.firstChild?.nodeName.toLowerCase() !== "br";
    });
  },
  th: replaceByElementAndClassBackAndForth("th", "td", HEADER_CELL_CLASS),
  /*
   * tr/tables rules:
   * ----------------
   *
   * In CKEditor 4 we also had to handle tr and table which may have been
   * emptied during the process. This behavior moved to the after-children
   * behavior, which checks for elements which must not be empty but now
   * are empty.
   */
  tbody: (params) => {
    // If there are more elements at parent than just this tbody, tbody must
    // be removed. Typical scenario: Unknown element <thead> got removed, leaving
    // a structure like <table><tr/><tbody><tr/></tbody></table>. We must now move
    // all nested trs up one level and remove the tbody params.el.
    params.node.replaceByChildren = !params.node.singleton;
  },
  table: {
    toData: (params: ElementFilterParams): void => {
      toDataProcessTableContents(new TableWrapper(params.node.delegate));
    },
    toView: (params: ElementFilterParams): void => {
      toViewProcessTableContents(new TableWrapper(params.node.delegate));
    },
  },
};

class ElementWrapper {
  private readonly _delegate: Element;

  constructor(delegate: Element) {
    this._delegate = delegate;
  }

  get delegate(): Element {
    return this._delegate;
  }

  getDirectElementByTagName(tagName: string): Element | undefined {
    return [...this.delegate.querySelectorAll(tagName)].find((e) => this.delegate.isSameNode(e.parentElement));
  }

  getDirectElementsByTagName(tagName: string): Element[] {
    return [...this.delegate.querySelectorAll(tagName)].filter((e) => this.delegate.isSameNode(e.parentElement));
  }
}

/**
 * In Data Processing we don't have higher order elements such as
 * `HTMLTableSectionElement`. Instead, we are going to simulate, as if we had
 * a similar API.
 */
class TableSectionWrapper extends ElementWrapper {
  constructor(delegate: Element) {
    super(delegate);
  }

  get rows(): Element[] {
    return this.getDirectElementsByTagName("tr");
  }
}

/**
 * In Data Processing we don't have higher order elements such as
 * `HTMLTableElement`. Instead, we are going to simulate, as if we had
 * a similar API.
 */
class TableWrapper extends ElementWrapper {
  constructor(delegate: Element) {
    super(delegate);
  }

  getDirectElementsInSectionsByTagName(tagName: string): Element[] {
    const acceptedParents = this.sections;
    return acceptedParents.flatMap((s) =>
      [...s.querySelectorAll(tagName)].filter((e) => s.isSameNode(e.parentElement))
    );
  }

  /**
   * Returns all direct rows in the table, either as direct children of
   * `<table>` or within one of the table sections `<thead>`, `<tbody>`, or
   * `<tfoot>`.
   *
   * In contrast to `HTMLTableElement.rows` this does not make any guarantee
   * on the order of rows.
   */
  get rows(): Element[] {
    // Unfortunately, we cannot use CSS pseudo selector :scope here. So, we need
    // to perform the search manually.
    return [...this.getDirectElementsInSectionsByTagName("tr"), ...this.getDirectElementsByTagName("tr")];
  }

  /**
   * Returns all existing table sections.
   */
  get sections(): Element[] {
    return <Element[]>[this.tHead, ...this.tBodies, this.tFoot].filter(Boolean);
  }

  /**
   * Returns all `<tbody>` elements which are available as snapshot.
   * Note, that while in HTML a table may have multiple `<tbody>` elements,
   * CoreMedia RichText 1.0 may have only one element.
   */
  get tBodies(): Element[] {
    return this.getDirectElementsByTagName("tbody");
  }

  /**
   * Returns the first existing `<tbody>` element, if available.
   */
  get firstTBody(): Element | undefined {
    return this.getDirectElementByTagName("tbody");
  }

  /**
   * Returns the `<tfoot>` element, if available.
   */
  get tFoot(): Element | undefined {
    return this.getDirectElementByTagName("tfoot");
  }

  /**
   * Returns the `<thead>` element, if available.
   */
  get tHead(): Element | undefined {
    return this.getDirectElementByTagName("thead");
  }

  /**
   * If no `<tbody>` is existing yet, a `<tbody>` element will be created.
   * Otherwise, the first existing `<tbody>` will be returned.
   */
  createTBody(): Element {
    let result = this.firstTBody;
    if (!result) {
      result = this.delegate.ownerDocument.createElement("tbody");
      const foot = this.tFoot;
      if (!!foot) {
        this.delegate.insertBefore(result, foot);
      } else {
        this.delegate.appendChild(result);
      }
    }
    return result;
  }

  /**
   * If no `<tfoot>` is existing yet, a `<tfoot>` will be created.
   * Otherwise, the existing `<tfoot>` will be returned.
   */
  createTFoot(): Element {
    let result = this.tFoot;
    if (!result) {
      result = this.delegate.ownerDocument.createElement("tfoot");
      this.delegate.appendChild(result);
    }
    return result;
  }

  /**
   * If no `<thead>` is existing yet, a `<thead>` will be created.
   * Otherwise, the existing `<thead>` will be returned.
   */
  createTHead(): Element {
    let result = this.tHead;
    if (!result) {
      result = this.delegate.ownerDocument.createElement("thead");
      this.delegate.insertBefore(result, this.delegate.firstChild);
    }
    return result;
  }

  /**
   * Deletes a possibly existing `<tfoot>`.
   */
  deleteTFoot(): void {
    const element = this.tFoot;
    if (!!element) {
      this.delegate.removeChild(element);
    }
  }

  /**
   * Deletes a possibly existing `<thead>`.
   */
  deleteTHead(): void {
    const element = this.tHead;
    if (!!element) {
      this.delegate.removeChild(element);
    }
  }

  /**
   * Removes the given child element.
   * @param oldChild child element to remove
   * @return removed child
   */
  removeChild(oldChild: Node): Node {
    return this.delegate.removeChild(oldChild);
  }

  /**
   * Removes any table sections, which are possibly empty after
   * processing.
   */
  removeEmptySections(): void {
    const sections = [this.tHead, ...this.tBodies, this.tFoot];
    for (const section of sections) {
      if (section && section.children.length === 0) {
        this.delegate.removeChild(section);
      }
    }
  }
}

/**
 * CoreMedia RichText tables neither supports `<thead>` nor `<tfoot>` and
 * only supports one `<tbody>`. Prior to processing the children of the table,
 * the following _onBefore_ mapper ensures, that the original structure is kept
 * at best effort.
 *
 * Note, that during data processing, we do not have higher element interfaces
 * at hand such as HTMLTableElement. A `<table>` is represented as normal
 * element, which just shares the same tagName as a `HTMLTableElement`. That's
 * why implementation needs to be more complex.
 *
 * @param tableElement table element to process
 */
function toDataProcessTableContents(tableElement: TableWrapper): void {
  function addClassToRows(section: Element | undefined | null, className: string): void {
    if (!!section) {
      const wrapper = new TableSectionWrapper(section);
      for (const row of wrapper.rows) {
        if (!row.classList.contains(className)) {
          row.classList.add(className);
        }
      }
    }
  }

  addClassToRows(tableElement.tHead, THEAD_ROW_CLASS);
  addClassToRows(tableElement.tFoot, TFOOT_ROW_CLASS);

  const rowsSnapshot = tableElement.rows;
  const targetBody = tableElement.createTBody();

  rowsSnapshot.forEach((row) => {
    targetBody.appendChild(row);
  });

  tableElement.removeEmptySections();
}

/**
 * Transforms a table from data to view. As CoreMedia RichText does not know
 * elements such as `thead` or `tfoot` this structure is rebuilt based on
 * probably assigned classes.
 *
 * Note, that during data processing, we do not have higher element interfaces
 * at hand such as HTMLTableElement. A `<table>` is represented as normal
 * element, which just shares the same tagName as a `HTMLTableElement`. That's
 * why implementation needs to be more complex.
 *
 * This is especially workaround for ckeditor/ckeditor5#9360, which makes some
 * conflicting assumptions on `<th>` elements outside `<thead>`. This is,
 * why it is important to remember and restore the state of a row being part
 * of `<thead>` in view.
 *
 * @param tableElement table element to process
 */
function toViewProcessTableContents(tableElement: TableWrapper): void {
  const rowsSnapshot = tableElement.rows;

  function removeClass(el: Element, className: string): void {
    el.classList.remove(className);
    if (el.classList.length === 0) {
      // Clean-up DOM
      el.attributes.removeNamedItem("class");
    }
  }

  function moveToHead(row: Element): boolean {
    if (!row.classList.contains(THEAD_ROW_CLASS)) {
      return false;
    }
    removeClass(row, THEAD_ROW_CLASS);
    tableElement.createTHead().appendChild(row);
    return true;
  }

  function moveToFoot(row: Element): boolean {
    if (!row.classList.contains(TFOOT_ROW_CLASS)) {
      return false;
    }
    removeClass(row, TFOOT_ROW_CLASS);
    tableElement.createTFoot().appendChild(row);
    return true;
  }

  function moveToBody(row: Element): void {
    tableElement.createTBody().appendChild(row);
  }

  rowsSnapshot.forEach((row) => {
    if (!moveToHead(row) && !moveToFoot(row)) {
      moveToBody(row);
    }
  });

  tableElement.removeEmptySections();
}
