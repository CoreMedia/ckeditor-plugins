// noinspection JSUnusedGlobalSymbols

import type {
  ContentImageClipboardPlugin,
  ContentImageEditingPlugin,
  ContentImageOpenInTabUI,
  ContentImagePlugin,
  ModelBoundSubscriptionPlugin,
  OpenImageInTabCommand,
} from "./index";
declare module "ckeditor5" {
  interface PluginsMap {
    [ContentImageClipboardPlugin.pluginName]: ContentImageClipboardPlugin;
    [ContentImageEditingPlugin.pluginName]: ContentImageEditingPlugin;
    [ContentImageOpenInTabUI.pluginName]: ContentImageOpenInTabUI;
    [ContentImagePlugin.pluginName]: ContentImagePlugin;
    [ModelBoundSubscriptionPlugin.pluginName]: ModelBoundSubscriptionPlugin;
  }
  interface CommandsMap {
    [ContentImageEditingPlugin.openImageInTab]: OpenImageInTabCommand;
  }
}
