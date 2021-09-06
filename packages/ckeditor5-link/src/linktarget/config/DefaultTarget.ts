import LinkTargetOptionDefinition from "./LinkTargetOptionDefinition";

/**
 * Default targets to choose from.
 *
 * * **`_self`:**
 *     Open in current tab.
 *     This is also the assumed default, if no `linkTarget` is set.
 *
 * * **`_blank:**
 *     Open in new tab.
 *
 * * **`_embed:**
 *     Show Embedded.
 *     Artificial target for `xlink:show="embed"`.
 *
 * * **`_other:**
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

export const OTHER_TARGET_NAME = "_other";

type DefaultTarget = "_self" | "_blank" | "_embed" | typeof OTHER_TARGET_NAME;

type DefaultTargetOptions = {
  [key in DefaultTarget]: Omit<LinkTargetOptionDefinition, "name">;
};

const iconCssPrefix = "link-target";

const icon = (base: string): string => {
  return `${iconCssPrefix}--${base}`;
};

const DEFAULT_TARGETS: DefaultTargetOptions = {
  _self: {
    iconCls: icon("self"),
    title: "Open in Current Tab",
  },
  _blank: {
    iconCls: icon("blank"),
    title: "Open in New Tab",
  },
  _embed: {
    iconCls: icon("embed"),
    title: "Show Embedded",
  },
  // _none: While xlink:show also provides an option `none` we decided not to
  //    provide it as part of the API. If `_none` is used as `target` attribute
  //    value it will behave as `_other` with a custom target option value
  //    `_none`.
  _other: {
    // Just an example for a custom icon.
    iconCls: icon("other"),
    title: "Open in Frame",
  },
};

const asMap = (targets: DefaultTargetOptions): Map<string, LinkTargetOptionDefinition> => {
  const result = new Map<string, LinkTargetOptionDefinition>();
  let target: keyof DefaultTargetOptions;
  for (target in targets) {
    result.set(target, {
      name: target,
      ...targets[target],
    });
  }
  return result;
};

const asLinkTargetOptionDefinitions = (targets: DefaultTargetOptions): LinkTargetOptionDefinition[] => {
  const result: LinkTargetOptionDefinition[] = [];
  let target: keyof DefaultTargetOptions;
  for (target in targets) {
    result.push({
      name: target,
      ...targets[target],
    });
  }
  return result;
};

const DEFAULT_TARGETS_MAP: Map<string, LinkTargetOptionDefinition> = asMap(DEFAULT_TARGETS);
const DEFAULT_TARGETS_ARRAY: LinkTargetOptionDefinition[] = asLinkTargetOptionDefinitions(DEFAULT_TARGETS);

const getDefaultTargetDefinition = (key: string): LinkTargetOptionDefinition | undefined => {
  return DEFAULT_TARGETS_MAP.get(key);
};

export default DefaultTarget;
export { DEFAULT_TARGETS, DEFAULT_TARGETS_ARRAY, getDefaultTargetDefinition, icon, DefaultTargetOptions };
