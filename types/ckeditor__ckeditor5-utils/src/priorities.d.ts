
export namespace priorities {
  function get(priority: PriorityString | number): number;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_priorities-PriorityString.html">Typedef PriorityString (utils/priorities~PriorityString) - CKEditor 5 API docs</a>
 */
export type PriorityString = "highest" | "high" | "normal" | "low" | "lowest";
