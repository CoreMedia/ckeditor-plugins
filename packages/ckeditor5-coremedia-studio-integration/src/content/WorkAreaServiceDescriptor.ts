import { serviceDescFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import WorkAreaService from "./studioservices/WorkAreaService";

/**
 * Descriptor used to fetch service from service agent.
 */
export function createWorkAreaServiceDescriptor(): ServiceDescriptorWithProps<WorkAreaService> {
  return serviceDescFactory<WorkAreaService>({
    name: "workAreaService",
  });
}
