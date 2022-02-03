/**
 * The Link-Target Plugin extends CKEditor's Link Feature
 * by selection of a `target` attribute for an existing link. It is stored in
 * model as `linkTarget` attribute.
 *
 * @packageDocumentation
 * @category Virtual
 */

export * as command from "./command/index-doc";
export * as config from "./config/index-doc";
export * as ui from "./ui/index-doc";

export * as Constants from "./Constants";

export * from "./LinkTarget";
export { default as LinkTarget } from "./LinkTarget";

export * from "./LinkTargetActionsViewExtension";
export { default as LinkTargetActionsViewExtension } from "./LinkTargetActionsViewExtension";

export * from "./LinkTargetModelView";
export { default as LinkTargetModelView } from "./LinkTargetModelView";
