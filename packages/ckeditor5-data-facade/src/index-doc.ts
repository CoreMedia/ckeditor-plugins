/**
 * This plugin handles semantic equivalence of data set and retrieved.
 *
 * @module ckeditor5-data-facade
 */

export { ContextOptions } from "./Context";
export { SetDataData, SetDataOptions, GetDataOptions } from "./DataControllerTypes";
export { DataApi } from "./DataApi";
export { DataFacade, findDataApi } from "./DataFacade";
export {
  dataUnavailable,
  DataUnavailable,
  InvalidData,
  isInvalidData,
  invalidContext,
  InvalidContext,
} from "./InvalidData";
