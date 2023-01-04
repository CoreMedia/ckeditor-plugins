import { serviceDescriptorFactory, ServiceDescriptorWithProps } from "@coremedia/service-agent";

export interface BeanReferenceToUriService {
  resolveUris(beanReferences: string): Promise<string[]>;
}

/**
 * Descriptor used to fetch service from service agent.
 */
export const createBeanReferenceToUriServiceDescriptor = (): ServiceDescriptorWithProps<BeanReferenceToUriService> =>
  serviceDescriptorFactory<BeanReferenceToUriService>({
    name: "beanReferenceToUriService",
  });
