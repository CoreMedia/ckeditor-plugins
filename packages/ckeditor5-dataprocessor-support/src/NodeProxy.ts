/**
 * A wrapper for DOM nodes, to store changes to be applied to the DOM structure
 * later on.
 */
class NodeProxy<N extends Node = Node> {
  readonly #delegate: N;
  /**
   * Flag to signal if this instance is meant to be mutable. Typically, you
   * don't want to make nested instances to be mutable, as the framework will
   * not take care of persisting possibly applied changes.
   */
  readonly #mutable: boolean;
  /**
   * Represents the state the node should take when persisting to DOM.
   */
  #state: NodeState = NodeState.KEEP_OR_REPLACE;

  /**
   * Constructor.
   *
   * @param delegate - delegate to wrap
   * @param mutable - signals, if this representation is mutable or not
   */
  constructor(delegate: N, mutable = true) {
    this.#delegate = delegate;
    this.#mutable = mutable;
  }

  /**
   * Wraps the given node into a NodeProxy. If the node is falsy, `null`
   * will be returned.
   *
   * @param node - node to wrap
   * @param mutable - signals, if this representation is mutable or not
   * @returns NodeProxy for given node; `null` for falsy values
   */
  public static proxy<T extends Node>(node: T | undefined | null, mutable = true): NodeProxy<T> | null {
    if (node) {
      return new NodeProxy(node, mutable);
    }
    return null;
  }

  /**
   * Gets the state to reach when persisting this node to the DOM.
   */
  public get state(): NodeState {
    return this.#state;
  }

  /**
   * Signals, if this element is mutable.
   */
  public get mutable(): boolean {
    return this.#mutable;
  }

  /**
   * Will raise an error, if this element is not mutable.
   */
  protected requireMutable(): void {
    if (!this.mutable) {
      throw new Error("Instance is immutable.");
    }
  }

  /**
   * Returns the wrapped delegate.
   *
   * This delegate should not be used for directly manipulating the DOM, as
   * nested rules may not veto applied changes.
   *
   * If a manipulation is done, it must be ensured, that previously run rules
   * on this node may be rerun. It is generally considered safe to do manipulation
   * to child elements, as these are processed after this node, so that
   * all applicable rules have a chance to modify these nodes again.
   */
  public get delegate(): N {
    return this.#delegate;
  }

  /**
   * Access owner document.
   */
  public get ownerDocument(): Document | null {
    return this.delegate.ownerDocument;
  }

  /**
   * Access to the parent node of this node.
   */
  public get parentNode(): NodeProxy<Node & ParentNode> | null {
    return NodeProxy.proxy<Node & ParentNode>(this.delegate.parentNode, false);
  }

  /**
   * Access to the parent element of this node.
   */
  public get parentElement(): NodeProxy<HTMLElement> | null {
    return NodeProxy.proxy<HTMLElement>(this.delegate.parentElement, false);
  }

  /**
   * Retrieves the name of the node (lower case).
   */
  public get name(): string {
    return this.delegate.nodeName.toLowerCase();
  }

  /**
   * Retrieves the name of the node (lower case).
   * If renaming is supported by this instance, it may differ from
   * `name`, otherwise, it is the same.
   */
  public get realName(): string {
    return this.delegate.nodeName.toLowerCase();
  }

  /**
   * Signals, if this is the only child node at parent node.
   */
  public get singleton(): boolean {
    return !this.delegate.nextSibling && !this.delegate.previousSibling;
  }

  /**
   * Signals, if this node is empty, thus, has no child nodes.
   *
   * @see isEmpty
   */
  public get empty(): boolean {
    return this.isEmpty();
  }

  /**
   * Signals, if this element is empty.
   *
   * @param considerChildNode - signals, if a given node shall be considered while determining empty state
   */
  public isEmpty(considerChildNode?: ChildPredicate): boolean {
    if (!considerChildNode) {
      return this.delegate.childNodes.length === 0;
    }
    const consideredChildNodesLength = Array.from(this.delegate.childNodes).filter(considerChildNode).length;
    return consideredChildNodesLength === 0;
  }

  /**
   * Signals, if this is the last node in parent. Always `false` if no
   * parent exists.
   */
  public get lastNode(): boolean {
    return !this.delegate.nextSibling;
  }

