import type { Page, Response } from "playwright-core";
import { applicationUrl } from "../utils/environment";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import { ApplicationConsole } from "./ApplicationConsole";

/**
 * Represents a hash parameter for urls.
 */
export interface HashParameter {
  key: string;
  value: string;
}

/**
 * Provides access to the example application.
 *
 * In contrast to the former Jest/jest-playwright setup, this wrapper no longer
 * starts its own HTTP server. The application is served by the Playwright
 * `webServer` configured in `playwright.config.ts` (see `applicationUrl`). The
 * wrapper only needs the `page` provided by the Playwright test fixtures.
 */
export class ApplicationWrapper {
  readonly #page: Page;
  readonly #url: URL;
  readonly #console: ApplicationConsole;

  /**
   * Initializes the wrapper with the index URL to open on `goto`.
   *
   * @param page - Playwright page (from test fixtures)
   * @param hashParams - hash parameters appended to the index URL
   */
  constructor(page: Page, hashParams: HashParameter[] = []) {
    this.#page = page;
    const indexUrl = new URL("/sample/index.html", applicationUrl);
    hashParams.forEach((hashParameter: HashParameter) => {
      indexUrl.hash += (indexUrl.hash ? "&" : "") + hashParameter.key + "=" + hashParameter.value;
    });
    this.#url = indexUrl;
    this.#console = new ApplicationConsole(page);
  }

  /**
   * Creates a wrapper to interact with the example application.
   *
   * @param page - Playwright page (from test fixtures)
   * @param hashParams - hash parameters appended to the index URL
   */
  static start(page: Page, hashParams: HashParameter[] = []): ApplicationWrapper {
    return new ApplicationWrapper(page, hashParams);
  }

  /**
   * Go to CKEditor example app page.
   */
  async goto(): Promise<null | Response> {
    return this.#page.goto(this.#url.toString());
  }

  get console(): ApplicationConsole {
    return this.#console;
  }

  async switchReadOnly(): Promise<void> {
    return this.#page.locator("#readOnlyMode").click();
  }

  /**
   * Retrieve editor instance.
   */
  get editor(): ClassicEditorWrapper {
    return ClassicEditorWrapper.fromPage(this.#page);
  }
}
