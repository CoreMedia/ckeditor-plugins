/**
 * Provides a plugin, which replaces symbol font characters by their
 * corresponding entities.
 *
 * @module ckeditor5-font-mapper
 */

export { default as FontMapper } from "./FontMapper";
export { FontMapperConfigEntry, FontMapperConfig, COREMEDIA_FONT_MAPPER_CONFIG_KEY } from "./FontMapperConfig";
export { Mode } from "./FontMapping";

import "./augmentation";
