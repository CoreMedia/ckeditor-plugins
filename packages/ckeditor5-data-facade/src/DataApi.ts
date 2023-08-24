import { GetDataOptions, SetDataData, SetDataOptions } from "./DataControllerTypes";
import { ContextOptions } from "./Context";
import { InvalidData } from "./InvalidData";

/**
 * Data API to control in- and output to an instance of CKEditor 5.
 */
export interface DataApi {
  /**
   * Sets the data at an instance of CKEditor 5.
   *
   * @param data - data to set
   * @param options - options for setting the data
   */
  setData(data: SetDataData, options?: SetDataOptions & ContextOptions): void;

  /**
   * Gets the data from an instance of CKEditor 5.
   *
   * @param options - options for getting the data
   * @returns the data or some signal for invalid data, if supported by implementation
   */
  getData(options?: GetDataOptions & ContextOptions): string | InvalidData;
}
