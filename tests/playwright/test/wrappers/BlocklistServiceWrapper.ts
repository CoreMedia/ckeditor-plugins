import type { MockBlocklistService } from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { JSWrapper } from "./JSWrapper.ts";
import type { MockServiceAgentPluginWrapper } from "./MockServiceAgentPluginWrapper.ts";

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
