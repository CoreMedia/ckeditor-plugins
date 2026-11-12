import type { Mode } from "./FontMapping";

export const COREMEDIA_FONT_MAPPER_CONFIG_KEY = "coremedia:fontMapper";

export interface FontMapperConfigEntry {
  font: string;
  mode?: Mode;
  map: Record<number, string>;
}

export type FontMapperConfig = FontMapperConfigEntry[];
