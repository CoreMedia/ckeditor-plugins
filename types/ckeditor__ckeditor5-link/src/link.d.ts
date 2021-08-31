import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkEditing from "./linkediting";
import LinkUI from "./linkui";
import AutoLink from "./autolink";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_link-Link.html">Class Link (link/link~Link) - CKEditor 5 API docs</a>
 */
export default class Link extends Plugin {
  static readonly pluginName: "Link";
}

export interface LinkDecoratorDefinition {
}
