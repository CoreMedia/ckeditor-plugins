/**
 * Localizations for LinkTarget Plugin.
 *
 * @packageDocumentation
 */
import { addTranslations } from "@coremedia/ckeditor5-core-common";

const german = {
  "Target": "Ziel",
  "Open in Current Tab": "Im aktuellen Tab öffnen",
  "Open in New Tab": "In neuem Tab öffnen",
  "Show Embedded": "Eingebettet öffnen",
  "Open in Frame": "Im Frame öffnen",
};
addTranslations("en", Object.fromEntries(Object.keys(german).map((k) => [k, k])));
addTranslations("de", german);
