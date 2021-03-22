import NodeProxy, { PersistResponse } from "./NodeProxy";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

/**
 * Proxy to manipulate text nodes. General contract is, that all modifications
 * are temporary, until you decide to persist the changes. Note, that a persisted
 * proxy should not be re-used as it may cause unexpected results or may even
 * fail.
 */
export default class TextProxy extends NodeProxy<Text> implements TextFilterParams {
  /**
   * Helper element for decoding entities.
   * @private
   */
  private readonly decodeElement = document.createElement("div");
  /**
   * Possibly overridden text.
   * @private
   */
  private _text: string | undefined;

  public readonly editor: Editor;
  public readonly node: TextProxy = this;
  public readonly parentRule: TextFilterRule = () => {
  };

  constructor(delegate: Text, editor: Editor, mutable: boolean = true) {
    super(delegate, mutable);
    this.editor = editor;
  }

  public applyRules(...rules: (TextFilterRule | undefined)[]): Node | null {
    for (const rule of rules) {
      if (!!rule) {
        rule(this);
      }

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
    return null;
  }

  /**
   * Access owner document.
   */
  // Override, as we know, that it is non-null here.
  get ownerDocument(): Document {
    return this.delegate.ownerDocument;
  }

  /**
   * Gets the text content, which may be overridden.
   */
  public get textContent(): string {
    return this._text || this.delegate.textContent || "";
  }

  /**
   * Sets the text content. Only allowed in mutable state.
   * @param value text content to set.
   */
  public set textContent(value: string) {
    this.requireMutable();
    this._text = value;
  }

  /**
   * Decodes all HTML entities within this text node. This helps to ensure, that
   * we don't store entities unsupported by the current grammar.
   *
   * @see <a href="https://stackoverflow.com/questions/5796718/html-entity-decode">javascript - HTML Entity Decode - Stack Overflow</a>
   */
  public decodeHtmlEntities(): void {
    this.decodeElement.innerHTML = this.textContent;
    const newText = this.decodeElement.textContent;
    this.decodeElement.innerHTML = "";

    // Prevent possible cycles, if re-applying rules because of a recreated
    // text node.
    if (newText !== this.textContent) {
      this._text = newText || "";
    }
  }

  /**
   * For kept text-nodes it possibly sets changed text.
   * @protected
   */
  protected persistKeepOrReplace(): PersistResponse {
    const response = super.persistKeepOrReplace();
    if (!response.abort && this._text !== undefined) {
      this.delegate.textContent = this.textContent;
    }
    return response;
  }
}

/**
 * Named parameters to be passed to element filters. For overriding filter rules
 * a typical pattern to start with is:
 *
 * <pre>
 * params.parent && params.parent(args);
 * </pre>
 */
export interface TextFilterParams {
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
export interface TextFilterRule {
  (params: TextFilterParams): void;
}
