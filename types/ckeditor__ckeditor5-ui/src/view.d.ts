import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import Template from "./template";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_view-View.html">Class View (ui/view~View) - CKEditor 5 API docs</a>
 */
export default class View implements Emitter, Observable {
  element: HTMLElement;
  readonly isRendered: boolean;
  readonly locale: Locale;
  template: Template;

  constructor(locale?: Locale);

  render(): void;

  destroy(): void;

  deregisterChild(children: View | View[]): void;

  registerChild(children: View | View[]): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  off(event: string, callback?: CallbackFunction): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
