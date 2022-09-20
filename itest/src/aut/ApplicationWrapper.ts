/* eslint no-null/no-null: off */

import express from "express";
import path from "path";
import { Response } from "playwright";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import { AddressInfo } from "net";
import { ApplicationConsole } from "./ApplicationConsole";
import { MockContentPluginWrapper } from "./MockContentPluginWrapper";
import { ContextualBalloonWrapper } from "./ContextualBalloonWrapper";
import { MockServiceAgentPluginWrapper } from "./services/MockServiceAgentPluginWrapper";

/**
 * Represents result from starting the server.
 */
interface StartResult {
  baseUrl: URL;
  indexUrl: URL;
  shutdown: () => Promise<void>;
}

/**
 * Type-guard, to check, whether given value represents an address information
 * holding a port.
 *
 * @param value - value to validate
 */
const isAddressInfo = (value: unknown): value is Pick<AddressInfo, "port"> => {
  return typeof value === "object" && value !== null && value.hasOwnProperty("port");
};

/**
 * Starts an HTTP server via Express, statically bound to the path of the
 * example application. Requires the application to be build prior to
 * running the tests.
 */
const startServer = async (): Promise<StartResult> => {
  const applicationFolder = path.resolve("../app");
  const app = express();
  app.use("/", express.static(applicationFolder));
  const server = app.listen(0);
  const address = server.address();
  if (!isAddressInfo(address)) {
    throw new Error(`Incompatible address information. Expected AddressInfo but is: ${address} (${typeof address})`);
  }
  const { port } = address;
  const baseUrl = new URL(`http://localhost:${port}/`);
  const indexUrl = new URL("/sample/index.html", baseUrl);
  const shutdown = async () => {
    await browser.close();
    server.close();
    console.info("Done Browser & Server shutdown triggered.");
  };

  console.info(`Server started: Base: ${baseUrl}, Index: ${indexUrl}`);
  return { baseUrl, indexUrl, shutdown };
};

/**
 * Provides access to the example application. For startup, consider using
 * `ApplicationWrapper.start` and ensure to call `ApplicationWrapper.shutdown`
 * when done.
 */
export class ApplicationWrapper {
  readonly #url: URL;
  readonly #shutdown: () => Promise<void>;
  readonly #console: ApplicationConsole;

  /**
   * Initializes the wrapper with the index URL to open on `goto`.
   *
   * @param url - the URL to open
   * @param shutdown - shutdown server callback
   */
  constructor(url: URL, shutdown: () => Promise<void>) {
    this.#url = url;
    this.#console = new ApplicationConsole(page);
    this.#shutdown = shutdown;
  }

  /**
   * Starts the application and provides a wrapper to interact with
   * the example application.
   */
  static async start(): Promise<ApplicationWrapper> {
    const { indexUrl, shutdown } = await startServer();
    return new ApplicationWrapper(indexUrl, shutdown);
  }

  /**
   * Shutdown HTTP server.
   */
  async shutdown(): Promise<void> {
    await this.#shutdown();
  }

  /**
   * Go to CKEditor example app page.
   */
  async goto(): Promise<null | Response> {
    return page.goto(this.#url.toString());
  }

  get console(): ApplicationConsole {
    return this.#console;
  }

  /**
   * Retrieve editor instance.
   */
  get editor(): ClassicEditorWrapper {
    return ClassicEditorWrapper.fromPage(page);
  }

  /**
   * Retrieves the now opened ContextualBalloon.
   *
   * @returns ContextualBalloonWrapper the now opened ContextualBalloon
   */
  get contextualBalloon(): ContextualBalloonWrapper {
    return new ContextualBalloonWrapper(page);
  }

  /**
   * Provides access to mock content plugin.
   *
   * While essentially being configured as plugin to CKEditor, this getter
   * is meant has high-level shortcut for mocking contents right from the
   * application wrapper.
   */
  get mockContent(): MockContentPluginWrapper {
    return MockContentPluginWrapper.fromClassicEditor(this.editor);
  }

  get mockServiceAgent(): MockServiceAgentPluginWrapper {
    return MockServiceAgentPluginWrapper.fromClassicEditor(this.editor);
  }
}
