import type ContentLinkClipboardPlugin from "./contentlink/ContentLinkClipboardPlugin";
import type ContentLinkCommandHook from "./contentlink/ContentLinkCommandHook";
import type ContentLinks from "./contentlink/ContentLinks";
import type { COREMEDIA_CONTEXT_KEY, CoremediaContextConfig } from "./contentlink/ContextConfig";
import type LinkUserActionsPlugin from "./contentlink/LinkUserActionsPlugin";
import type { OpenContentInTabCommand } from "./contentlink/OpenContentInTabCommand";
import type ContentLinkActionsViewExtension from "./contentlink/ui/ContentLinkActionsViewExtension";
import type ContentLinkFormViewExtension from "./contentlink/ui/ContentLinkFormViewExtension";
import type LinkTargetCommand from "./linktarget/command/LinkTargetCommand";
import type { DefaultTarget } from "./linktarget/config/DefaultTarget";
import type { TargetDefaultRuleDefinition } from "./linktarget/config/LinkTargetDefaultRuleDefinition";
import type LinkTargetOptionDefinition from "./linktarget/config/LinkTargetOptionDefinition";
import type LinkTarget from "./linktarget/LinkTarget";
import type LinkTargetActionsViewExtension from "./linktarget/LinkTargetActionsViewExtension";
import type LinkTargetModelView from "./linktarget/LinkTargetModelView";
import type CustomLinkTargetUI from "./linktarget/ui/CustomLinkTargetUI";

declare module "ckeditor5" {
  interface PluginsMap {
    [ContentLinkActionsViewExtension.pluginName]: ContentLinkActionsViewExtension;
    [ContentLinkClipboardPlugin.pluginName]: ContentLinkClipboardPlugin;
    [ContentLinkCommandHook.pluginName]: ContentLinkCommandHook;
    [ContentLinkFormViewExtension.pluginName]: ContentLinkFormViewExtension;
    [ContentLinks.pluginName]: ContentLinks;
    [CustomLinkTargetUI.pluginName]: CustomLinkTargetUI;
    [LinkTarget.pluginName]: LinkTarget;
    [LinkTargetActionsViewExtension.pluginName]: LinkTargetActionsViewExtension;
    [LinkTargetModelView.pluginName]: LinkTargetModelView;
    [LinkUserActionsPlugin.pluginName]: LinkUserActionsPlugin;
  }

  interface CommandsMap {
    // While part of ckeditor5-coremedia-content, the command is added here
    // within the ContentLinks plugin. Thus, we should declare it here.
    [ContentLinks.openLinkInTab]: OpenContentInTabCommand;
    linkTarget: LinkTargetCommand;
  }
}

declare module "ckeditor5" {
  interface EditorConfig {
    [COREMEDIA_CONTEXT_KEY]?: CoremediaContextConfig;
  }

  interface LinkConfig {
    targets?: (DefaultTarget | LinkTargetOptionDefinition)[];
    defaultTargets?: TargetDefaultRuleDefinition[];
  }
}
