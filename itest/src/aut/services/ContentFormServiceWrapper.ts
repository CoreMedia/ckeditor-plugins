import type { MockContentFormService } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import { JSWrapper } from "../JSWrapper";
import type { MockServiceAgentPluginWrapper } from "./MockServiceAgentPluginWrapper";

export class ContentFormServiceWrapper extends JSWrapper<MockContentFormService> {
  /**
   * Retrieves the lastOpenedEntities from the MockContentFormService.
   * For testing purposes the MockContentFormService stores the entities which were triggered to open
   * latest.
   */
  async getLastOpenedEntities(): Promise<unknown[]> {
    return this.evaluate((service: MockContentFormService): unknown[] => service.getLastOpenedEntities());
  }

  /**
   * Provides access to the MockContentFormService.
   *
   * @param pluginWrapper - the plugin wrapper
   */
  static fromServiceAgentPlugin(pluginWrapper: MockServiceAgentPluginWrapper) {
    const instance = pluginWrapper.evaluateHandle((plugin) => plugin.getContentFormService());
    return new ContentFormServiceWrapper(instance);
  }
}
