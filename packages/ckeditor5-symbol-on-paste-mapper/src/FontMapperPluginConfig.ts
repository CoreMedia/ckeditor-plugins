import FontMapper from "./fontMapper/FontMapper";

export default interface FontMapperPluginConfig {
  mode: string;
  fontMapper: Array<FontMapper>;
}
