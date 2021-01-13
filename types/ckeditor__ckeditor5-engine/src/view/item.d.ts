import ViewNode from "./node"
import TextProxy from "./textproxy";

/**
 * Item is a Node or TextProxy.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_item-Item.html">Typedef Item (engine/view/item~Item) - CKEditor 5 API docs</a>
 */
export type Item = ViewNode | TextProxy;
