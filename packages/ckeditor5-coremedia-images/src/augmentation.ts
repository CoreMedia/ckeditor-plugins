// noinspection JSUnusedGlobalSymbols

import type {
  ContentImageClipboardPlugin,
  ContentImageEditingPlugin,
  ContentImageOpenInTabUI,
  ContentImagePlugin,
  ModelBoundSubscriptionPlugin,
} from "./index";
import type { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content/commands/OpenInTabCommand";

declare module "@ckeditor/ckeditor5-core" {
  interface PluginsMap {
    [ContentImageClipboardPlugin.pluginName]: ContentImageClipboardPlugin;
    [ContentImageEditingPlugin.pluginName]: ContentImageEditingPlugin;
    [ContentImageOpenInTabUI.pluginName]: ContentImageOpenInTabUI;
    [ContentImagePlugin.pluginName]: ContentImagePlugin;
    [ModelBoundSubscriptionPlugin.pluginName]: ModelBoundSubscriptionPlugin;
  }
  interface CommandsMap {
    [ContentImageEditingPlugin.openImageInTab]: OpenInTabCommand;
  }
}
