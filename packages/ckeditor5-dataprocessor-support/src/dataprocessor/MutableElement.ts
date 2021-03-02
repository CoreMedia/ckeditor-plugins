import { DEFAULT_NAMESPACES, Namespaces } from "./Namespace";
import Config from "@ckeditor/ckeditor5-utils/src/config";

/**
 * Possible attribute values to assign. `null` represents a deleted property.
 */
export type AttributeValue = string | null;

/**
 * The attributes of an element.
 */
export interface Attributes {
  [index: string]: AttributeValue;
}

/**
 * Result type for element filters. Typical filters are `void`. A return value
 * of `false` is a shortcut for `element.remove = true`. A return value of
 * `true` is actually ignored and expect to express _keep element_.
 */
export type ElementFilterResult = void | boolean;

/**
 * Named parameters to be passed to element filters. For overriding filter rules
 * a typical pattern to start with is:
 *
 * <pre>
 * params.parent && params.parent(args);
 * </pre>
 */
export interface ElementFilterParams {
  /**
   * The element to process.
   */
  el: MutableElement,
  /**
   * A parent mapping to respect (or to ignore, thus override).
   */
  parentRule?: ElementFilterRule,
  /**
   * CKEditor Configuration.
   */
  config?: Config,
}
export type ElementFilterRule = (params: ElementFilterParams) => ElementFilterResult;
/**
 * Predicate to select children.
 */
export type ChildPredicate = (child: ChildNode, index: number, array: ChildNode[]) => boolean;

/**
 * A wrapper for a given element, which allows to store changes to be applied
 * to the DOM structure later on.
 */
export default class MutableElement implements ElementFilterParams {
  private readonly _delegate: Element;
  /**
   * If the name is set to empty string, the element itself is removed,
   * but its children added to the element's parent. If the name is set
   * and different to the original tag-name, the original element will
   * be replaced with the new element having the same attributes and
   * children as the element before.
   *
   * The default value `undefined` signals, to keep the element as is.
   *
   * A value of `null` signals to remove the element.
   * @private
   */
  private _name: string | null | undefined = undefined;
  /**
   * Signals, that children should be cleared.
   * @private
   */
  private _clearChildren: boolean = false;
  /**
   * Overrides for attribute values.
   * @private
   */
  private readonly _attributes: Attributes = {};
  /**
   * A set of well-known namespaces. Any prefix detected during processing
   * will trigger the corresponding namespace declaration to be added to
   * the owner document.
   *
   * Note, that this behavior is different to CoreMedia's Data Processing for
   * CKEditor 4. In the previous implementation we always added the
   * xlink-namespace, no matter if used or not. And we did not add any other
   * namespace, possibly used by other elements.
   *
   * @private
   */
  private readonly _namespaces: Namespaces;
  private readonly _config: Config | undefined;

  /**
   * Constructor.
   *
   * @param delegate the original element to wrap
   * @param config? CKEditor configuration
   * @param namespaces the namespaces to take into account
   */
  constructor(delegate: Element, config?: Config, namespaces: Namespaces = DEFAULT_NAMESPACES) {
    this._delegate = delegate;
    this._namespaces = namespaces;
    this._config = config;
  }

  /**
   * Access to CKEditor config.
   */
  get config(): Config | undefined {
    return this._config;
  }

  /**
   * Convenience, so that this element can be itself re-used as rule for
   * nested calls.
   */
  get el(): MutableElement {
    return this;
  }

  /**
   * Nothing to do. The method just exists, so that it fulfills the interface.
   */
  parentRule(): ElementFilterResult {
  }


  /**
   * Access owner document.
   */
  get ownerDocument(): Document {
    return this._delegate.ownerDocument;
  }

  /**
   * Access to the parent node of this element.
   */
  get parent(): (Node & ParentNode) | null {
    return this._delegate.parentNode;
  }

  /**
   * Access to the parent element of this element. The element is wrapped
   * by `MutableElement`. Note, that if used for modification purpose, it is
   * task of the caller persisting changes.
   */
  get parentElement(): MutableElement | null {
    const parentElement = this._delegate.parentElement;
    if (!parentElement) {
      return null;
    }
    return new MutableElement(parentElement, this._config, this._namespaces);
  }

  /**
   * The nodes that are direct children of this element.
   */
  get children(): ChildNode[] {
    if (this._clearChildren) {
      return [];
    }
    return Array.from(this._delegate.childNodes);
  }

  /**
   * Get first (matching) child node of the given element.
   * @param condition string: the node name to match (ignoring case), predicate:
   * the predicate to apply.
   */
  public getFirst(condition?: string | ChildPredicate): ChildNode | undefined {
    const childNodes = this.children;
    if (!condition) {
      return childNodes.length ? childNodes[0] : undefined;
    }
    let predicate: ChildPredicate;
    if (typeof condition === "function") {
      predicate = condition;
    } else {
      predicate = (child) => {
        return child.nodeName.toLowerCase() === condition.toLowerCase();
      };
    }
    return childNodes.find(predicate);
  }

