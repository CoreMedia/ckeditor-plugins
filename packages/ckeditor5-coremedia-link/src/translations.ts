import type { Translations } from "ckeditor5";

export const de: Translations = {
  de: {
    dictionary: {
      "Link": "Verknüpfung",
      "Enter url or drag and drop content onto this area.": "URL angeben oder Inhalt hierher ziehen.",
      "No results found.": "Keine Ergebnisse gefunden.",
      "Enter at least 3 characters to search.": "Geben Sie mindestens 3 Zeichen für die Suche ein.",
      "Loading Content...": "Lade Inhalt...",
      "Open Library": "Öffne Bibliothek",
      "Target": "Ziel",
      "Open in Current Tab": "Im aktuellen Tab öffnen",
      "Open in New Tab": "In neuem Tab öffnen",
      "Show Embedded": "Eingebettet öffnen",
      "Open in Frame": "Im Frame öffnen",
    },
  },
};

export const en: Translations = {
  en: { dictionary: Object.fromEntries(Object.keys(de.de.dictionary).map((k) => [k, k])) },
};
