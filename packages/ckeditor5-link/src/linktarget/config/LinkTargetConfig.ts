import LinkTargetOptionDefinition from "./LinkTargetOptionDefinition";
import DefaultTarget, { DEFAULT_TARGETS_ARRAY, getDefaultTargetDefinition, icon } from "./DefaultTarget";
import Config from "@ckeditor/ckeditor5-utils/src/config";

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
 *               //   iconCls: "link-target--custom1",
 *               //   title: "custom1",
 *               // }
 *               "custom1",
 *               {
 *                 name: "myCustomTarget",
 *                 iconCls: "link-target--custom",
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
}

/**
 * Parses a possibly existing configuration option as part of CKEditor's
 * link plugin configuration. It expects an entry `targets` which contains an
 * array of targets to offer to the editors for selection in the UI.
 *
 * @param config CKEditor configuration to parse
 */
export const parseLinkTargetConfig = (config: Config): LinkTargetOptionDefinition[] => {
  const fromConfig = config.get("link.targets");
  const result: LinkTargetOptionDefinition[] = [];
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
      if (!!defaultDefinition) {
        result.push(defaultDefinition);
      } else {
        result.push({
          name: name,
          iconCls: icon(name),
          title: name,
        });
      }
    } else if (typeof entry === "object") {
      const definition: LinkTargetOptionDefinition = {
        // Provoke a default empty name, which will fail if not set in object.
        name: "",
        ...entry,
      };
      if (!definition.name) {
        throw new Error("link.targets: Configuration entry misses required non-empty property 'name'");
      }
      // Possibly resolve default definition and add missing properties.
      const defaultDefinition = getDefaultTargetDefinition(definition.name);
      if (!definition.iconCls) {
        definition.iconCls = defaultDefinition?.iconCls || icon(definition.name);
      }
      if (!definition.title) {
        definition.title = defaultDefinition?.title || definition.name;
      }
      result.push(definition);
    } else {
      throw new Error(
        `link.targets: Unexpected entry ${JSON.stringify(entry)} in configuration ${JSON.stringify(fromConfig)}`
      );
    }
  });

  return result;
};

export default LinkTargetConfig;
