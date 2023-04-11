import { Plugin } from "@ckeditor/ckeditor5-core";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { MockContentConfig } from "./MockContent";
import MockContentPlugin from "./MockContentPlugin";

const PLUGIN_NAME = "MockExternalContent";

export interface MockExternalContent {
  /**
   * ID of the external content
   */
  id: number;
  /**
   * true if the content should be treated as previously imported.
   */
  isAlreadyImported: boolean;

  /**
   * The content how it exists after the import succeeded.
   * Undefined if content can't be imported (item won't be insertable).
   */
  contentAfterImport: MockContentConfig | undefined;

  /**
   * Triggers an error during import to check if error handling has been implemented.
   */
  errorWhileImporting: boolean;
}

type ExternalContentsByUri = Map<string, MockExternalContent>;

const EXTERNAL_CONTENTS: MockExternalContent[] = [
  {
    id: 2000,
    isAlreadyImported: false,
    contentAfterImport: { id: 2000, type: "linkable", name: "External Content #2000" },
    errorWhileImporting: false,
  },
  {
    id: 2002,
    isAlreadyImported: true,
    contentAfterImport: { id: 2002, type: "linkable", name: "External Content #2002" },
    errorWhileImporting: false,
  },
  {
    id: 2004,
    isAlreadyImported: false,
    contentAfterImport: { id: 2004, type: "unknown", name: "Must not appear as link, if you see this, it is an error" },
    errorWhileImporting: false,
  },
  {
    id: 2006,
    isAlreadyImported: false,
    contentAfterImport: { id: 2006, type: "linkable", name: "External Content #2006" },
    errorWhileImporting: true,
  },
];

export default class MockExternalContentPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);
  #registeredExternalContents: ExternalContentsByUri = new Map<string, MockExternalContent>();
  static readonly requires = [MockContentPlugin];

  /**
   * Initialize Plugin.
   */
  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    this.#initExternalContents();

    reportInitEnd(initInformation);
  }

  addExternalContent(externalContent: MockExternalContent): void {
    this.#registeredExternalContents.set(`externalUri/${externalContent.id}`, externalContent);
  }

  addExternalContents(externalContents: MockExternalContent[]): void {
    externalContents.forEach((externalContent) => this.addExternalContent(externalContent));
  }

  externalContentExist(uri: string): boolean {
    return this.#registeredExternalContents.has(uri);
  }

  getExternalContent(uri: string): MockExternalContent | undefined {
    return this.#registeredExternalContents.get(uri);
  }

  #initExternalContents() {
    const plugins = this.editor.plugins;
    const mockContentPlugin: MockContentPlugin = plugins.get(MockContentPlugin.pluginName) as MockContentPlugin;

    EXTERNAL_CONTENTS.forEach((config) => {
      if (config.isAlreadyImported && config.contentAfterImport) {
        mockContentPlugin.addContents(config.contentAfterImport);
      }
      this.addExternalContent(config);
    });
  }
}