  /**
   * Signals, if this is the last node in parent. Always `false` if no
   * parent exists.
   */
  get isLastNode(): boolean {
    return !this._delegate.nextSibling;
  }

  /**
   * Signals, if this element is empty.
   */
  public isEmpty(considerChildNode: (el:ChildNode, index: number, array: ChildNode[]) => boolean = () => true): boolean {
    if (this._clearChildren || !this._delegate.hasChildNodes()) {
      return true;
    }
    const consideredChildNodesLength = Array.from(this._delegate.childNodes)
      .filter(considerChildNode)
      .length;
    return consideredChildNodesLength === 0;
  }

  /**
   * Apply given rules. If any of the rules will invalidate this element either
   * by deletion or by replacing it, no further rules will be applied.
   *
   * @param rules rules to apply in given order
   * @return a node, if filtering should be restarted from this node; `null` otherwise.
   */
  applyRules(...rules: (ElementFilterRule | undefined)[]): Node | null {
    for (const rule of rules) {
      if (!!rule) {
        const result = rule(this);
        // false positive inspection: We need to distinguish void from false!
        // noinspection PointlessBooleanExpressionJS
        if (result === false) {
          this.remove = true;
        }

        const continueOrContinueWith = this.persistInternal();
        if (continueOrContinueWith instanceof Node) {
          return continueOrContinueWith;
        }
        if (!continueOrContinueWith) {
          break;
        }
      }
    }
    return null;
  }

  persist(): void {
    this.persistInternal();
  }

  /**
   * Persists the changes, as requested.
   *
   * @return a node from where a restart is required; or a boolean flag if
   * filtering shall be continued for this element.
   */
  private persistInternal(): Node | boolean {
    const newName = this._name;
    if (this._clearChildren) {
      this._delegate.innerHTML = "";
    }
    if (newName === null) {
      return this.persistDeletion();
    }
    if (newName === undefined || newName.toLowerCase() === this._delegate.tagName.toLowerCase()) {
      return this.persistAttributes();
    }
    if (this.replaceByChildren) {
      return this.persistReplaceByChildren();
    }
    return this.persistReplaceBy(newName);
  }

  /**
   * The main purpose of this method is to persist changes to attributes.
   * Nevertheless, this method may forward to `persistReplaceBy` if either
   * a namespace change has been explicitly requested (by `xmlns` attribute)
   * or if the namespace of the current element does not match the namespace
   * of the owning document.
   *
   * The latter one is typically the case when transforming e.g. from HTML
   * to CoreMedia RichText, where elements have the HTML namespace
   * `http://www.w3.org/1999/xhtml` and must be adapted to the corresponding
   * XML namespace.
   *
   * @private
   */
  private persistAttributes(): true | Element {
    const elementNamespaceAttribute: string | null = this._attributes["xmlns"];
    if (!!elementNamespaceAttribute) {
      // We cannot just set attributes. We need to create a new element with
      // the given namespace.
      return this.persistReplaceBy(this._delegate.tagName.toLowerCase(), elementNamespaceAttribute);
    }
    /*
     * We don't have an extra namespace-attribute set during filtering. Nevertheless,
     * the namespace of this element may be different from owner-document. If it is
     * different, we need to create a new element as well.
     */
    const ownerNamespaceURI = this._delegate.ownerDocument.documentElement.namespaceURI;
    if (this._delegate.namespaceURI !== ownerNamespaceURI) {
      return this.persistReplaceBy(this._delegate.tagName.toLowerCase(), ownerNamespaceURI);
    }
    this.applyAttributes(this._delegate, this._attributes);
    return true;
  }

