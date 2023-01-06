import { ConversionApi } from "./ConversionApi";

/**
 * Contextual information and API during DOM conversion.
 */
export class ConversionContext implements ConversionContext {
  readonly sourceNode: Node;

  readonly api: ConversionApi;

  constructor(sourceNode: Node, api: ConversionApi) {
    this.sourceNode = sourceNode;
    this.api = api;
  }
}
