/* eslint no-null/no-null: off */

import LinkTargetOptionDefinition from "./LinkTargetOptionDefinition";
import DefaultTarget, { DEFAULT_TARGETS_ARRAY, getDefaultTargetDefinition } from "./DefaultTarget";
import { Config } from "@ckeditor/ckeditor5-utils";
import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";
import {
  isTargetDefaultRuleDefinitionWithFilter,
  isTargetDefaultRuleDefinitionWithType,
  TargetDefaultRuleDefinition,
  TargetDefaultRuleDefinitionWithFilter,
} from "./LinkTargetDefaultRuleDefinition";

/**
 * Provides the given targets to select from.
 *
 * The configuration is provided as extension to CKEditor's link feature
 * configuration:
 *
 * ```
 * ClassicEditor
 *     .create( document.querySelector( '#editor' ), {
 *         // ...
 *         link: {
 *             targets: [
 *               // buttons will be created in this order.
 *               "_self",
 *               "_blank",
 *               "_embed",
 *               "_other",
 *               // Will be transformed to:
 *               // {
 *               //   name: "custom1",
 *               //   icon: custom1Icon,
 *               //   title: "custom1",
 *               // }
 *               "custom1",
 *               {
 *                 name: "myCustomTarget",
 *                 icon: customTargetIcon,
 *                 title: "Custom Target",
 *               },
 *             ],
 *         }
 *     } )
 *     .then( ... )
 *     .catch( ... );
 * ```
 *
 * where for example `"self"` is one of the pre-defined targets provided by
 * this plugin, while `"myCustomTarget"` provides a custom fixed target.
 * `"myCustomTarget"` will be represented in model by `linkTarget="myCustomTarget"`
 * and will get a toggle button with given icon and title.
 */
interface LinkTargetConfig {
  targets?: (DefaultTarget | LinkTargetOptionDefinition)[];
  defaultTargets?: TargetDefaultRuleDefinition[];
}

/**
 * Parses a possibly existing configuration option as part of CKEditor's
 * link plugin configuration. It expects an entry `defaultTargets` which contains an
 * array of default targets for different kind of link types.
 *
 * @param config - CKEditor configuration to parse
 */
const parseDefaultLinkTargetConfig = (config: Config<EditorConfig>): TargetDefaultRuleDefinitionWithFilter[] => {
  const fromConfig: unknown = config.get("link.defaultTargets");
  const result: TargetDefaultRuleDefinitionWithFilter[] = [];

  if (!Array.isArray(fromConfig)) {
    throw new Error(
      `link.defaultTargets: Unexpected configuration. Array expected but is: ${JSON.stringify(fromConfig)}`
    );
  }
  const defaultTargetsArray: unknown[] = fromConfig;
  defaultTargetsArray.forEach((entry: unknown): void => {
    if (isTargetDefaultRuleDefinitionWithFilter(entry)) {
      result.push(entry);
    } else if (isTargetDefaultRuleDefinitionWithType(entry)) {
      const externalLinkFilter = (url: string) => (url ? url.startsWith("https://") : false);
      const contentLinkFilter = (url: string) => (url ? url.startsWith("content") : false);
      const filter =
        entry.type === "externalLink" ? externalLinkFilter : entry.type === "contentLink" ? contentLinkFilter : null;
      if (filter) {
        result.push({
          filter,
          target: entry.target,
        });
      }
    }
  });

  return result;
};

/**
 * Returns a default target for a given url, based on the link configuration.
 *
 * @param url - the url of the link
 * @param config - the editor config
 * @returns the default linkTarget or undefined if no matching filter rule exists
 */
export const computeDefaultLinkTargetForUrl = (url: string, config: Config<EditorConfig>): string | undefined => {
  const defaultTargetConfig = parseDefaultLinkTargetConfig(config);
  let result: string | undefined;
  defaultTargetConfig.forEach((defaultTarget) => {
    if (defaultTarget.filter(url)) {
      result = defaultTarget.target;
    }
  });
  return result;
};

/**
 * Parses a possibly existing configuration option as part of CKEditor's
 * link plugin configuration. It expects an entry `targets` which contains an
 * array of targets to offer to the editors for selection in the UI.
 *
 * @param config - CKEditor configuration to parse
 */
export const parseLinkTargetConfig = (config: Config<EditorConfig>): Required<LinkTargetOptionDefinition>[] => {
  const fromConfig: unknown = config.get("link.targets");
  const result: Required<LinkTargetOptionDefinition>[] = [];
  if (fromConfig === null || fromConfig === undefined) {
    return DEFAULT_TARGETS_ARRAY;
  }

  if (!Array.isArray(fromConfig)) {
    throw new Error(`link.targets: Unexpected configuration. Array expected but is: ${JSON.stringify(fromConfig)}`);
  }

  const targetsArray: unknown[] = fromConfig;
  targetsArray.forEach((entry: unknown): void => {
    if (typeof entry === "string") {
      const name = entry;
      if (!name) {
        throw new Error("link.targets: Target name must not be empty.");
      }
      const defaultDefinition = getDefaultTargetDefinition(name);
      if (defaultDefinition) {
        result.push(defaultDefinition);
      } else {
        result.push({
          name,
          icon: "",
          title: name,
        });
      }
    } else if (typeof entry === "object") {
      // Part 1: Check for valid configuration object.
      //
      // Complicated? The following lines are a typesafe approach to validate,
      // if required attributes have been set. It requires no type-checking nor
      // casting, as we "fulfill" the required attributes on our own.
      const definition: LinkTargetOptionDefinition = {
        // Provoke a default empty name, which will fail if not set in object.
        name: "",
        ...entry,
      };
      if (!definition.name) {
        throw new Error("link.targets: Configuration entry misses required non-empty property 'name'");
      }

      // Part 2: Provide a merged result with fallbacks, where the custom
      //         configuration always wins.

      // Possibly resolve default definition and add missing properties.
      const defaultDefinition: LinkTargetOptionDefinition | undefined = getDefaultTargetDefinition(definition.name);
      // The following approach will also work, if we add additional configuration attributes
      // to the standard definitions.
      const mergedDefinition: Required<LinkTargetOptionDefinition> = {
        // Defaults for entry
        ...{
          name: definition.name,
          icon: "",
          title: definition.name,
        },
        // Possibly existing standard definition. (Hint: On undefined, just no attribute will be added.)
        ...defaultDefinition,
        // The actual definition, possibly overriding all, possibly missing some properties such as `title`.
        ...definition,
      };
      result.push(mergedDefinition);
    } else {
      throw new Error(
        `link.targets: Unexpected entry ${JSON.stringify(entry)} in configuration ${JSON.stringify(fromConfig)}`
      );
    }
  });

  return result;
};

export default LinkTargetConfig;
