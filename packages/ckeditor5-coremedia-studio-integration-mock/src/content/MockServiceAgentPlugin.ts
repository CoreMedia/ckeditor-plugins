import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { serviceAgent } from "@coremedia/service-agent";
import WorkAreaServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import MockWorkAreaService from "./MockWorkAreaService";

const PLUGIN_NAME = "MockServiceAgent";

class MockServiceAgentPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;

  async getMockWorkAreaService(): Promise<MockWorkAreaService> {
    const workAreaService = await serviceAgent.fetchService(new WorkAreaServiceDescriptor());
    return workAreaService as MockWorkAreaService;
  }
}

export default MockServiceAgentPlugin;
