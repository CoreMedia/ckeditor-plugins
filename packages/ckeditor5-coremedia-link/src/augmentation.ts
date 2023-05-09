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
