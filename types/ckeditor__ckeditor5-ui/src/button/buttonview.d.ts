import View from '../view/view';
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter from "@ckeditor/ckeditor5-utils/src/emittermixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

/**
 * The button view class.
 *
 *      const view = new ButtonView();
 *
 *      view.set( {
 *          label: 'A button',
 *          keystroke: 'Ctrl+B',
 *          tooltip: true,
 *          withText: true
 *      } );
 *
 *      view.render();
 *
 *      document.body.append( view.element );
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_ui_button_buttonview-ButtonView.html">Class ButtonView (ui/button/buttonview~ButtonView) - CKEditor 5 API docs</a>
 */
export default class ButtonView extends View implements Emitter, Observable {
  constructor(locale?: Locale);

  render(): void;

  focus(): void;

  on(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;
}