  /**
   * Get first (matching) child node of the given element.
   *
   * @param condition - string: the node name to match (ignoring case), predicate:
   * the predicate to apply.
   */
  public findFirst(condition?: string | ChildPredicate): NodeProxy<ChildNode> | null {
    if (!condition) {
      return NodeProxy.proxy(this.delegate.firstChild, false);
    }
    let predicate: ChildPredicate;
    if (typeof condition === "function") {
      predicate = condition;
    } else {
      predicate = (child) => child.nodeName.toLowerCase() === condition.toLowerCase();
    }
    return NodeProxy.proxy(Array.from(this.delegate.childNodes).find(predicate, false));
  }

  /**
   * Signals, if this node is meant to be removed. This includes recursive
   * removal (including children) as well as just removing this node
   * (replacing it by its children).
   */
  public get remove(): boolean {
    return this.state !== NodeState.KEEP_OR_REPLACE;
  }

  /**
   * Signals, if this mutable element represents a state, where the element
   * shall be removed, including all its children.
   * <p>
   * It is important to note, that setting this modifies the
   * {@link NodeProxy#state}, thus setting this overrides any other decisions
   * upon the state of the node.
   * <p>
   * <strong>Duplicate Spaces:</strong> If you apply this modification, it may
   * end up having duplicate space characters in your DOM. For example if
   * removing the `<el>` element (and all its children) in this scenario:
   * <pre>
   * <parent>Lorem <el>Ipsum</el> Dolor</parent>
   * </pre>
   * you will end up having:
   * <pre>
   * <parent>Lorem  Dolor</parent>
   * </pre>
   * with two white space characters in the middle. You may want to detect such
   * states, and remove the duplicate space. You shouldn't do this, though, if
   * you are within a space preserving context such as `<pre>`.
   */
  public set remove(remove: boolean) {
    this.requireMutable();
    if (remove) {
      this.#state = NodeState.REMOVE_RECURSIVELY;
    } else {
      this.#state = NodeState.KEEP_OR_REPLACE;
    }
  }

  /**
   * Signals, if this node represents a state, where the children of the node
   * should be removed.
   */
  public get removeChildren(): boolean {
    return this.state === NodeState.REMOVE_CHILDREN;
  }

  /**
   * Sets, if this node represents a state, where the children of the node
   * shall be removed.
   * <p>
   * It is important to note, that setting this modifies the
   * {@link NodeProxy#state}, thus setting this overrides any other decisions
   * upon the state of the node.
   *
   * @param remove - `true` to mark as <em>remove children</em>; `false` otherwise.
   */
  public set removeChildren(remove: boolean) {
    this.requireMutable();
    if (remove) {
      this.#state = NodeState.REMOVE_CHILDREN;
    } else {
      this.#state = NodeState.KEEP_OR_REPLACE;
    }
  }

  /**
   * Signals, if this node represents a state, where the node
   * shall be removed, while attaching the children to the parent node.
   */
  public get replaceByChildren(): boolean {
    return this.state === NodeState.REMOVE_SELF;
  }

  /**
   * Sets, if this node represents a state, where the node
   * shall be removed, while attaching the children to the parent node.
   * <p>
   * It is important to note, that setting this modifies the
   * {@link NodeProxy#state}, thus setting this overrides any other decisions
   * upon the state of the node.
   *
   * @param replace - `true` to mark as <em>replace with children</em>; `false` otherwise.
   */
  public set replaceByChildren(replace: boolean) {
    this.requireMutable();
    if (replace) {
      this.#state = NodeState.REMOVE_SELF;
    } else {
      this.#state = NodeState.KEEP_OR_REPLACE;
    }
  }

  /**
   * Persists the applied changes to the DOM.
   */
  public persist(): void {
    this.persistToDom();
  }

  /**
   * Persists the applied changes to the DOM.
   *
   * @returns `PersistResponse` which signals, how to continue persisting other nodes
   * @internal Public only for testing purpose.
   */
  public persistToDom(): PersistResponse {
    switch (this.state) {
      case NodeState.KEEP_OR_REPLACE:
        return this.persistKeepOrReplace();
      case NodeState.REMOVE_RECURSIVELY:
        return this.persistRemoveRecursively();
      case NodeState.REMOVE_SELF:
        return this.persistRemoveSelf();
      case NodeState.REMOVE_CHILDREN:
        return this.persistRemoveChildren();
      default:
        throw new Error(`Unknown node state ${this.state}.`);
    }
  }

