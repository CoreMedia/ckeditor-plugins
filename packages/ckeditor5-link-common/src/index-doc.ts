/**
 * # CKEditor 5 Link Feature Extension Point
 *
 * CKEditor 5 does not provide extension points for adding for sophisticated
 * behaviors to links.
 * Here you will find the extension points required by the CKEditor plugins
 * provided here.
 *
 * ## LinkAttributes
 *
 * The central API when it comes to deal with attributes in relation to
 * links is the plugin `LinkAttributes`.
 *
 * In short, you register a custom attribute by its view representation
 * (data and editing view) along with a representation in the model.
 * The plugin will register corresponding up- and downcast rules and
 * incorporates best practices regarding the priorities and model attribute
 * prefixes, to smoothly integrate with the CKEditor 5 link feature.
 *
 * Unless CKEditor 5 provides its own solution for registering such
 * attributes, it is recommended using this plugin for any additional
 * attribute bound to links.
 *
 * For details, consult the corresponding class level documentation.
 *
 * ## LinkCleanup
 *
 * **Challenge:** If you provide additional attributes for links (i.e., texts
 * with `linkHref` model attribute), you may want to automatically remove them,
 * when the attribute got removed by the `UnlinkCommand`, for example.
 *
 * Yet you want only one Undo-step for the removal of both attributes; i.e.,
 * undoing one `unlink` action has to restore both attributes, your custom one
 * and `linkHref`.
 *
 * **Solution:** The solution is registering a post-fixer at CKEditor's document
 * instance. And to ease this approach, you may use the `LinkCleanup` plugin. You
 * can register any attribute, which must not exist without the corresponding
 * `linkHref` attribute:
 *
 * ```typescript
 * getLinkCleanup(editor)?.registerDependentAttribute("linkCustom");
 * ```
 *
 * `LinkCleanup` is automatically invoked from `LinkAttributes`. Unless you need
 * more fine-grained control in contrast to that one provided by
 * `LinkAttributes` (such as different downcasting to data view and to editing
 * view), `LinkCleanup` is not required to be used directly.
 *
 * @module ckeditor5-link-common
 */

export * as Constants from "./Constants";
export * as FocusUtils from "./FocusUtils";

export type { HasFocusables, HasFocusTracker } from "./HasFocusables";

export * from "./LinkAttributes";
export * from "./LinkAttributesConfig";

export * from "./LinkCleanup";
export { default as LinkCleanup } from "./LinkCleanup";

export * from "./RegisterAttributeConfig";