  /**
   * Applies the given attributes to the given element. This mapping ignores
   * a possibly given `xmlns` attribute, as it must be handled separately
   * (by creating a new element with given namespace).
   *
   * @param targetElement the element to apply attributes to
   * @param attributes set of attributes to apply
   * @private
   */
  private applyAttributes(targetElement: Element, attributes: Attributes): void {
    const ownerDocument = targetElement.ownerDocument;
    const attributeNames = Object.keys(attributes);

    function handleAttributeWithoutNamespacePrefix(key: string, value: string | null) {
      if (value === null) {
        targetElement.removeAttributeNS(null, key);
      } else {
        targetElement.setAttributeNS(null, key, value);
      }
    }

    function handleAttributeWithNamespacePrefix(uri: string | undefined, prefix: string, key: string, value: string | null) {
      if (value === null) {
        if (uri) {
          targetElement.removeAttributeNS(uri, key);
          // Also remove attribute, if not namespace aware.
          targetElement.removeAttribute(key);
        } else {
          targetElement.removeAttribute(key);
        }
      } else {
        if (uri) {
          targetElement.setAttributeNS(uri, key, value);
          // Publish Namespace to root element.
          ownerDocument.documentElement.setAttributeNS(DEFAULT_NAMESPACES["xmlns"].uri, `xmlns:${prefix}`, uri);
        } else {
          targetElement.setAttribute(key, value);
        }
      }
    }

    attributeNames
      // Must not set namespace as attribute.
      .filter((key) => key !== "xmlns")
      .forEach((key: string) => {
        const value: AttributeValue = attributes[key];
        // TODO[cke] Failed using ES2018 named group access here. Can you get it to work?
        const pattern = /^(?<prefix>\w+):(?<localName>.*)$/;
        // TODO[cke] Desired ES2018 pattern: const { groups: { prefix, localName } } = ...
        const match: RegExpExecArray | null = pattern.exec(key);
        if (!match) {
          handleAttributeWithoutNamespacePrefix(key, value);
        } else {
          const prefix = match[1];
          const uri = this._namespaces[prefix]?.uri;
          handleAttributeWithNamespacePrefix(uri, prefix, key, value);
        }
      });
  }

  /**
   * Will remove this element from its parent, if parent exists.
   * @return always `false` which signals, that no more filters shall be applied to this element.
   * @private
   */
  private persistDeletion(): false {
    this._delegate.parentNode?.removeChild(this._delegate);
    return false;
  }

  /**
   * Replaces this element by its children.
   * @return `ChildNode` if children existed, representing the first child node; `false` if no children existed,
   * to signal, that this element must not be processed by subsequent filters.
   * @private
   */
  private persistReplaceByChildren(): ChildNode | false {
    const parentNode = this._delegate.parentNode;
    if (!parentNode) {
      // Cannot apply. Assume, that the element shall just vanish.
      return false;
    }

    const range = this.ownerDocument.createRange();
    range.selectNodeContents(this._delegate);
    const fragment = range.extractContents();
    const firstChild: ChildNode | null = fragment.firstChild;

    parentNode.replaceChild(fragment, this._delegate);

    return firstChild || false;
  }

  /**
   * Replaces the current element by a new one of given name. Will either
   * create an element of the given namespace or of the same namespace as
   * the owner document.
   *
   * @param newName new element name
   * @param namespace optional namespace URI
   * @return newly created element, for which filtering should be re-applied.
   * @private
   */
  private persistReplaceBy(newName: string, namespace?: string | null): Element {
    if (!namespace && !!this.attributes["xmlns"]) {
      return this.persistReplaceBy(newName, this.attributes["xmlns"]);
    }
    let newElement: Element;
    const ownerDocument = this.ownerDocument;
    if (namespace) {
      newElement = ownerDocument.createElementNS(namespace, newName);
    } else {
      newElement = ownerDocument.createElementNS(ownerDocument.documentElement.namespaceURI, newName);
    }
    this.replaceByElement(newElement);
    return newElement;
  }

  private replaceByElement(newElement: Element): void {
    this.applyAttributes(newElement, this.attributes);

    const childrenToMove = this._delegate.childNodes;
    while (childrenToMove.length > 0) {
      // Will also remove it from original parent.
      newElement.append(childrenToMove[0]);
    }

    const parentNode = this._delegate.parentNode;
    if (!!parentNode) {
      parentNode.replaceChild(newElement, this._delegate);
    }
  }

  /**
   * Get direct access to the delegate element.
   */
  get element(): Element {
    return this._delegate;
  }

  /**
   * If children shall be removed.
   */
  get clearChildren(): boolean {
    return this._clearChildren;
  }

  /**
   * Set to `true` to remove children.
   * @param value `true` to remove children, `false` (default) if not.
   */
  set clearChildren(value: boolean) {
    this._clearChildren = value;
  }

  /**
   * Signals, if this mutable element represents a state, where the element
   * shall be removed, while attaching the children to the parent node.
   */
  get replaceByChildren(): boolean {
    return this._name === "";
  }

  /**
   * Sets, if this mutable element represents a state, where the element
   * shall be removed, while attaching the children to the parent node.
   *
   * Convenience: If `true`, the name of this mutable element will be set
   * to empty. Thus, if you change the name afterwards, this state will
   * be reset.
   *
   * @param b `true` to mark as <em>replace with children</em>; `false` otherwise.
   */
  set replaceByChildren(b: boolean) {
    this._name = b ? "" : undefined;
  }

  /**
   * Signals, if this element shall be replaced with a new element of
   * different name.
   */
  get replace(): boolean {
    return !!this._name && this._name.toLowerCase() !== this._delegate.tagName.toLowerCase();
  }

