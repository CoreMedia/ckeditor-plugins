import selfIcon from "../../../theme/icons/openInCurrentTab.svg";
import blankIcon from "../../../theme/icons/openInNewTab.svg";
import embedIcon from "../../../theme/icons/embed.svg";
import otherIcon from "../../../theme/icons/openInFrame.svg";
import LinkTargetOptionDefinition from "./LinkTargetOptionDefinition";

/**
 * Artificial target name for the recommended minimal target configuration to
 * add.
 */
export const OTHER_TARGET_NAME = "_other";

/**
 * Values the default target option may take.
 */
export type DefaultTarget = "_self" | "_blank" | "_embed" | typeof OTHER_TARGET_NAME;

export default DefaultTarget;

export type DefaultTargetOptions = Record<DefaultTarget, Required<Omit<LinkTargetOptionDefinition, "name">>>;

/**
 * Default targets to choose from.
 *
 * * **`_self`:**
 *     Open in current tab.
 *     This is also the assumed default, if no `linkTarget` is set.
 *
 * * **`_blank`:**
 *     Open in new tab.
 *
 * * **`_embed`:**
 *     Show Embedded.
 *     Artificial target for `xlink:show="embed"`.
 *
 * * **`_other`:**
 *     Open in named frame.
 *
 *     `_other` is the fallback, when no other of the configured targets match.
 *     Thus, it especially represents custom named targets (named frames).
 *
 *     Artificial target for `xlink:show="other"`.
 *
 *     In context of CoreMedia RichText 1.0 it is expected to create a pair of
 *     `xlink:show="other"` and an attribute `xlink:role` which contains the
 *     custom name. Only for an empty name, the value `_other` will be used
 *     within CKEditor model layer for `linkTarget`.
 *
 *     `_other` may be used as the only target option to choose from, which
 *     simulates the ability to provide the target attribute just as in raw
 *     HTML without any extra toggle buttons.
 *
 *     It is strongly recommended adding at least `_other` as option, along with
 *     custom options you may provide. Otherwise, you may find `linkTarget`
 *     attributes in the model, which cannot be represented in the UI.
 */
export const DEFAULT_TARGETS: DefaultTargetOptions = {
  _self: {
    icon: selfIcon,
    title: "Open in Current Tab",
  },
  _blank: {
    icon: blankIcon,
    title: "Open in New Tab",
  },
  _embed: {
    icon: embedIcon,
    title: "Show Embedded",
  },
  // _none: While xlink:show also provides an option `none` we decided not to
  //    provide it as part of the API. If `_none` is used as `target` attribute
  //    value it will behave as `_other` with a custom target option value
  //    `_none`. In custom configuration a custom target for `_none` can be
  //    added.
  _other: {
    // Just an example for a custom icon.
    icon: otherIcon,
    title: "Open in Frame",
  },
};

/**
 * Transforms @see {@link DEFAULT_TARGETS} to a map from target name to target
 * configuration.
 *
 * @param targets - default target options
 */
const asMap = (targets: DefaultTargetOptions): Map<string, Required<LinkTargetOptionDefinition>> => {
  const result = new Map<string, Required<LinkTargetOptionDefinition>>();
  let target: keyof DefaultTargetOptions;
  for (target in targets) {
    result.set(target, {
      name: target,
      ...targets[target],
    });
  }
  return result;
};

/**
 * Transforms @see {@link DEFAULT_TARGETS} to an array of definition objects,
 * as it is used in editor configuration for example.
 *
 * @param targets - default target options
 */
const asLinkTargetOptionDefinitions = (targets: DefaultTargetOptions): Required<LinkTargetOptionDefinition>[] => {
  const result: Required<LinkTargetOptionDefinition>[] = [];
  let target: keyof DefaultTargetOptions;
  for (target in targets) {
    result.push({
      name: target,
      ...targets[target],
    });
  }
  return result;
};

const DEFAULT_TARGETS_MAP: Map<string, Required<LinkTargetOptionDefinition>> = asMap(DEFAULT_TARGETS);
export const DEFAULT_TARGETS_ARRAY: Required<LinkTargetOptionDefinition>[] =
  asLinkTargetOptionDefinitions(DEFAULT_TARGETS);

/**
 * Gets a default target definition for the given key, if available.
 *
 * @param key - name of the definition to get
 * @returns default target definition; `undefined` if not available
 */
export const getDefaultTargetDefinition = (key: string): Required<LinkTargetOptionDefinition> | undefined =>
  DEFAULT_TARGETS_MAP.get(key);

/**
 * Gets a required default target definition for the given key.
 *
 * @param key - name of the definition to get
 * @returns default target definition
 * @throws Error when default target definition of given name is not available
 */
export const requireDefaultTargetDefinition = (key: string): Required<LinkTargetOptionDefinition> => {
  const definition = getDefaultTargetDefinition(key);
  if (!definition) {
    throw new Error(`Default Target Definition does not exist: "${key}"`);
  }
  return definition;
};
