import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import MockContent from "./MockContent";
import { defaultMockContentProvider } from "./MockContentPlugin";

const PLUGIN_NAME = "MockExternalContent";

interface MockExternalContent {
  uri: string;
  contentAfterImport: MockContent;
}

type ExternalContentsByUri = Map<string, MockExternalContent>;

export default class MockExternalContentPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);
  #registeredExternalContents: ExternalContentsByUri = new Map<string, MockExternalContent>();

  /**
   * Initialize Plugin.
   */
  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    this.#initExternalContents();

    reportInitEnd(initInformation);
  }

  addExternalContent(externalContent: MockExternalContent): void {
    this.#registeredExternalContents.set(externalContent.uri, externalContent);
  }

  externalContentExist(uri: string): boolean {
    return this.#registeredExternalContents.has(uri);
  }

  getExternalContent(uri: string): MockExternalContent | undefined {
    return this.#registeredExternalContents.get(uri);
  }

  #initExternalContents() {
    const mockContent = defaultMockContentProvider("content/1234566");
    this.addExternalContent({
      uri: "externalUri/12345",
      contentAfterImport: mockContent,
    });
  }
}
