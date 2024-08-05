import { Plugin } from "ckeditor5";
import { serviceAgent } from "@coremedia/service-agent";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/WorkAreaServiceDescriptor";
import MockWorkAreaService from "./MockWorkAreaService";
import { MockBlocklistService } from "../MockBlocklistService";
import { createBlocklistServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration";
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
