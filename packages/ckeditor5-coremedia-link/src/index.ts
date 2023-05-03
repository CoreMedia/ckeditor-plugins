/**
 * @module ckeditor5-coremedia-link
 */

/*
 * =============================================================================
 * contentlink
 * =============================================================================
 */

export { default as ContentLinkClipboardPlugin } from "./contentlink/ContentLinkClipboardPlugin";
export { default as ContentLinkCommandHook } from "./contentlink/ContentLinkCommandHook";
export { default as ContentLinks } from "./contentlink/ContentLinks";
export { default as LinkUserActionsPlugin } from "./contentlink/LinkUserActionsPlugin";
export { default as ContentLinkActionsViewExtension } from "./contentlink/ui/ContentLinkActionsViewExtension";
export { default as ContentLinkFormViewExtension } from "./contentlink/ui/ContentLinkFormViewExtension";
export { default as LinkBalloonConfig } from "./contentlink/LinkBalloonConfig";

/*
 * =============================================================================
 * linktarget
 * =============================================================================
 */

export { default as LinkTarget } from "./linktarget/LinkTarget";
export { default as LinkTargetActionsViewExtension } from "./linktarget/LinkTargetActionsViewExtension";
export { default as LinkTargetCommand } from "./linktarget/command/LinkTargetCommand";
export { default as LinkTargetModelView } from "./linktarget/LinkTargetModelView";
export { default as CustomLinkTargetUI } from "./linktarget/ui/CustomLinkTargetUI";

import "./augmentation";
