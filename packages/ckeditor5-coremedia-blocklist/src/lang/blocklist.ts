/**
 * Localizations for Blocklist Plugin.
 *
 * @packageDocumentation
 */
import { addTranslations } from "@coremedia/ckeditor5-core-common";

const german = {
  "Edit blocklist": "Blockliste bearbeiten",
  "Block": "Sperren",
  "Add word to blocklist": "Begriff zur Blockliste hinzufügen",
  "Remove word from blocklist": "Begriff aus Blockliste löschen",
  "Enter word to block": "Begriff zur Liste hinzufügen",
};
addTranslations("en", Object.fromEntries(Object.keys(german).map((k) => [k, k])));
addTranslations("de", german);
