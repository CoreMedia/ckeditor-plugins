import { ServiceDescriptor } from "@coremedia/service-agent";
import BlobDisplayService from "./BlobDisplayService";

/**
 * Descriptor used to fetch service from service agent.
 */
class BlobDisplayServiceDescriptor implements ServiceDescriptor<BlobDisplayService> {
  constructor() {
    this.name = "blobDisplayService";
  }

  name: string;
}

export default BlobDisplayServiceDescriptor;
