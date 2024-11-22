/**
 * Localizations for ContentImageOpenInTab Plugin.
 *
 * @packageDocumentation
 */
import { addTranslations } from "@coremedia/ckeditor5-core-common";

const german = {
  "Open in tab": "Im Tab öffnen",
};
addTranslations("en", Object.fromEntries(Object.keys(german).map((k) => [k, k])));
addTranslations("de", german);
