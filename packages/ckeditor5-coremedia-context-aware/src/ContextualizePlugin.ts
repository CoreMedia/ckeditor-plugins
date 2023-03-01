import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Autosave from "@ckeditor/ckeditor5-autosave/src/autosave";
import { Editor } from "@ckeditor/ckeditor5-core";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";

export default class ContextualizePlugin extends Plugin {
  static readonly pluginName: string = "ContextualizePlugin";
  static readonly requires = [Autosave];
  static readonly COREMEDIA_CONTEXTUALIZE_CONFIG_KEY = "coremedia:contextualize";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContextualizePlugin.pluginName);

  queue: { context: ContentContext; data: string }[] = [];

  init(): void | Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const contextAwareSave: ContextAwareSave = this.editor.config.get(
      `${ContextualizePlugin.COREMEDIA_CONTEXTUALIZE_CONFIG_KEY}`
    ).contextAwareSave as ContextAwareSave;
    ContextualizePlugin.#logger.debug("Context aware save method found, this method will be used for autosave");
    const autosavePlugin = this.editor.plugins.get("Autosave") as Autosave;
    autosavePlugin.adapter = {
      save(editor: Editor): Promise<unknown> {
        return contextAwareSave(editor, ContextHolder.getContext());
      },
    };
    const queue = this.queue;
    autosavePlugin.on("change:state", (info) => {
      ContextualizePlugin.#logger.debug("New state for the autosave plugin", info.source.state);
      if (queue.length === 0) {
        ContextualizePlugin.#logger.debug("No new context queued, ignore the event.");
        return;
      }
      if (info.source.state !== "synchronized") {
        ContextualizePlugin.#logger.debug("Not synchronized, nothing to do.");
        return;
      }
      const firstItem = queue[0];
      ContextualizePlugin.#logger.debug(
        "Data are synchronized, the new context and the data for the new context will be applied",
        firstItem
      );
      queue.splice(0, 1);
      ContextHolder.setContext(firstItem.context);
      info.source.editor.data.set(firstItem.data);
    });
  }

  setData(data: string, context: ContentContext): void {
    if (context.contentUri === ContextHolder.getContext()?.contentUri) {
      this.editor.data.set(data);
      return;
    }
    ContextualizePlugin.#logger.debug(
      "Set data for a new context (oldContext, newContext)",
      ContextHolder.getContext(),
      context
    );
    const autosave = this.editor.plugins.get("Autosave") as Autosave;
    ContextualizePlugin.#logger.debug("Autosave plugin state", autosave.state);
    if (autosave.state === "synchronized") {
      ContextHolder.setContext(context);
      this.editor.data.set(data);
      return;
    }

    // wait for the autosave to be synchronized.
    this.queue.push({ data, context });
  }
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ContextHolder {
  static context: ContentContext | undefined;

  static getContext(): ContentContext | undefined {
    return this.context;
  }

  static setContext(context: ContentContext): void {
    this.context = context;
  }
}

export type ContextAwareSave = (editor: Editor, context: ContentContext | undefined) => Promise<unknown>;

export interface ContentContext {
  contentUri: string;
}
