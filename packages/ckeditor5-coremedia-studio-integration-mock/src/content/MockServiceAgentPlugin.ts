import { Plugin } from "ckeditor5";
import { serviceAgent } from "@coremedia/service-agent";
import {
  createContentFormServiceDescriptor,
  createBlocklistServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import MockContentFormService from "./MockContentFormService";
import { MockBlocklistService } from "../MockBlocklistService";

const PLUGIN_NAME = "MockServiceAgent";

class MockServiceAgentPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;

  async getContentFormService(): Promise<MockContentFormService> {
    const contentFormService = await serviceAgent.fetchService(createContentFormServiceDescriptor());
    return contentFormService as MockContentFormService;
  }

  async getMockBlocklistService(): Promise<MockBlocklistService> {
    const blocklistService = await serviceAgent.fetchService(createBlocklistServiceDescriptor());
    return blocklistService as MockBlocklistService;
  }
}

export default MockServiceAgentPlugin;
