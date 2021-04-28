/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_elementdefinition-ElementDefinition.html">Typedef ElementDefinition (engine/view/elementdefinition~ElementDefinition) - CKEditor 5 API docs</a>
 */
export type ElementDefinition = string | {
  attributes?: { [key: string]: string },
  classes?: string | string[],
  name: string,
  priority?: number,
  styles?: { [key: string]: string },
};
