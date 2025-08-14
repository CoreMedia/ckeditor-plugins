import { NodeProxy, PersistResponse } from "./NodeProxy";
import { Editor } from "ckeditor5";

/**
 * Proxy to manipulate text nodes. General contract is, that all modifications
 * are temporary, until you decide to persist the changes. Note, that a persisted
 * proxy should not be re-used as it may cause unexpected results or may even
 * fail.
 */
class TextProxy extends NodeProxy<Text> implements TextFilterParams {
  /**
   * Possibly overridden text.
   */
  #text: string | undefined;

  /**
   * Represents the editor instance. May be used to access configuration options
   * for example.
   *
   * Mimics `TextFilterParams`, which helps to deal with rule processing.
   */
  public readonly editor: Editor;
  /**
   * Represents the node instance. For `TextProxy` this is just the
   * proxy class itself.
   *
   * Mimics `TextFilterParams`, which helps to deal with rule processing.
   */
  public readonly node: TextProxy = this;
  /**
   * Represents the parent rule. No-Operation rule for `TextProxy`.
   *
   * Mimics `TextFilterParams`, which helps to deal with rule processing.
   */
  public readonly parentRule: TextFilterRule = () => undefined;

  /**
   * Constructor.
   *
   * @param delegate - the original text node to wrap
   * @param editor - CKEditor instance
   * @param mutable - signals, if this proxy should be mutable; trying to modify
   * an immutable proxy will raise an error.
   */
  constructor(delegate: Text, editor: Editor, mutable = true) {
    super(delegate, mutable);
    this.editor = editor;
  }

  /**
   * Apply given rules. If any of the rules will invalidate this node either
   * by deletion or by replacing it, no further rules will be applied.
   *
   * @param rules - rules to apply in given order
   * @returns a node, if filtering should be restarted from this node; `null` otherwise.
   */
  public applyRules(...rules: (TextFilterRule | undefined)[]): Node | null {
    for (const rule of rules) {
      if (rule) {
        rule(this);
      }
      const response = this.persistToDom();
      if (response.continueWith) {
        // Implies (or should imply) response.abort === true
        return response.continueWith;
      }
      if (response.abort) {
        // Processing requested not to continue applying rules to this node.
        break;
      }
    }
    return null;
  }

  /**
   * Access owner document.
   */
  // Override, as we know, that it is non-null here.
  public override get ownerDocument(): Document {
    return this.delegate.ownerDocument;
  }

  /**
   * Gets the text content, which may be overridden.
   */
  public get textContent(): string {
    return this.#text ?? this.delegate.textContent ?? "";
  }

  /**
   * Sets the text content. Only allowed in mutable state.
   *
   * @param value - text content to set.
   */
  public set textContent(value: string) {
    this.requireMutable();
    this.#text = value;
  }

  /**
   * For kept text-nodes it possibly sets changed text.
   */
  protected override persistKeepOrReplace(): PersistResponse {
    const response = super.persistKeepOrReplace();
    if (!response.abort && this.#text !== undefined) {
      this.delegate.textContent = this.textContent;
    }
    return response;
  }
}

/**
 * Named parameters to be passed to element filters. For overriding filter rules
 * a typical pattern to start with is:
 *
 * ```
 * params.parent && params.parent(args);
 * ```
 */
interface TextFilterParams {
  /**
   * The node to process.
   */
  readonly node: TextProxy;

  /**
   * A parent mapping to respect (or to ignore, thus override).
   * It is required, so that it is easier to trigger a call to the
   * parent rule. Just add it as empty function, if there is no parent.
   */
  readonly parentRule: TextFilterRule;

  /**
   * CKEditor instance, for example to access configuration.
   */
  readonly editor: Editor;
}

/**
 * Function interface: `(params: TextFilterParams) => void`.
 */
type TextFilterRule = (params: TextFilterParams) => void;

export { TextFilterParams, TextFilterRule, TextProxy };
