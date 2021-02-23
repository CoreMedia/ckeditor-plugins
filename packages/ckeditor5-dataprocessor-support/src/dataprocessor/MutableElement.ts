export type AttributeValue = string | null;

export interface Attributes {
  [index: string]: AttributeValue;
}

export type ElementFilterResult = void | boolean;
export type ElementFilterRule = (el: MutableElement) => ElementFilterResult;
export type ChildPredicate = (child: ChildNode, index: number, array: ChildNode[]) => boolean;

/**
 * A wrapper for a given element, which allows to store changes to be applied
 * to the DOM structure later on.
 */
export default class MutableElement {
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
   */
  private _name: string | null | undefined = undefined;
  /**
   * Overrides for attribute values.
   */
  private _attributes: Attributes = {};

  /**
   * Constructor.
   *
   * @param delegate the original element to wrap
   */
  constructor(delegate: Element) {
    this._delegate = delegate;
  }

  get parent(): (Node & ParentNode) | null {
    return this._delegate.parentNode;
  }

  get parentElement(): MutableElement | null {
    const parentElement = this._delegate.parentElement;
    if (!parentElement) {
      return null;
    }
    return new MutableElement(parentElement);
  }

  /**
   * The nodes that are direct children of this element.
   */
  get children(): ChildNode[] {
    return Array.from(this._delegate.childNodes);
  }

  get childElements(): MutableElement[] {
    return Array.from(this._delegate.children).map(e => new MutableElement(e));
  }

  public getFirst(condition: string | ChildPredicate): ChildNode | undefined {
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

  /**
   * Persist changes in DOM applied to this element.
   */
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
    // TODO[cke]: To be continued............. we need to change the element's namespace at minimum!
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

  private persistAttributes(): true | Element {
    const attributeNames = Object.keys(this._attributes);
    if (attributeNames.indexOf("xmlns") >= 0) {
      // We cannot just set attributes. We need to create a new element with
      // the given namespace.
      return this.persistReplaceBy(this._delegate.tagName.toLowerCase(), this._attributes["xmlns"]);
    }
    attributeNames.forEach((key: string) => {
      const value: AttributeValue = this._attributes[key];
      if (value === null) {
        this._delegate.removeAttribute(key);
      } else {
        this._delegate.setAttribute(key, value);
      }
    });
    return true;
  }

  private persistDeletion(): false {
    this._delegate.parentNode?.removeChild(this._delegate);
    return false;
  }

  private persistReplaceByChildren(): ChildNode | false {
    const parentNode = this._delegate.parentNode;
    if (!parentNode) {
      // Cannot apply. Assume, that the element shall just vanish.
      return false;
    }
    const childrenToMove = this._delegate.childNodes;
    let firstChild: ChildNode | null = null;
    while (childrenToMove.length > 0) {
      const child = childrenToMove[0];
      // Will also remove it from original parent.
      parentNode.insertBefore(child, this._delegate);
      if (!firstChild) {
        firstChild = child;
      }
    }
    parentNode.removeChild(this._delegate);
    return firstChild || false;
  }

  private persistReplaceBy(newName: string, namespace?: string | null): Element {
    if (!namespace && !!this.attributes["xmlns"]) {
      return this.persistReplaceBy(newName, this.attributes["xmlns"]);
    }
    let newElement: Element;
    if (namespace) {
      newElement = this._delegate.ownerDocument.createElementNS(namespace, newName);
    } else {
      newElement = this._delegate.ownerDocument.createElement(newName);
    }
    this.replaceByElement(newElement);
    return newElement;
  }

  private replaceByElement(newElement: Element): void {
    const attributesToCopy = this.attributes;
    Object.keys(attributesToCopy)
      // Must not set namespace as attribute.
      .filter((key) => key !== "xmlns")
      .forEach((key: string) => {
        const value = attributesToCopy[key];
        if (value !== null) {
          newElement.setAttribute(key, value);
        }
      });

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