  /**
   * Helper function for return value, which signals to continue with
   * another node, but to do not abort current processing.
   *
   * @param node - node to continue with
   */
  protected continueFrom(node: Node | null | undefined): PersistResponse {
    return {
      ...RESPONSE_CONTINUE,
      continueWith: node ?? undefined,
    };
  }

  /**
   * Helper function for return value, which signals "restart from".
   *
   * @param node - node to restart from
   */
  protected restartFrom(node: Node | null | undefined): PersistResponse {
    return {
      ...RESPONSE_ABORT,
      continueWith: node ?? undefined,
    };
  }

  /**
   * Persists, to keep the current node. May be overwritten for example to
   * apply additional changes to the node like changing attributes of an
   * element.
   */
  protected persistKeepOrReplace(): PersistResponse {
    return RESPONSE_CONTINUE;
  }

  /**
   * Persists the deletion of this node and all its child nodes.
   */
  protected persistRemoveRecursively(): PersistResponse {
    this.delegate.parentNode?.removeChild(this.delegate);
    return RESPONSE_ABORT;
  }

  /**
   * Persists, that only the node itself shall be removed.
   * The default implementation will replace the node with its child nodes.
   */
  protected persistRemoveSelf(): PersistResponse {
    const parentNode = this.delegate.parentNode;
    if (!parentNode || this.empty) {
      // No special handling for children required; let's just remove ourselves.
      return this.persistRemoveRecursively();
    }

    const ownerDocument = this.ownerDocument;
    let firstChild: ChildNode | null;

    if (!ownerDocument) {
      firstChild = this.delegate.firstChild;

      let currentChild: ChildNode | null;
      do {
        currentChild = this.delegate.firstChild;
        currentChild && parentNode.insertBefore(currentChild, this.delegate);
      } while (currentChild);

      parentNode.removeChild(this.delegate);
    } else {
      const range = ownerDocument.createRange();
      range.selectNodeContents(this.delegate);
      const fragment = range.extractContents();
      firstChild = fragment.firstChild;

      parentNode.replaceChild(fragment, this.delegate);
    }

    return this.restartFrom(firstChild);
  }

  /**
   * Persists removal of all child nodes.
   */
  protected persistRemoveChildren(): PersistResponse {
    while (this.delegate.firstChild) {
      this.delegate.removeChild(this.delegate.firstChild);
    }

    return RESPONSE_CONTINUE;
  }

  toString(): string {
    const realNameHint = this.name === this.realName ? "" : `(was: ${this.realName})`;
    return `NodeProxy(${this.name}${realNameHint})`;
  }
}

/**
 * Signals to abort handling the current node during data processing.
 * May be enriched with the node to restart from via object destruction.
 */
const RESPONSE_ABORT = { abort: true };
/**
 * Signals, that data processing for current node should be continued.
 */
const RESPONSE_CONTINUE = { abort: false };

/**
 * Response when persisting node changes.
 */
interface PersistResponse {
  /**
   * Node to possibly continue from. Typically used, when a node got replaced.
   * `undefined` signals, that processing may just continue with next nodes.
   */
  continueWith?: Node;
  /**
   * Signals if further rules should/may be applied to this node. Typically,
   * `true`, if processing should continue with different node. `true` is
   * also returned, when the current node just got deleted, as it does not make
   * sense to continue processing this node.
   */
  abort: boolean;
}

/**
 * Predicate to select children.
 */
/**
 * <p>
 * <strong>As function declaration:</strong>
 * </p>
 * <pre>
 * `(child: ChildNode, index: number, array: ChildNode[]) => boolean`
 * </pre>
 *
 * @param child - the child node to validate
 * @param index - child node index
 * @param array - list of all sibling child nodes (including the child itself)
 */
type ChildPredicate = (child: ChildNode, index: number, array: ChildNode[]) => boolean;

/**
 * Represents the state of a given node, it should reach after persisting it
 * to the DOM.
 */
enum NodeState {
  /**
   * Keep the node or replace it at the same position.
   */
  KEEP_OR_REPLACE,
  /**
   * Remove the node and all its children.
   */
  REMOVE_RECURSIVELY,
  /**
   * Only remove the node, replacing it by its children.
   */
  REMOVE_SELF,
  /**
   * Remove all child nodes of the current node.
   */
  REMOVE_CHILDREN,
}

export type { ChildPredicate, PersistResponse };
export { NodeProxy, NodeState, RESPONSE_ABORT, RESPONSE_CONTINUE };
