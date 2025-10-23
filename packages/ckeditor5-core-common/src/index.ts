/**
 * @module ckeditor5-core-common
 */

export {} from "./Commands";
export {
  getOptionalPlugin,
  reportInitEnd,
  reportInitStart,
  type InitInformation,
  type OnMissingPlugin,
} from "./Plugins";
export { addTranslations, openLink } from "./utils";
export type { CommandHandler } from "./Commands";
export { disableCommand, enableCommand, ifCommand, optionalCommandNotFound, recommendCommand } from "./Commands";
