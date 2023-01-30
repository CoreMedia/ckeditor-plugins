/**
 * # CKEditor 5 Link Feature Extension Point
 *
 * CKEditor 5 does not provide extension points for adding for sophisticated
 * behaviors to links. In here you will find the extension points required by the
 * CKEditor plugins provided here.
 *
 * ## Additional Link Attributes
 *
 * **Challenge:** If you provide additional attributes for links (i.e., texts with
 * `linkHref` model attribute), you may want to automatically remove them, when the
 * attribute got removed by the `UnlinkCommand` for example.
 *
 * Yet, you want only one Undo-step for the removal of both attributes, i.e.,
 * undoing one `unlink` action has to restore both attributes, your custom one and
 * `linkHref`.
 *
 * **Solution:** The solution is registering a post-fixer at CKEditor's document
 * instance. And to ease this approach, you may use the `LinkCleanup` plugin. You
 * can register any attribute, which must not exist without corresponding
 * `linkHref` attribute:
 *
 * ```typescript
 * getLinkCleanup(editor)?.registerDependentAttribute("linkCustom");
 * ```
 *
 * This requires to add `LinkCleanup` as required dependency to your plugin.
 *
 * @packageDocumentation
 * @category Virtual
 */

export * as Constants from "./Constants";
export * as FocusUtils from "./FocusUtils";

export * from "./LinkCleanup";
export { default as LinkCleanup } from "./LinkCleanup";
