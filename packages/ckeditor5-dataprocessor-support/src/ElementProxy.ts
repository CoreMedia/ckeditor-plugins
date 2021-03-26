import { DEFAULT_NAMESPACES, Namespaces } from "./Namespace";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import NodeProxy, { PersistResponse, RESPONSE_CONTINUE } from "./NodeProxy";

/**
 * A wrapper for a given element, which allows to store changes to be applied
 * to the DOM structure later on.
 */
export default class ElementProxy extends NodeProxy<Element> implements ElementFilterParams {
  /**
   * Signals either a possibly new name for this element, or that the name
   * should not be changed (which is `undefined`).
   * @private
   */
  private _name: string | undefined = undefined;
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

  /**
   * <p>
   * Represents the editor instance. May be used to access configuration options
   * for example.
   * </p>
   * <p>
   * Mimics `ElementFilterParams`, which helps dealing with rule processing.
   * </p>
   */
  public readonly editor: Editor;
  /**
   * <p>
   * Represents the node instance. For `ElementProxy` this is just the
   * proxy class itself.
   * </p>
   * <p>
   * Mimics `ElementFilterParams`, which helps dealing with rule processing.
   * </p>
   */
  public readonly node: ElementProxy = this;
  /**
   * <p>
   * Represents the parent rule. No-Operation rule for `ElementProxy`.
   * </p>
   * <p>
   * Mimics `ElementFilterParams`, which helps dealing with rule processing.
   * </p>
   */
  public readonly parentRule: ElementFilterRule = () => {
  };

  /**
   * Constructor.
   *
   * @param delegate the original element to wrap
   * @param editor CKEditor instance
   * @param namespaces the namespaces to take into account
   * @param mutable signals, if this proxy should be mutable; trying to modify
   * an immutable proxy will raise an error.
   */
  constructor(delegate: Element, editor: Editor, namespaces: Namespaces = DEFAULT_NAMESPACES, mutable: boolean = true) {
    super(delegate, mutable);
    this._namespaces = namespaces;
    this.editor = editor;
  }

  /**
   * Access owner document.
   */
  // Override, as we know, that it is non-null here.
  get ownerDocument(): Document {
    return this.delegate.ownerDocument;
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
        rule(this);

        const response = this.persistToDom();
        if (response.restartFrom) {
          // Implies (or should imply) response.abort === true
          return response.restartFrom;
        }
        if (response.abort) {
          // Processing requested not to continue applying rules to this node.
          break;
        }
      }
    }
    return null;
  }

  persist(): void {
    this.persistToDom();
  }

  /**
   * Node should be kept, but may require to apply attribute changes or
   * to replace the element by a new one.
   *
   * @protected
   */
  protected persistKeepOrReplace(): PersistResponse {
    const response = super.persistKeepOrReplace();
    if (response.abort) {
      return response;
    }
    if (this.name === this.realName) {
      return this.persistAttributes();
    }
    return this.persistReplaceBy(this.name);
  }

  /**
   * Get namespace URI of current element.
   */
  public get namespaceURI(): string | null {
    return this.delegate.namespaceURI;
  }

  /**
   * <p>
   * The main purpose of this method is to persist changes to attributes.
   * Nevertheless, this method may forward to `persistReplaceBy` if either
   * a namespace change has been explicitly requested (by `xmlns` attribute)
   * or if the namespace of the current element does not match the namespace
   * of the owning document.
   * </p><p>
   * The latter one is typically the case when transforming e.g. from HTML
   * to CoreMedia RichText, where elements have the HTML namespace
   * `http://www.w3.org/1999/xhtml` and must be adapted to the corresponding
   * XML namespace.
   * </p>
   *
   * @private
   */
  private persistAttributes(): PersistResponse {
    const elementNamespaceAttribute: string | null = this._attributes["xmlns"];
    if (!!elementNamespaceAttribute) {
      // We cannot just set attributes. We need to create a new element with
      // the given namespace.
      return this.persistReplaceBy(this.realName, elementNamespaceAttribute);
    }
    /*
     * We don't have an extra namespace-attribute set during filtering.
     * Nevertheless, the namespace of this element may be different from
     * owner-document. If it is different, we need to create a new element as
     * well.
     */
    const ownerNamespaceURI = this.ownerDocument.documentElement.namespaceURI;
    if (this.namespaceURI !== ownerNamespaceURI) {
      return this.persistReplaceBy(this.realName, ownerNamespaceURI);
    }
    this.applyAttributes(this.delegate, this._attributes);
    return RESPONSE_CONTINUE;
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
        const pattern = /^(?<prefix>\w+):(?<localName>.*)$/;
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
   * Replaces the current element by a new one of given name. Will either
   * create an element of the given namespace or of the same namespace as
   * the owner document.
   *
   * @param newName new element name
   * @param namespace optional namespace URI
   * @return newly created element, for which filtering should be re-applied.
   * @private
   */
  private persistReplaceBy(newName: string, namespace?: string | null): PersistResponse {
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
    return this.restartFrom(newElement);
  }

  private replaceByElement(newElement: Element): void {
    this.applyAttributes(newElement, this.attributes);

    const childrenToMove = this.delegate.childNodes;
    while (childrenToMove.length > 0) {
      // Will also remove it from original parent.
      newElement.append(childrenToMove[0]);
    }

    const parentNode = this.delegate.parentNode;
    if (!!parentNode) {
      parentNode.replaceChild(newElement, this.delegate);
    }
  }

  /**
   * Get direct access to the delegate element.
   */
  get element(): Element {
    return this.delegate;
  }

  /**
   * Retrieve the name of the element.
   * If the name got changed, will return this changed name instead.
   */
  public get name(): string {
    return this._name || super.name;
  }

  /**
   * Set a new name for this element. Setting a name different to the original
   * name signals, that in the end the delegate element shall be replaced by
   * the new element.
   *
   * @param newName new name for the element; case does not matter.
   */
  public set name(newName: string) {
    this.requireMutable();
    this._name = newName.toLowerCase();
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
    const element: Element = this.delegate;
    const self = this;
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
              self.requireMutable();
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
              self.requireMutable();
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
        self.requireMutable();
        return Reflect.set(target, p, value);
      },
      /**
       * Deletes the property. Thus, if existing, marks it as <em>to-be-deleted</em>.
       */
      deleteProperty(target: Attributes, p: PropertyKey): boolean {
        self.requireMutable();
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
 * Named parameters to be passed to element filters. For overriding filter rules
 * a typical pattern to start with is:
 *
 * <pre>
 * params.parent && params.parent(args);
 * </pre>
 */
export interface ElementFilterParams {
  /**
   * The node to process.
   */
  readonly node: ElementProxy;

  /**
   * A parent mapping to respect (or to ignore, thus override).
   * It is required, so that it is easier to trigger a call to the
   * parent rule. Just add it as empty function, if there is no parent.
   */
  readonly parentRule: ElementFilterRule;

  /**
   * CKEditor instance, for example to access configuration.
   */
  readonly editor: Editor;
}

/**
 * Function interface: `(params: ElementFilterParams) => void`.
 */
export interface ElementFilterRule {
  (params: ElementFilterParams): void;
}
