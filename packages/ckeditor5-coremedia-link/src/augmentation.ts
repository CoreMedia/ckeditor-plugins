import type {
  ContentLinkActionsViewExtension,
  ContentLinkClipboardPlugin,
  ContentLinkCommandHook,
  ContentLinkFormViewExtension,
  ContentLinks,
  CustomLinkTargetUI,
  LinkTarget,
  LinkTargetActionsViewExtension,
  LinkTargetCommand,
  LinkTargetModelView,
  LinkUserActionsPlugin,
  OpenContentInTabCommand,
} from "./index";
import DefaultTarget from "./linktarget/config/DefaultTarget";
import LinkTargetOptionDefinition from "./linktarget/config/LinkTargetOptionDefinition";
import { TargetDefaultRuleDefinition } from "./linktarget/config/LinkTargetDefaultRuleDefinition";

declare module "@ckeditor/ckeditor5-core" {
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

declare module "@ckeditor/ckeditor5-link" {
  interface LinkConfig {
    targets?: (DefaultTarget | LinkTargetOptionDefinition)[];
    defaultTargets?: TargetDefaultRuleDefinition[];
  }
}
