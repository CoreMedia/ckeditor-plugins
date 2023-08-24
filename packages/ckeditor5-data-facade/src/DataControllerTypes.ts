import type { DataController } from "@ckeditor/ckeditor5-engine";

/**
 * Instance type of the DataController.
 */
export type DataControllerInstance = InstanceType<typeof DataController>;
/**
 * Type of method for setting data.
 */
export type SetDataType = DataControllerInstance["set"];
/**
 * Type of method for getting data.
 */
export type GetDataType = DataControllerInstance["get"];
/**
 * Parameters for setting data.
 */
export type SetDataParameters = Parameters<SetDataType>;
/**
 * Parameters for getting data.
 */
export type GetDataParameters = Parameters<GetDataType>;
/**
 * Type for `data` when setting data.
 */
export type SetDataData = SetDataParameters[0];
/**
 * Type for `options` when setting data.
 */
export type SetDataOptions = SetDataParameters[1];
/**
 * Type for `options` when getting data.
 */
export type GetDataOptions = GetDataParameters[0];
