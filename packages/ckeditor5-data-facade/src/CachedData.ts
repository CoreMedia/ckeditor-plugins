import { SetDataData, SetDataOptions } from "./DataControllerApi";
import { DataContextOptions } from "./DataContextOptions";

/**
 * Represents cached data. In the context of the data facade feature, these
 * are meant to be exposed in favor of the data hold within CKEditor 5, when
 * we expect the data to be unchanged, yet.
 */
export interface CachedData {
  /**
   * The original set data.
   */
  data: SetDataData;
  /**
   * The original options used when setting the data.
   */
  options: SetDataOptions & DataContextOptions;
  /**
   * The internal version number of the CKEditor 5 model, that we know is
   * representing the original set data. If on get, we see, that current
   * version in the model and this version match, we will favor returning the
   * cached data instead.
   */
  version?: number;
}
