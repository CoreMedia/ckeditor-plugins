import { ServiceDescriptor } from "@coremedia/studio-apps-service-agent";
import WorkAreaService from "./studioservices/WorkAreaService";

/**
 * Descriptor used to fetch service from service agent.
 */
class WorkAreaServiceDescriptor implements ServiceDescriptor<WorkAreaService> {
  constructor() {
    this.name = "workAreaService";
  }

  name: string;
}

export default WorkAreaServiceDescriptor;