  /**
   * Signals, if this mutable element represents a state, where the element
   * shall be removed, including all its children.
   */
  get remove(): boolean {
    return this._name === null;
  }

  /**
   * Sets, if this mutable element represents a state, where the element
   * shall be removed, including all its children.
   *
   * Convenience: If `true`, the name of this mutable element will be set
   * to `null`. Thus, if you change the name afterwards, this state will
   * be reset.
   *
   * @param b `true` to mark as <em>to remove</em>; `false` otherwise.
   */
  set remove(b: boolean) {
    this._name = b ? null : undefined;
  }

  /**
   * Retrieve the name of the element.
   * If the name got changed, will return this changed name instead.
   */
  get name(): string | null {
    return this._name?.toLowerCase() || this._delegate.tagName.toLowerCase();
  }

  /**
   * Set a new name for this element. Setting a name different to the original
   * name signals, that in the end the delegate element shall be replaced by
   * the new element.
   *
   * @param newName new name for the element; case does not matter; empty string will signal to replace
   * the element by its children; `null` signals to remove the element completely.
   */
  set name(newName: string | null) {
    // must not be simplified, because of different meaning for falsy
    // values '', undefined and null.
    this._name = newName === null ? null : newName.toLowerCase();
  }

  /**
   * Provides access to the attributes of the element. Any modifications are
   * interpreted as <em>modification requests</em>, thus, they are not directly
   * forwarded to the element, but need to be persisted later on.
   *
   * Setting an attribute to a new value, will change the value later on.
   * Deleting an attribute, or setting its value to `null` will later
   * remove the attribute from the element.
   */
  get attributes(): Attributes {
    const element: Element = this._delegate;
    return new Proxy(this._attributes, {
      defineProperty(target: Attributes, p: PropertyKey, attributes: PropertyDescriptor): boolean {
        return Reflect.defineProperty(target, p, attributes);
      },
      /**
       * Retrieves the current attribute value. It is either the overwritten
       * value, or, if not overwritten, the original value.
       */
      get(target: Attributes, attrName: PropertyKey, receiver: never): AttributeValue {
        if (Reflect.has(target, attrName)) {
          return Reflect.get(target, attrName, receiver);
        }
        if (typeof attrName === "string") {
          return element.getAttribute(attrName);
        }
        return null;
      },
      /**
       * Gets the property descriptor for the given property. This is
       * especially used, when looping over the attributes and accessing
       * and/or modifying them.
       */
      getOwnPropertyDescriptor(target: Attributes, attrName: PropertyKey): PropertyDescriptor | undefined {
        // Handle, if this is the overwritten state.
        if (Reflect.has(target, attrName)) {
          const value = Reflect.get(target, attrName);
          if (value === undefined || value === null) {
            return undefined;
          }
          return {
            configurable: true,
            enumerable: true,

            get(): unknown {
              return value;
            },

            set(v: unknown): void {
              Reflect.set(target, attrName, v);
            },
          };
        }
        // Fallback to original attributes.
        if (typeof attrName === "string" && element.hasAttribute(attrName)) {
          return {
            configurable: true,
            enumerable: true,

            get(): string | null {
              return element.getAttribute(attrName);
            },

            set(v: unknown): void {
              Reflect.set(target, attrName, v);
            },
          };
        }
        // Key is of type we cannot handle for original attributes: Thus, we signal not knowing it.
        return undefined;
      },
      /**
       * Sets a specific property, and thus overrides it. Setting it to
       * `null` is the same as deleting it.
       */
      set(target: Attributes, p: PropertyKey, value: unknown): boolean {
        return Reflect.set(target, p, value);
      },
      /**
       * Deletes the property. Thus, if existing, marks it as <em>to-be-deleted</em>.
       */
      deleteProperty(target: Attributes, p: PropertyKey): boolean {
        return Reflect.set(target, p, null);
      },
      /**
       * Signals, if this property is available. Excludes any previously
       * deleted properties.
       */
      has(target: Attributes, p: PropertyKey): boolean {
        if (Reflect.has(target, p)) {
          return Reflect.get(target, p) !== null;
        }
        if (typeof p === "string") {
          return element.hasAttribute(p);
        }
        return false;
      },
      /**
       * Provides all existing attributes names, skipping those, which got
       * marked for deletion.
       */
      ownKeys(target: Attributes): PropertyKey[] {
        const targetKeys: PropertyKey[] = Reflect.ownKeys(target);
        const elementAttrs: PropertyKey[] = element.getAttributeNames();
        // Join distinct keys, skip forcibly deleted.
        return elementAttrs
          .concat(targetKeys.filter((k: PropertyKey) => elementAttrs.indexOf(k) < 0))
          .filter((k: PropertyKey) => !Reflect.has(target, k) || Reflect.get(target, k) !== undefined);
      },
    });
  }
}
