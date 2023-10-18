/**
 * @module ckeditor5-data-facade
 */

export { ContextMismatchError, isContextMismatchError } from "./ContextMismatchError";

export type { DataApi, GetDataApi, SetDataApi } from "./DataApi";

export type { DataContextOptions } from "./DataContextOptions";

export type {
  GetDataType,
  GetDataOptions,
  GetDataParameters,
  SetDataData,
  SetDataOptions,
  SetDataParameters,
  SetDataType,
  DataControllerInstance,
} from "./DataControllerApi";

export { DataFacade } from "./DataFacade";

export type { DataFacadeConfig, Save } from "./DataFacadeConfig";

export { DataFacadeController } from "./DataFacadeController";


import "./augmentation";
