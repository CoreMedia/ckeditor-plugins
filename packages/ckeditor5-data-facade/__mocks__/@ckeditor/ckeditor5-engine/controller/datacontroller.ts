import { Model } from "../model/model";

export class DataController {
  #data: string | Record<string, string> = "";
  #options: object = {};

  readonly model;

  constructor(model: Model) {
    this.model = model;
  }

  set(data: string | Record<string, string>, options: object = {}): void {
    this.#data = data;
    this.#options = options;
    this.model.document.version++;
  }

  get(
    options: {
      rootName?: string;
      trim?: "empty" | "none";
    } = {},
  ): string {
    const { rootName = "main", trim = "empty" } = options;
    const data = this.#data;

    if (typeof data === "string") {
      if (rootName === "main") {
        return trim === "none" ? data : data.trim();
      }
      throw new Error(`MockError: Unsupported rootName ${rootName} for string data.`);
    }
    if (data.hasOwnProperty(rootName)) {
      const rootData = data[rootName];
      return trim === "none" ? rootData : rootData.trim();
    }
    throw new Error(`MockError: No data available for rootName ${rootName}.`);
  }
}
