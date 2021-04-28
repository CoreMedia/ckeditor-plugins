import Node from './node';

/**
 * Model text node.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_text-Text.html">Class Text (engine/model/text~Text) - CKEditor 5 API docs</a>
 */
export default class Text extends Node {
  get data(): string;

  is(type: string): boolean;

  static fromJSON(json: Object): Text;
}
