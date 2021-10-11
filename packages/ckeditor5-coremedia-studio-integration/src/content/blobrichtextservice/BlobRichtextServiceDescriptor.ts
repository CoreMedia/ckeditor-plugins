import { ServiceDescriptor } from "@coremedia/service-agent";
import { BlobRichtextService } from "./BlobRichtextService";

export default class BlobRichtextServiceDescriptor implements ServiceDescriptor<BlobRichtextService> {
  name: string;
  constructor() {
    this.name = "blobRichtextServiceDescriptor";
  }
}
