import ViewNode from "./node"

/**
 * Tree view text node.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_text-Text.html">Class Text (engine/view/text~Text) - CKEditor 5 API docs</a>
 */
export default class Text extends ViewNode {
  // TODO[cke] This is a protected field! Do we really need to use it?
  _textData: string;
}
