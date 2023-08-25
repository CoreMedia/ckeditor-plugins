/**
 * @module ckeditor5-data-facade
 */

export type { ContextOptions } from "./Context";
export { SetDataData, SetDataOptions, GetDataOptions } from "./DataControllerTypes";
export { DataApi } from "./DataApi";
export { DataFacade, findDataApi } from "./DataFacade";
export {
  dataUnavailable,
  type DataUnavailable,
  type InvalidData,
  isInvalidData,
  invalidContext,
  type InvalidContext,
} from "./InvalidData";

import "./augmentation";
