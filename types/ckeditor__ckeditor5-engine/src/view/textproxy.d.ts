/**
 * TextProxy is a wrapper for substring of Text.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_textproxy-TextProxy.html">Class TextProxy (engine/view/textproxy~TextProxy) - CKEditor 5 API docs</a>
 */
export default class TextProxy {
  getAttribute(key: string): string | undefined;

  is(type: string): boolean;
}
