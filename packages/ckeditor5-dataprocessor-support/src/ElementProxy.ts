/* eslint no-null/no-null: off */

import { DEFAULT_NAMESPACES, Namespaces } from "./Namespace";
import { Editor } from "ckeditor5";
import NodeProxy, { PersistResponse, RESPONSE_CONTINUE } from "./NodeProxy";

/**
 * Simulates a DOMTokenList to access the `class` attribute.
 * The class-list is backed by the proxied attributes provided
 * by the `ElementProxy`.
 */
class ClassList implements DOMTokenList {
  /**
   * For the proxy, we only need access to the attributes.
   */
  readonly #proxy: Pick<ElementProxy, "attributes">;
  /**
   * Trims the given string.
   *
   * @param v - string to trim
   */
  static readonly #trimValue = (v: string): string => v.trim();
  /**
   * Predicate to filter unique values only
   *
   * @param v - current value
   * @param i - current index
   * @param a - all array values
   */
  static readonly #uniqueValuesOnly = (v: string, i: number, a: string[]) => a.indexOf(v) === i;

  /**
   * Creates a `DOMTokenList` providing access to the `class` attribute
   * of the given proxy.
   *
   * @param proxy - proxy to forward `class` attribute adaptions to
   */
  constructor(proxy: ElementProxy) {
    this.#proxy = proxy;
  }

