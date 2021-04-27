import { Message } from "../translation-service";

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_utils_locale-Locale.html">Class Locale (utils/locale~Locale) - CKEditor 5 API docs</a>
 */
type Options = {
  uiLanguage: string,
  contentLanguage: string
}

export default class Locale {
  constructor(options?: Options);

  readonly uiLanguage: string;
  readonly contentLanguage: string;
  readonly uiLanguageDirection: string;
  readonly contentLanguageDirection: string;

  t(message: string|Message, ...values: (string|number)[]): any;
}
