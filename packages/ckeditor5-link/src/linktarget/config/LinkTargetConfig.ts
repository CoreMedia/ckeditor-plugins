import LinkTargetOptionDefinition from "./LinkTargetOptionDefinition";
import DefaultTarget, {
  DEFAULT_TARGETS,
  DEFAULT_TARGETS_ARRAY,
  getDefaultTargetDefinition,
  icon,
} from "./DefaultTarget";
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

interface ParsedLinkTargetConfig {
  [key: string]: LinkTargetOptionDefinition;
}

// TODO: Continue here... is this a config, we may now use?
export const parseLinkTargetConfig = (config: Config): LinkTargetOptionDefinition[] => {
  const fromConfig = config.get("link.targets");
  const result: LinkTargetOptionDefinition[] = [];
  if (!fromConfig) {
    return DEFAULT_TARGETS_ARRAY;
  }
  if (Array.isArray(fromConfig)) {
    const targetsArray: unknown[] = fromConfig;
    targetsArray.forEach((entry: unknown): void => {
      if (typeof entry === "string") {
        const name = entry;
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
          throw new Error("link.targets configuration entry misses required property 'name'");
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
      }
    });
  }
  return result;
};
export default LinkTargetConfig;