  /**
   * This simulates at best-effort some scenarios, where tokens are considered
   * invalid. The concrete behavior, especially the exception type is
   * browser-specific. In here we decided for `DOMException` to throw, as it
   * is done by Chrome, for example.
   *
   * @param tokens - tokens to validate
   * @throws DOMException on any mismatched token
   */
  #validate(...tokens: string[]): void {
    const toValidate: string[] = ([] as string[]).concat(tokens || []);
    toValidate.forEach((v) => {
      if (!v) {
        throw new DOMException("The token provided must not be empty.");
      }
      if (/\s/.test(v)) {
        throw new DOMException(
          `${toValidate.length > 1 ? "A" : "The"} provided token ('${v}') contains invalid characters.`,
        );
      }
    });
  }

  /**
   * Returns the current `class` value. Empty string will be returned, if unset.
   */
  get value(): string {
    return this.#proxy.attributes.class ?? "";
  }

  /**
   * Sets or deletes the `class` attribute value. No normalization is applied.
   * An empty string will trigger deletion of the attribute.
   *
   * @param value - `class` value to set; empty string to remove attribute
   * @throws Error when proxy is immutable
   */
  set value(value: string) {
    if (!value) {
      delete this.#proxy.attributes.class;
    } else {
      this.#proxy.attributes.class = value;
    }
  }

  /**
   * Returns the list of classes set. Entries are trimmed. An empty list is
   * returned, if the value is now empty (trimmed value).
   */
  get #classes(): string[] {
    const raw = this.value;
    if (!raw?.trim()) {
      return [];
    }
    // .filter(String) removes empty entries
    return raw.split(/\s+/).filter(String);
  }

  /**
   * Sets the classes as space-separated value. No normalization applied.
   *
   * @param values - class values to set.
   * @throws Error when proxy is immutable
   */
  set #classes(values: string[]) {
    this.value = values.join(" ");
  }

  /**
   * Sets the classes as space-separated value. Some normalizations are applied:
   * classes will be trimmed and duplicated values will be removed.
   *
   * @param values - class values to set.
   * @throws Error when proxy is immutable
   */
  set #possiblyDirtyClasses(values: string[]) {
    const trimValue = ClassList.#trimValue;
    const uniqueValuesOnly = ClassList.#uniqueValuesOnly;
    this.#classes = values.map(trimValue).filter(uniqueValuesOnly);
  }

  /**
   * Adds the given class values.
   * Values will be normalized (trimmed, duplicates and empty removed).
   * Normalization will be triggered for resulting `class` value as well.
   *
   * @param values - class values to add.
   * @throws Error when proxy is immutable
   */
  add(...values: string[]): void {
    this.#validate(...values);
    const raw: Set<string> = new Set<string>(this.#classes);
    const addValue = (v: string): unknown => !!v && raw.add(v);
    values.forEach(addValue);
    this.#classes = [...raw];
  }

  /**
   * Removes the given class values.
   * Values will be normalized (trimmed, duplicates and empty removed).
   * Normalization will be triggered for resulting `class` value as well.
   *
   * @param values - class values to remove.
   * @throws Error when proxy is immutable
   */
  remove(...values: string[]): void {
    this.#validate(...values);
    const raw: Set<string> = new Set<string>(this.#classes);
    const deleteValue = (v: string): boolean => raw.delete(v);
    values.forEach(deleteValue);
    this.#classes = [...raw];
  }

  /**
   * Replaces the given class value.
   * Both value parameters will be normalized (trimmed).
   * Normalization will be triggered for resulting `class` value as well.
   *
   * @param oldValue - value to replace.
   * @param newValue - value to replace by.
   * @throws Error when proxy is immutable
   */
  replace(oldValue: string, newValue: string): boolean {
    this.#validate(oldValue, newValue);
    // We first need to ensure unique values.
    const raw = [...new Set<string>(this.#classes)];
    const valuePosition = raw.indexOf(oldValue);
    if (valuePosition < 0) {
      return false;
    }
    raw[valuePosition] = newValue;
    // We may have duplicates, thus, trigger clean-up.
    this.#possiblyDirtyClasses = raw;
    return true;
  }

  /**
   * Toggles the given class, thus, removes it when set, and adds
   * it when unset.
   *
   * @param value - class to toggle
   * @param force - `undefined` to always toggle, `true` to only add if missing, `false` to only remove if set
   */
  toggle(value: string, force?: boolean): boolean {
    this.#validate(value);
    // We first need to ensure unique values.
    const raw = [...new Set<string>(this.#classes)];
    const valuePosition = raw.indexOf(value);
    const doAdd = force === undefined || force;
    const doRemove = force === undefined || !force;
    if (valuePosition < 0) {
      if (doAdd) {
        this.add(value);
        return true;
      }
      return false;
    }
    if (doRemove) {
      this.remove(value);
      return false;
    }
    return true;
  }

  [Symbol.iterator](): IterableIterator<string> {
    return this.#classes[Symbol.iterator]();
  }

  /**
   * @inheritDoc DOMTokenList.contains
   */
  contains(token: string): boolean {
    return this.#classes.includes(token.trim());
  }

  /**
   * @inheritDoc DOMTokenList.entries
   */
  entries(): IterableIterator<[number, string]> {
    return this.#classes.entries();
  }

  /**
   * @inheritDoc DOMTokenList.forEach
   */
  forEach(callback: (value: string, key: number, parent: DOMTokenList) => void, thisArg: never): void {
    this.#classes.forEach((value: string, index: number): void => {
      callback.call(thisArg, value, index, this);
    });
  }

  /**
   * @inheritDoc DOMTokenList.item
   */
  item(index: number): string | null {
    const raw = this.#classes;
    if (index >= raw.length) {
      return null;
    }
    return raw[index];
  }

  /**
   * @inheritDoc DOMTokenList.keys
   */
  keys(): IterableIterator<number> {
    return this.#classes.keys();
  }

  /**
   * @inheritDoc DOMTokenList.supports
   */
  supports(): boolean {
    // This is what for example Chrome responds for class lists.
    throw new TypeError("DOMTokenList has no supported tokens.");
  }

  /**
   * @inheritDoc DOMTokenList.length
   */
  get length(): number {
    return this.#classes.length;
  }

  /**
   * @inheritDoc DOMTokenList.values
   */
  values(): IterableIterator<string> {
    return this.#classes.values();
  }

  toString(): string {
    return this.value;
  }

  [index: number]: string;
}

/**
 * A wrapper for a given element, which allows storing changes to be applied
 * to the DOM structure later on.
 */
class ElementProxy extends NodeProxy<Element> implements ElementFilterParams {
  /**
   * During processing, we may change our identity. This overrides the previous
   * delegate.
   */
  #replacement: Element | undefined = undefined;

  /**
   * Signals either a possibly new name for this element, or that the name
   * should not be changed (which is `undefined`).
   */
  #name: string | undefined = undefined;
  /**
   * Overrides for attribute values.
   */
  readonly #attributes: AttributeMap = {};
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
   */
  readonly #namespaces: Namespaces;

  /**
   * A mutable list of classes applied to the element.
   */
  public readonly classList: DOMTokenList = new ClassList(this);

  /**
   * Represents the editor instance. May be used to access configuration options
   * for example.
   *
   * Mimics `ElementFilterParams`, which helps to deal with rule processing.
   */
  readonly #editor: Editor;
  /**
   * Represents the node instance. For `ElementProxy` this is just the
   * proxy class itself.
   *
   * Mimics `ElementFilterParams`, which helps to deal with rule processing.
   */
  public readonly node: ElementProxy = this;
  /**
   * Represents the parent rule. No-Operation rule for `ElementProxy`.
   *
   * Mimics `ElementFilterParams`, which helps to deal with rule processing.
   */
  public readonly parentRule: ElementFilterRule = () => undefined;

  /**
   * Constructor.
   *
   * @param delegate - the original element to wrap
   * @param editor - CKEditor instance
   * @param namespaces - the namespaces to take into account
   * @param mutable - signals, if this proxy should be mutable; trying to modify
   * an immutable proxy will raise an error.
   */
  constructor(delegate: Element, editor: Editor, namespaces: Namespaces = DEFAULT_NAMESPACES, mutable = true) {
    super(delegate, mutable);
    this.#namespaces = namespaces;
    this.#editor = editor;
  }

  /**
   * This provides a light-weight proxy, which is unaware of the editor.
   * It is meant for testing purpose only, thus, not recommended for production
   * use, as filters may rely on the `editor` property being set.
   *
   * @param delegate - the original element to wrap
   */
  static instantiateForTest(delegate: Element): ElementProxy {
    return new ElementProxy(delegate, {} as Editor);
  }

  /**
   * Represents the editor instance. May be used to access configuration options
   * for example.
   *
   * Mimics `ElementFilterParams`, which helps to deal with rule processing.
   */
  get editor(): Editor {
    if (!this.#editor) {
      // Should always be set in production use as filters may rely on it.
      throw new Error("'editor' unset.");
    }
    return this.#editor;
  }

  /**
   * @inheritDoc NodeProxy.delegate
   */
  override get delegate(): Element {
    return this.#replacement ?? super.delegate;
  }

  /**
   * Access owner document.
   */
  // Override, as we know, that it is non-null here.
  override get ownerDocument(): Document {
    return this.delegate.ownerDocument;
  }

  /**
   * Apply given rules. If any of the rules will invalidate this element either
   * by deletion, no further rules will be applied.
   *
   * @param rules - rules to apply in given order
   * @returns a node, if filtering should be continued from this node; `null` for default as next node.
   */
  applyRules(...rules: (ElementFilterRule | undefined)[]): Node | null {
    let result: Node | null = null;
    for (const rule of rules) {
      if (rule) {
        rule(this);
        const response = this.persistToDom();
        if (response.continueWith) {
          result = response.continueWith || result;
        }
        if (response.abort) {
          // Processing requested not to continue applying rules to this node.
          break;
        }
      }
    }
    return result;
  }

  /**
   * Node should be kept, but may require applying attribute changes or
   * to replace the element by a new one.
   *
   */
  protected override persistKeepOrReplace(): PersistResponse {
    const response = super.persistKeepOrReplace();
    if (response.abort) {
      return response;
    }
    if (this.name === this.realName) {
      return this.#persistAttributes();
    }
    return this.#persistReplaceBy(this.name);
  }

  /**
   * Get namespace URI of current element.
   */
  public get namespaceURI(): string | null {
    return this.delegate.namespaceURI;
  }

  /**
   * The main purpose of this method is to persist changes to attributes.
   * Nevertheless, this method may forward to `persistReplaceBy` if either
   * a namespace change has been explicitly requested (by `xmlns` attribute)
   * or if the namespace of the current element does not match the namespace
   * of the owning document.
   *
   * The latter one is typically the case when transforming e.g., from HTML
   * to CoreMedia RichText, where elements have the HTML namespace
   * `http://www.w3.org/1999/xhtml` and must be adapted to the corresponding
   * XML namespace.
   *
   */
  #persistAttributes(): PersistResponse {
    const elementNamespaceAttribute: string | null = this.#attributes.xmlns;
    if (elementNamespaceAttribute) {
      // We cannot just set attributes. We need to create a new element with
      // the given namespace.
      return this.#persistReplaceBy(this.realName, elementNamespaceAttribute);
    }
    /*
     * We don't have an extra namespace-attribute set during filtering.
     * Nevertheless, the namespace of this element may be different from
     * owner-document. If it is different, we need to create a new element as
     * well.
     */
    const ownerNamespaceURI = this.ownerDocument.documentElement.namespaceURI;
    if (this.namespaceURI !== ownerNamespaceURI) {
      return this.#persistReplaceBy(this.realName, ownerNamespaceURI);
    }
    this.#applyAttributes(this.delegate, this.#attributes);
    return RESPONSE_CONTINUE;
  }

  /**
   * Applies the given attributes to the given element. This mapping ignores
   * a possibly given `xmlns` attribute, as it must be handled separately
   * (by creating a new element with given namespace).
   *
   * @param targetElement - the element to apply attributes to
   * @param attributes - set of attributes to apply
   */
  #applyAttributes(targetElement: Element, attributes: AttributeMap): void {
    const ownerDocument = targetElement.ownerDocument;
    const attributeNames = Object.keys(attributes);
    const handleAttributeWithoutNamespacePrefix = (key: string, value: string | null) => {
      if (value === null) {
        targetElement.removeAttributeNS(null, key);
      } else {
        targetElement.setAttributeNS(null, key, value);
      }
    };
    const handleAttributeWithNamespacePrefix = (
      uri: string | undefined,
      prefix: string,
      key: string,
      value: string | null,
    ) => {
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
          ownerDocument.documentElement.setAttributeNS(DEFAULT_NAMESPACES.xmlns.uri, `xmlns:${prefix}`, uri);
        } else {
          targetElement.setAttribute(key, value);
        }
      }
    };
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
          const uri = this.#namespaces[prefix]?.uri;
          handleAttributeWithNamespacePrefix(uri, prefix, key, value);
        }
      });
  }

  /**
   * Replaces the current element by a new one of given name. Will either
   * create an element of the given namespace or of the same namespace as
   * the owner document.
   *
   * @param newName - new element name
   * @param namespace - optional namespace URI
   * @returns newly created element, for which filtering should be re-applied.
   */
  #persistReplaceBy(newName: string, namespace?: string | null): PersistResponse {
    if (!namespace && !!this.attributes.xmlns) {
      return this.#persistReplaceBy(newName, this.attributes.xmlns);
    }
    let newElement: Element;
    const ownerDocument = this.ownerDocument;
    if (namespace) {
      newElement = ownerDocument.createElementNS(namespace, newName);
    } else {
      newElement = ownerDocument.createElementNS(ownerDocument.documentElement.namespaceURI, newName);
    }
    const isRenamed = this.realName !== newName;
    this.#replaceByElement(newElement);
    if (isRenamed) {
      /*
       * Re-Processing recommended as we have a new element name
       * -------------------------------------------------------
       *
       * If we changed for example from `<u>` to `<span class="underline">` we
       * should also apply additional rules for `<span/>`. Otherwise, we would
       * require repeating any attribute mappings.
       *
       * Example: We map `lang` attribute in data view to `xml:lang` in data and
       * vice versa. With restart, we don't need to specify it for `<u>` mapping.
       * It will just _naturally_ inherit from handling in `<span>`.
       *
       * This re-processing was part of CKEditor 4 data-processing, and it eases
       * extending data-processing a lot. Think of a new HTML element to be
       * mapped to `<span>` just with a different identifying class attribute.
       * As for example `<mark>` to `<span class="mark">`. Without re-processing
       * the extension needs to now of all attribute mappers applicable for
       * `<span>` and apply them, too. With re-processing only renaming from
       * `<mark>` to `<span>` and adding a class-attribute is all, what is
       * required to do.
       *
       * Additionally we need to abort further processing of child-rules, as
       * it would cause duplicate processing of children (such as text-nodes
       * where entities may be encoded twice).
       */
      return this.restartFrom(newElement);
    }

    // If just our namespace changed, there is no need to trigger
    // processing again for this element.
    return this.continueFrom(newElement.nextSibling);
  }

  #replaceByElement(newElement: Element): void {
    this.#applyAttributes(newElement, this.attributes);
    const childrenToMove = this.delegate.childNodes;
    while (childrenToMove.length > 0) {
      // Will also remove it from original parent.
      newElement.append(childrenToMove[0]);
    }
    const parentNode = this.delegate.parentNode;
    if (parentNode) {
      parentNode.replaceChild(newElement, this.delegate);
    }
    this.#replacement = newElement;
  }

  /**
   * Get direct access to the delegate element.
   */
  public get element(): Element {
    return this.delegate;
  }

  /**
   * Retrieve the name of the element.
   * If the name got changed, will return this changed name instead.
   */
  public override get name(): string {
    return this.#name ?? super.name;
  }

  /**
   * Set a new name for this element. Setting a name different to the original
   * name signals, that in the end the delegate element shall be replaced by
   * the new element.
   *
   * @param newName - new name for the element; case does not matter.
   */
  public override set name(newName: string) {
    this.requireMutable();
    this.#name = newName.toLowerCase();
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
  public get attributes(): AttributeMap {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Proxy(this.#attributes, {
      defineProperty(target: AttributeMap, p: PropertyKey, attributes: PropertyDescriptor): boolean {
        return Reflect.defineProperty(target, p, attributes);
      },
      /**
       * Retrieves the current attribute value. It is either the overwritten
       * value, or, if not overwritten, the original value.
       */
      get(target: AttributeMap, attrName: PropertyKey, receiver: never): AttributeValue {
        if (Reflect.has(target, attrName)) {
          return Reflect.get(target, attrName, receiver) as AttributeValue;
        }
        if (typeof attrName === "string") {
          return self.delegate.getAttribute(attrName);
        }
        // Should be unreachable as we only support attributes keyed by strings.
        return null;
      },
      /**
       * Gets the property descriptor for the given property. This is
       * especially used, when looping over the attributes and accessing
       * and/or modifying them.
       */
      getOwnPropertyDescriptor(target: AttributeMap, attrName: PropertyKey): PropertyDescriptor | undefined {
        // Handle, if this is the overwritten state.
        if (Reflect.has(target, attrName)) {
          const value: unknown = Reflect.get(target, attrName);
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
        if (typeof attrName === "string" && self.delegate.hasAttribute(attrName)) {
          return {
            configurable: true,
            enumerable: true,
            get(): string | null {
              return self.delegate.getAttribute(attrName);
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
      set(target: AttributeMap, p: PropertyKey, value: unknown): boolean {
        self.requireMutable();
        return Reflect.set(target, p, value);
      },
      /**
       * Deletes the property. Thus, if existing, marks it as <em>to-be-deleted</em>.
       */
      deleteProperty(target: AttributeMap, p: PropertyKey): boolean {
        self.requireMutable();
        return Reflect.set(target, p, null);
      },
      /**
       * Signals, if this property is available. Excludes any previously
       * deleted properties.
       */
      has(target: AttributeMap, p: PropertyKey): boolean {
        if (Reflect.has(target, p)) {
          return Reflect.get(target, p) !== null;
        }
        if (typeof p === "string") {
          return self.delegate.hasAttribute(p);
        }
        // Should be unreachable as we only support attributes keyed by strings.
        return false;
      },
      /**
       * Provides all existing attributes names, skipping those, which got
       * marked for deletion.
       */
      ownKeys(target: AttributeMap): OwnPropertyKey[] {
        const targetKeys: OwnPropertyKey[] = Reflect.ownKeys(target);
        const elementAttrs: OwnPropertyKey[] = self.delegate.getAttributeNames();
        // Join distinct keys, skip forcibly deleted.
        return elementAttrs
          .concat(targetKeys.filter((k: OwnPropertyKey) => !elementAttrs.includes(k)))
          .filter((k: OwnPropertyKey) => !Reflect.has(target, k) || Reflect.get(target, k) !== undefined);
      },
    });
  }
}

type OwnPropertyKey = string | symbol;

/**
 * Possible attribute values to assign. `null` represents a deleted property.
 */
type AttributeValue = string | null;

/**
 * The attributes of an element.
 */
type AttributeMap = Record<string, AttributeValue>;

/**
 * Named parameters to be passed to element filters. For overriding filter rules
 * a typical pattern to start with is:
 *
 * ```
 * params.parent && params.parent(args);
 * ```
 */
interface ElementFilterParams {
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
type ElementFilterRule = (params: ElementFilterParams) => void;

/**
 * Combines all filter rules into one.
 *
 * @param rules - rules to combine
 * @returns rule, which combines all passed rules into one
 */
const allFilterRules =
  (...rules: ElementFilterRule[]): ElementFilterRule =>
  (params) =>
    rules.forEach((r) => r(params));
export default ElementProxy;
export { AttributeValue, AttributeMap, ElementFilterParams, ElementFilterRule, allFilterRules };
