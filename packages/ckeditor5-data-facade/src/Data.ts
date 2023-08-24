import { SetDataData } from "./DataControllerTypes";

/**
 * Normalizes data to the default format within data-controller, which is
 * to default to `main` as `rootName` if data are given as string only.
 *
 * @param data - data to normalize
 * @returns normalized data
 */
export const normalizeData = (data: SetDataData): Record<string, string> => {
  // Emulate the default behavior of DataController.
  let normalizedData: Record<string, string> = {};
  if (typeof data === "string") {
    normalizedData.main = data;
  } else {
    normalizedData = data;
  }
  return normalizedData;
};
