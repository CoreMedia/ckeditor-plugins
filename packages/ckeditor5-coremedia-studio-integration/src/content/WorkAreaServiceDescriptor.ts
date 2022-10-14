import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";
import WorkAreaService from "./studioservices/WorkAreaService";

/**
 * Descriptor used to fetch service from service agent.
 */
export const createWorkAreaServiceDescriptor = (): ServiceDescriptorWithProps<WorkAreaService> =>
  serviceDescriptorFactory<WorkAreaService>({
    name: "workAreaService",
  });
