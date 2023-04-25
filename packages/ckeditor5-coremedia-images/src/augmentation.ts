import type {
  ContentImageClipboardPlugin,
  ContentImageEditingPlugin,
  ContentImageOpenInTabUI,
  ContentImagePlugin,
  ModelBoundSubscriptionPlugin,
} from "./index";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [ContentImageClipboardPlugin.pluginName]: ContentImageClipboardPlugin;
    [ContentImageEditingPlugin.pluginName]: ContentImageEditingPlugin;
    [ContentImageOpenInTabUI.pluginName]: ContentImageOpenInTabUI;
    [ContentImagePlugin.pluginName]: ContentImagePlugin;
    [ModelBoundSubscriptionPlugin.pluginName]: ModelBoundSubscriptionPlugin;
  }
  interface CommandsMap {}
}
