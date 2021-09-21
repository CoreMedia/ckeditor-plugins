/**
 * The target option definition descriptor.
 */
// This is similar to `ImageStyleOptionDefinition` as provided by
// CKEditor's Image Plugin.
interface LinkTargetOptionDefinition {
  /**
   * The unique name of the target option. It will be used to:
   *
   * * refer to one of the default targets or define a custom target
   * * store the chosen target in model by setting `linkTarget` attribute
   * * as a value of the `linkTarget` command
   * * when registering a button for the target in the following manner:
   *     (`'linkTarget:{name}'`).
   */
  name: string;
  /**
   * Specifies an icon to apply to the target button in ActionsView.
   * This is usually an imported SVG.
   *
   * If unset the target's title (or name as a fallback) will be displayed instead.
   */
  icon?: string;
  /**
   * The target's title. The title will be handed over to locale for translation.
   *
   * If unset defaults to `{name}`.
   */
  title?: string;
}

export default LinkTargetOptionDefinition;
