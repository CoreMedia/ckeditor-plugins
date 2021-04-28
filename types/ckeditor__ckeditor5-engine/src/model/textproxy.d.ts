import DocumentFragment from "./documentfragment";
import Element from "./element";
import Text from "./text";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_textproxy-TextProxy.html">Class TextProxy (engine/model/textproxy~TextProxy) - CKEditor 5 API docs</a>
 */
export default class TextProxy {
  get data(): string;

  get endOffset(): number;

  get isPartial(): boolean;

  get offsetInText(): number;

  get offsetSize(): number;

  get parent(): Element | DocumentFragment | null;

  get root(): Element | DocumentFragment;

  get startOffset(): number;

  get textNode(): Text;

  getAncestors(options?: {
    includeSelf: boolean;
    parentFirst: boolean;
  }): any[];

  getAttribute(key: string): any | undefined;

  getAttributeKeys(): Iterable<string>;

  getAttributes(): Iterable<any>;

  getPath(): number[];

  hasAttribute(key: string): false;

  is(type: string): boolean;
}
