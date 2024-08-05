import { global } from "ckeditor5";

if (!global.window.CKEDITOR_TRANSLATIONS) {
  global.window.CKEDITOR_TRANSLATIONS = {};
}

// as add is not exposed anymore from the unified package, we need to implement it here
// TODO: use .po files for own plugins and remove this function
export const addTranslations = (
  language: string,
  translations: Readonly<Record<string, string | readonly string[]>>,
  getPluralForm?: (n: number) => number,
) => {
  if (!global.window.CKEDITOR_TRANSLATIONS[language]) {
    global.window.CKEDITOR_TRANSLATIONS[language] = { dictionary: {} };
  }
  const languageTranslations = global.window.CKEDITOR_TRANSLATIONS[language];
  languageTranslations.dictionary = languageTranslations.dictionary || {};
  languageTranslations.getPluralForm = getPluralForm ?? languageTranslations.getPluralForm;
  Object.assign(languageTranslations.dictionary, translations);
};

/**
 * Opens the link in a new browser tab.
 */
export function openLink(link: string) {
  window.open(link, "_blank", "noopener");
}
