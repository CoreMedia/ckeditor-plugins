/**
 * Provides a plugin, which replaces symbol font characters by their
 * corresponding entities.
 *
 * @module ckeditor5-font-mapper
 */

export { default as FontMapper } from "./FontMapper";
export {
  COREMEDIA_FONT_MAPPER_CONFIG_KEY,
  type FontMapperConfig,
  type FontMapperConfigEntry,
} from "./FontMapperConfig";
export type { Mode } from "./FontMapping";

import "./augmentation";
