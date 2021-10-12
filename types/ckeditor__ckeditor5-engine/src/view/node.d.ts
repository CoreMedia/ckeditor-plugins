/**
 * Abstract view node class.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_node-Node.html">Class Node (engine/view/node~Node) - CKEditor 5 API docs</a>
 */
export default class Node {
  is(type: string, name?: string): boolean;
}
