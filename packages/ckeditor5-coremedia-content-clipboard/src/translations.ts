import type { Translations } from "ckeditor5";

export const de: Translations = {
  de: {
    dictionary: {
      "Paste Content": "Inhalte einfügen",
    },
  },
};

export const en: Translations = {
  en: { dictionary: Object.fromEntries(Object.keys(de.de.dictionary).map((k) => [k, k])) },
};
