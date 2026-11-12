import type { Translations } from "ckeditor5";

export const de: Translations = {
  de: {
    dictionary: {
      "Edit blocklist": "Blockliste bearbeiten",
      "Block": "Sperren",
      "Add word to blocklist": "Begriff zur Blockliste hinzufügen",
      "Remove word from blocklist": "Begriff aus Blockliste löschen",
      "Enter word to block": "Begriff zur Liste hinzufügen",
    },
  },
};

export const en: Translations = {
  en: { dictionary: Object.fromEntries(Object.keys(de.de.dictionary).map((k) => [k, k])) },
};
