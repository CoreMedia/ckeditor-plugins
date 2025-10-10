import ContentLinkClipboardPlugin from "./contentlink/ContentLinkClipboardPlugin";
import ContentLinkCommandHook from "./contentlink/ContentLinkCommandHook";
import ContentLinks from "./contentlink/ContentLinks";
import { COREMEDIA_CONTEXT_KEY, CoremediaContextConfig } from "./contentlink/ContextConfig";
import LinkUserActionsPlugin from "./contentlink/LinkUserActionsPlugin";
import { OpenContentInTabCommand } from "./contentlink/OpenContentInTabCommand";
import ContentLinkActionsViewExtension from "./contentlink/ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./contentlink/ui/ContentLinkFormViewExtension";
import LinkTargetCommand from "./linktarget/command/LinkTargetCommand";
import { DefaultTarget } from "./linktarget/config/DefaultTarget";
import { TargetDefaultRuleDefinition } from "./linktarget/config/LinkTargetDefaultRuleDefinition";
import LinkTargetOptionDefinition from "./linktarget/config/LinkTargetOptionDefinition";
import LinkTarget from "./linktarget/LinkTarget";
import LinkTargetActionsViewExtension from "./linktarget/LinkTargetActionsViewExtension";
import LinkTargetModelView from "./linktarget/LinkTargetModelView";
import CustomLinkTargetUI from "./linktarget/ui/CustomLinkTargetUI";

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
