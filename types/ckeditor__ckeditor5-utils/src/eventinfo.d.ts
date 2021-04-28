/**
 * The event object passed to event callbacks.
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_eventinfo-EventInfo.html">Class EventInfo (utils/eventinfo~EventInfo) - CKEditor 5 API docs</a>
 */
export default class EventInfo {
  get name(): string;

  get path(): any[];

  get return(): any | undefined;
  set return(newReturn: any | undefined);

  get source(): any;

  constructor(source: Object, name: string);

  off(): void;

  stop(): void;
}
