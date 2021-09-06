import View from '../view';
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import Observable, { BindReturnValue } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import Emitter, { CallbackFunction } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import ViewCollection from "@ckeditor/ckeditor5-ui/src/viewcollection";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import DomEventData from "@ckeditor/ckeditor5-engine/src/view/observer/domeventdata";
import IconView from "../icon/iconview";

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
export default class ButtonView extends View {
  constructor(locale?: Locale);

  icon?:string;

  withText?:boolean;

  children:ViewCollection;

  iconView:IconView;

  type?: "button" | "submit" | "reset" | "menu" | undefined;

  render(): void;

  focus(): void;

  on(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  once(event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  set(name: string | Object, value?: any): void;

  bind(...bindProperties: any[]): BindReturnValue;

  off(event: string, callback?: CallbackFunction): void;

  fire(eventOrInfo: string | EventInfo, ...args: any[]): any;

  stopListening(emitter?: Emitter, event?: string, callback?: CallbackFunction): void;

  listenTo(emitter: Emitter, event: string, callback: CallbackFunction, options?: { priority: PriorityString | number }): void;

  decorate(methodName: string): void;
}
