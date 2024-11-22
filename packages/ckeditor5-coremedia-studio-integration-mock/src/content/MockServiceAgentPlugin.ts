import { Plugin } from "ckeditor5";
import { serviceAgent } from "@coremedia/service-agent";
import {
  createWorkAreaServiceDescriptor,
  createBlocklistServiceDescriptor,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import MockWorkAreaService from "./MockWorkAreaService";
import { MockBlocklistService } from "../MockBlocklistService";

const PLUGIN_NAME = "MockServiceAgent";

class MockServiceAgentPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;

  async getMockWorkAreaService(): Promise<MockWorkAreaService> {
    const workAreaService = await serviceAgent.fetchService(createWorkAreaServiceDescriptor());
    return workAreaService as MockWorkAreaService;
  }

  async getMockBlocklistService(): Promise<MockBlocklistService> {
    const blocklistService = await serviceAgent.fetchService(createBlocklistServiceDescriptor());
    return blocklistService as MockBlocklistService;
  }
}

export default MockServiceAgentPlugin;
