import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import View from "./view";

export default class ComponentFactory {
  readonly editor: any;
  constructor(editor: any);
  add(name: string, callback: (locale: Locale) => View): void;
  create(name: string): View;
  has(name: string): boolean;
  names(): Generator<string>;
}
