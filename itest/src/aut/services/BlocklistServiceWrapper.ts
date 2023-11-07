import { JSWrapper } from "../JSWrapper";
import MockBlocklistService from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/MockBlocklistService";
import { MockServiceAgentPluginWrapper } from "./MockServiceAgentPluginWrapper";

export class BlocklistServiceWrapper extends JSWrapper<MockBlocklistService> {
  async addWord(word: string): Promise<void> {
    await this.evaluate((plugin, word) => plugin.addToBlocklist(word), word);
  }

  static fromServiceAgentPlugin(pluginWrapper: MockServiceAgentPluginWrapper) {
    const instance = pluginWrapper.evaluateHandle((plugin) => plugin.getMockBlocklistService());
    return new BlocklistServiceWrapper(instance);
  }
}
