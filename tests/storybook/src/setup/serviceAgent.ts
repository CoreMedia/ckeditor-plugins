import type { Editor } from "ckeditor5";
import {
  MockServiceAgentPlugin,
  type MockBlocklistService,
  type MockContentFormService,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import { ensurePluginLoaded } from "./plugins";

const serviceAgentPlugin = (editor: Editor): MockServiceAgentPlugin => {
  ensurePluginLoaded(editor, "MockServiceAgent");
  return editor.plugins.get(MockServiceAgentPlugin);
};

/**
 * Resolves the mock content form service.
 *
 * In-page replacement for
 * `MockServiceAgentPluginWrapper.getContentFormServiceWrapper`.
 *
 * @param editor - live editor instance
 */
export const getContentFormService = (editor: Editor): Promise<MockContentFormService> =>
  serviceAgentPlugin(editor).getContentFormService();

/**
 * Reads the entities most recently triggered to be opened.
 *
 * In-page replacement for `ContentFormServiceWrapper.getLastOpenedEntities`.
 *
 * @param editor - live editor instance
 */
export const getLastOpenedEntities = async (editor: Editor): Promise<unknown[]> => {
  const service = await getContentFormService(editor);
  return service.getLastOpenedEntities();
};

/**
 * Resolves the mock blocklist service.
 *
 * In-page replacement for
 * `MockServiceAgentPluginWrapper.getBlocklistServiceWrapper`.
 *
 * @param editor - live editor instance
 */
export const getBlocklistService = (editor: Editor): Promise<MockBlocklistService> =>
  serviceAgentPlugin(editor).getMockBlocklistService();

/**
 * Pre-registers a blocked word with the mock blocklist service.
 *
 * In-page replacement for `BlocklistServiceWrapper.addWord`.
 *
 * @param editor - live editor instance
 * @param word - word to block
 */
export const addBlockedWord = async (editor: Editor, word: string): Promise<void> => {
  const service = await getBlocklistService(editor);
  await service.addToBlocklist(word);
};
