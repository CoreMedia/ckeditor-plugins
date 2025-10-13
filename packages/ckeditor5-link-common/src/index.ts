/**
 * @module ckeditor5-link-common
 */

export { LinkAttributes, getLinkAttributes } from "./LinkAttributes";
export type { LinkAttributesConfig } from "./LinkAttributesConfig";
export type { RegisterAttributeConfig, LinkAttributeName } from "./RegisterAttributeConfig";
export { isRegisterAttributeConfig } from "./RegisterAttributeConfig";
export { LINK_COMMAND_NAME, LINK_HREF_MODEL } from "./Constants";
export { hasRequiredInternalFocusablesProperty } from "./HasFocusables";
export { handleFocusManagement } from "./FocusUtils";

import "./augmentation";
