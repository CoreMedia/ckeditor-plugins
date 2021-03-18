/**
 * A wrapper for DOM nodes, to store changes to be applied to the DOM structure
 * later on.
 */
export default class NodeProxy<T extends Node> {
  private readonly _delegate: T;
  /**
   * Flag to signal if this instance is meant to be mutable. Typically, you
   * don't want to make nested instances to be mutable, as the framework will
   * not take care of persisting possibly applied changes.
   *
   * @private
   */
  private readonly _mutable: boolean;
  /**
   * Represents the state the node should take when persisting to DOM.
   * @private
   */
  private _state: NodeState = NodeState.KEEP;

  /**
   * Constructor.
   * @param delegate delegate to wrap
   * @param mutable signals, if this representation is mutable or not
   */
  constructor(delegate: T, mutable: boolean = true) {
    this._delegate = delegate;
    this._mutable = mutable;
  }

  /**
   * Wraps the given node into a NodeProxy. If the node is falsy, `null`
   * will be returned.
   *
   * @param node node to wrap
   * @param mutable signals, if this representation is mutable or not
   */
  public static wrap<N extends Node>(node: N | undefined | null, mutable: boolean = true): NodeProxy<N> | null {
    if (!!node) {
      return new NodeProxy(node, mutable);
    }
    return null;
  }

  /**
   * Gets the state to reach when persisting this node to the DOM.
   */
  public get state(): NodeState {
    return this._state;
  }

  /**
   * Signals, if this element is mutable.
   */
  public get mutable(): boolean {
    return this._mutable;
  }

  /**
   * Will raise an error, if this element is not mutable.
   * @protected
   */
  protected requireMutable(): void {
    if (!this.mutable) {
      throw new Error("Instance is immutable.");
    }
  }

  /**
   * Returns the wrapped delegate.
   */
  public get delegate(): T {
    return this._delegate;
  }

  /**
   * Access owner document.
   */
  public get ownerDocument(): Document | null {
    return this.delegate.ownerDocument;
  }

  /**
   * Access to the parent node of this element.
   */
  public get parentNode(): NodeProxy<Node & ParentNode> | null {
    return NodeProxy.wrap<Node & ParentNode>(this.delegate.parentNode, false);
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
   * @param considerChildNode signals, if a given node shall be considered while determining empty state
   */
  public isEmpty(considerChildNode?: ChildPredicate): boolean {
    if (!considerChildNode) {
      return this.delegate.childNodes.length === 0;
    }
    const consideredChildNodesLength = Array.from(this.delegate.childNodes)
      .filter(considerChildNode)
      .length;
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
   * @param condition string: the node name to match (ignoring case), predicate:
   * the predicate to apply.
   */
  public findFirst(condition?: string | ChildPredicate): NodeProxy<ChildNode> | null {
    if (!condition) {
      return NodeProxy.wrap(this.delegate.firstChild, false);
    }
    let predicate: ChildPredicate;
    if (typeof condition === "function") {
      predicate = condition;
    } else {
      predicate = (child) => {
        return child.nodeName.toLowerCase() === condition.toLowerCase();
      }
    }
    return NodeProxy.wrap(Array.from(this.delegate.childNodes).find(predicate, false));
  }

  /**
   * Signals, if this node is meant to be removed. This includes recursive
   * removal (including children) as well as just removing this very node
   * (replacing it by its children).
   */
  public get remove(): boolean {
    return this.state !== NodeState.KEEP;
  }

  /**
   * Signals, if this mutable element represents a state, where the element
   * shall be removed, including all its children.
   */
  public set remove(remove: boolean) {
    this.requireMutable();
    if (remove) {
      this._state = NodeState.REMOVE_RECURSIVELY;
    } else {
      this._state = NodeState.KEEP;
    }
  }

  /**
   * Signals, if this mutable element represents a state, where the element
   * shall be removed, while attaching the children to the parent node.
   */
  public get replaceByChildren(): boolean {
    return this.state === NodeState.REMOVE_SELF;
  }

  /**
   * Sets, if this node represents a state, where the node
   * shall be removed, while attaching the children to the parent node.
   *
   * @param replace `true` to mark as <em>replace with children</em>; `false` otherwise.
   */
  public set replaceByChildren(replace: boolean) {
    this.requireMutable();
    if (replace) {
      this._state = NodeState.REMOVE_SELF;
    } else {
      this._state = NodeState.KEEP;
    }
  }
}

/**
 * Predicate to select children.
 */
export interface ChildPredicate {
  /**
   * <p>
   * <strong>As function declaration:</strong>
   * </p>
   * <pre>
   * `(child: ChildNode, index: number, array: ChildNode[]) => boolean`
   * </pre>
   * @param child the child node to validate
   * @param index child node index
   * @param array list of all sibling child nodes (including the child itself)
   */
  (child: ChildNode, index: number, array: ChildNode[]): boolean;
}

/**
 * Represents the state of a given node, it should reach after persisting it
 * to the DOM.
 */
export enum NodeState {
  /**
   * Keep the node.
   */
  KEEP,
  /**
   * Remove the node and all its children.
   */
  REMOVE_RECURSIVELY,
  /**
   * Only remove the node, replacing it by its children.
   */
  REMOVE_SELF
}
