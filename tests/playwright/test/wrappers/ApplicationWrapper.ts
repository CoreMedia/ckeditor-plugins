import type { Page } from "playwright-core";
import { MockServiceAgentPluginWrapper } from "../services/MockServiceAgentPluginWrapper";
import { ClassicEditorWrapper } from "./ClassicEditorWrapper";
import { MockContentPluginWrapper } from "./MockContentPluginWrapper";
import { MockExternalContentPluginWrapper } from "./MockExternalContentPluginWrapper";
import { MockInputExamplePluginWrapper } from "./MockInputExamplePluginWrapper";

/**
 * Provides access to the example application.
 *
 * In contrast to the former Jest/jest-playwright setup, this wrapper no longer
 * starts its own HTTP server, nor does it own navigation. The application is
 * served by the Playwright `webServer` configured in `playwright.config.ts`
 * (see `applicationUrl`) and navigation is performed by the test via
 * `await page.goto(applicationUrl)`. The wrapper only needs the `page` provided
 * by the Playwright test fixtures.
 */
export class ApplicationWrapper {
  readonly #page: Page;

  /**
   * Initializes the wrapper for the given page.
   *
   * @param page - Playwright page (from test fixtures)
   */
  constructor(page: Page) {
    this.#page = page;
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

  /**
   * Provides access to the mock service agent plugin.
   */
  get mockServiceAgent(): MockServiceAgentPluginWrapper {
    return MockServiceAgentPluginWrapper.fromClassicEditor(this.editor);
  }

  /**
   * Provides access to the mock content plugin.
   */
  get mockContent(): MockContentPluginWrapper {
    return MockContentPluginWrapper.fromClassicEditor(this.editor);
  }

  /**
   * Provides access to the mock external content plugin.
   */
  get mockExternalContent(): MockExternalContentPluginWrapper {
    return MockExternalContentPluginWrapper.fromClassicEditor(this.editor);
  }

  /**
   * Provides access to the mock input example plugin.
   */
  get mockInputExamplePlugin(): MockInputExamplePluginWrapper {
    return MockInputExamplePluginWrapper.fromClassicEditor(this.editor);
  }
}
