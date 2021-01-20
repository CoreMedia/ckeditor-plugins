/**
 * The CKEditor error class.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_ckeditorerror-CKEditorError.html">Class CKEditorError (utils/ckeditorerror~CKEditorError) - CKEditor 5 API docs</a>
 */
export default class CKEditorError extends Error {
  /**
   * Creates an instance of the CKEditorError class.
   */
  constructor(errorName: string, context: Object | null, data?: Object);
}
