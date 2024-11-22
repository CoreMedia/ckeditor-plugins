/**
 * Localizations for ContentLink Plugin.
 *
 * @packageDocumentation
 */
import { addTranslations } from "@coremedia/ckeditor5-core-common";

const german = {
  "Link": "Verknüpfung",
  "Enter url or drag and drop content onto this area.": "URL angeben oder Inhalt hierher ziehen",
};
addTranslations("en", Object.fromEntries(Object.keys(german).map((k) => [k, k])));
addTranslations("de", german);
