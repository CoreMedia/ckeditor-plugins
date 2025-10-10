import type { MockBlocklistService } from "@coremedia/ckeditor5-coremedia-studio-integration-mock";
import { JSWrapper } from "../JSWrapper";
import { MockServiceAgentPluginWrapper } from "./MockServiceAgentPluginWrapper";

export class BlocklistServiceWrapper extends JSWrapper<MockBlocklistService> {
  async addWord(word: string): Promise<void> {
    await this.evaluate(async (plugin, word) => {
      await plugin.addToBlocklist(word);
    }, word);
  }

  static fromServiceAgentPlugin(pluginWrapper: MockServiceAgentPluginWrapper) {
    const instance = pluginWrapper.evaluateHandle((plugin) => plugin.getMockBlocklistService());
    return new BlocklistServiceWrapper(instance);
  }
}
