/**
 * Localizations for ContentLink Plugin.
 *
 * @packageDocumentation
 */
import { addTranslations } from "@coremedia/ckeditor5-core-common";

const german = {
  "Link": "Verknüpfung",
  "Enter url or drag and drop content onto this area.": "URL angeben oder Inhalt hierher ziehen.",
  "No results found.": "Keine Ergebnisse gefunden.",
  "Enter at least 3 characters to search.": "Geben Sie mindestens 3 Zeichen für die Suche ein.",
  "Loading Content...": "Lade Inhalt...",
  "Open Library": "Öffne Bibliothek",
};
addTranslations("en", Object.fromEntries(Object.keys(german).map((k) => [k, k])));
addTranslations("de", german);
