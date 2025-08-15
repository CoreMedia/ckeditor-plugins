import { Config, EditorConfig } from "ckeditor5";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import LinkTargetOptionDefinition from "./LinkTargetOptionDefinition";
import DefaultTarget, { DEFAULT_TARGETS_ARRAY, getDefaultTargetDefinition } from "./DefaultTarget";
import {
  isTargetDefaultRuleDefinitionWithFilter,
  isTargetDefaultRuleDefinitionWithType,
  TargetDefaultRuleDefinition,
  TargetDefaultRuleDefinitionWithFilter,
} from "./LinkTargetDefaultRuleDefinition";
import { getFilterByType } from "./DefaultTargetTypeFilters";

/**
 * Provides the given targets to select from and a list of rules to
 * set the default target for different types of links.
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
 *             defaultTargets: [
 *               {
 *                 type: "externalLink",
 *                 target: "_blank",
 *               }
 *             ]
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
 *
 * It is also possible to provide a `filter` instead of a `type`
 * for the default target rules.
 */
interface LinkTargetConfig {
  targets?: (DefaultTarget | LinkTargetOptionDefinition)[];
  defaultTargets?: TargetDefaultRuleDefinition[];
}

const logger = LoggerProvider.getLogger("LinkTargetConfig");

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
  if (fromConfig === null || fromConfig === undefined) {
    return [];
  }
  if (!Array.isArray(fromConfig)) {
    throw new Error(
      `link.defaultTargets: Unexpected configuration. Array expected but is: ${JSON.stringify(fromConfig)}`,
    );
  }
  const defaultTargetsArray: unknown[] = fromConfig;
  defaultTargetsArray.forEach((entry: unknown): void => {
    if (isTargetDefaultRuleDefinitionWithFilter(entry)) {
      result.push(entry);
    }
    if (isTargetDefaultRuleDefinitionWithType(entry)) {
      const filter = getFilterByType(entry.type);
      if (!filter) {
        return;
      }
      result.push({
        filter,
        target: entry.target,
      });
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
    try {
      if (defaultTarget.filter(url)) {
        result = defaultTarget.target;
      }
    } catch (e) {
      // We invoked possibly custom code here and should be robust, when the
      // corresponding configuration contains an error.
      logger.warn(`Ignoring failure while evaluating default target for URL '${url}'.`, e);
    }
  });
  return result;
};

/**
 * Parses the `link.targets` configuration and converts string entries to objects of
 * type LinkTargetOptionDefinition.
 * @param linkTargetsConfig - the `link.targets` configuration
 */
const getLinkTargetDefinitions = (linkTargetsConfig: unknown): Required<LinkTargetOptionDefinition>[] => {
  const validTargets: Required<LinkTargetOptionDefinition>[] = [];
  if (linkTargetsConfig === undefined) {
    return [];
  }
  if (!Array.isArray(linkTargetsConfig)) {
    throw new Error(
      `link.targets: Unexpected configuration. Array expected but is: ${JSON.stringify(linkTargetsConfig)}`,
    );
  }

  for (const linkTargetsConfigEntry of linkTargetsConfig) {
    if (typeof linkTargetsConfigEntry === "string") {
      const name = linkTargetsConfigEntry;
      if (!name) {
        throw new Error("link.targets: Target name must not be empty.");
      }
      const defaultDefinition = getDefaultTargetDefinition(name);

      if (defaultDefinition) {
        validTargets.push(defaultDefinition);
      } else {
        validTargets.push({
          name,
          icon: "",
          title: name,
        });
      }
    } else if (typeof linkTargetsConfigEntry === "object") {
      // Part 1: Check for valid configuration object.
      //
      // Complicated? The following lines are a typesafe approach to validate,
      // if required attributes have been set. It requires no type-checking nor
      // casting, as we "fulfill" the required attributes on our own.

      const definition: LinkTargetOptionDefinition = {
        // Provoke a default empty name, which will fail if not set in object.
        name: "",
        ...linkTargetsConfigEntry,
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
      validTargets.push(mergedDefinition);
    } else {
      throw new Error(
        `link.targets: Unexpected entry ${JSON.stringify(linkTargetsConfigEntry)} in configuration ${JSON.stringify(linkTargetsConfig)}`,
      );
    }
  }
  return validTargets;
};

/**
 * Parses a possibly existing configuration option as part of CKEditor's
 * link plugin configuration. It expects an entry `toolbar` which probably contains an
 * array of targets to offer to the editors for selection in the UI.
 * This entry is either set manually or the default in CKEditor's link plugin is used.
 * It also parses the `targets` entry, which might hold custom linkTargets, which then
 * might be used in the `toolbar` entry.
 *
 *
 * @param config - CKEditor configuration to parse
 */
export const parseLinkTargetConfig = (config: Config<EditorConfig>): Required<LinkTargetOptionDefinition>[] => {
  const linkTargetsConfig: unknown = config.get("link.targets");
  const linkToolbarConfig: string[] | undefined = config.get("link.toolbar");

  const result: Required<LinkTargetOptionDefinition>[] = [];
  if (linkToolbarConfig === undefined) {
    return [];
  }

  const validTargets = getLinkTargetDefinitions(linkTargetsConfig);
  linkToolbarConfig.forEach((entry: string): void => {
    const foundTarget = validTargets.find((validTarget) => validTarget.name === entry);
    // is toolbar entry in custom target list?
    if (foundTarget) {
      result.push(foundTarget);
      return;
    }
    const foundDefaultTarget = DEFAULT_TARGETS_ARRAY.find((validTarget) => validTarget.name === entry);
    // is toolbar entry in default target list?
    if (foundDefaultTarget) {
      result.push(foundDefaultTarget);
    }
  });
  return result;
};
export default LinkTargetConfig;
