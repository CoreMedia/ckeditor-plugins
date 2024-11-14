import { JSWrapper } from "../JSWrapper";
import type { MockWorkAreaService } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import { MockServiceAgentPluginWrapper } from "./MockServiceAgentPluginWrapper";

export class WorkAreaServiceWrapper extends JSWrapper<MockWorkAreaService> {
  /**
   * Retrieves the lastOpenedEntities from the MockWorkAreaService.
   * For testing purposes the MockWorkAreaService stores the entities which were triggered to open
   * latest.
   */
  async getLastOpenedEntities(): Promise<unknown[]> {
    return this.evaluate((service: MockWorkAreaService): unknown[] => service.getLastOpenedEntities());
  }

  /**
   * Provides access to the MockWorkAreaService.
   *
   * @param pluginWrapper - the plugin wrapper
   */
  static fromServiceAgentPlugin(pluginWrapper: MockServiceAgentPluginWrapper) {
    const instance = pluginWrapper.evaluateHandle((plugin) => plugin.getMockWorkAreaService());
    return new WorkAreaServiceWrapper(instance);
  }
}
