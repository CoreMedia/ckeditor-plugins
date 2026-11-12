import type { Translations } from "ckeditor5";

export const de: Translations = {
  de: { dictionary: { "loading...": "Inhalt wird geladen...", "Open in tab": "Im Tab öffnen" } },
};

export const en: Translations = {
  en: { dictionary: Object.fromEntries(Object.keys(de.de.dictionary).map((k) => [k, k])) },
};
