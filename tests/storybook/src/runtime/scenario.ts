import type {
  InputExampleElement,
  MockContentConfig,
  MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";
import type { ScenarioOutput } from "@coremedia/ckeditor5-itest-constants";

export type { ScenarioOutput };

/**
 * A single item a scenario writes to the browser clipboard while mounting, so a
 * test can paste a fully prepared payload without itself calling
 * `page.evaluate`.
 */
export interface ClipboardScenarioItem {
  /**
   * MIME type of the clipboard payload, e.g. `"text/html"`.
   */
  type: string;
  /**
   * The payload written to the clipboard under {@link type}.
   */
  content: string;
}

/**
 * Data type a story should initialize the editor with. Mirrors the former
 * application `dataType` hash parameter.
 */
export type ScenarioDataType = "richtext" | "bbcode";

/**
 * UI language for the editor instance. Mirrors the former application
 * `uiLanguage` hash parameter.
 */
export type ScenarioUiLanguage = "en" | "de";

/**
 * Declarative description of everything a story needs to set up a test
 * scenario. This is the contract that replaces the imperative wrapper-based
 * setup previously performed inside Playwright tests (for example
 * `ApplicationWrapper`, `MockContentPluginWrapper`,
 * `MockExternalContentPluginWrapper`).
 *
 * A story consumes these as Storybook _args_, so a scenario can be configured
 * either in code (per dedicated story) or, where useful, via the story URL.
 */
export interface ScenarioArgs {
  /**
   * Which editor flavor to mount. Defaults to `"richtext"`.
   */
  dataType: ScenarioDataType;
  /**
   * Initial editor data to load (CoreMedia RichText XML or BBCode), matching
   * the configured `dataType`. Defaults to empty data.
   */
  data: string;
  /**
   * UI language of the editor instance. Defaults to `"en"`.
   */
  uiLanguage: ScenarioUiLanguage;
  /**
   * Whether the editor starts in read-only mode. Defaults to `false`.
   */
  readOnly: boolean;
  /**
   * Mock contents to register with the mock studio backend before the editor
   * loads data. Replaces `MockContentPluginWrapper.addContents`.
   */
  mockContents: MockContentConfig[];
  /**
   * Mock external contents to register with the mock studio backend. Replaces
   * `MockExternalContentPluginWrapper.addContents`.
   */
  mockExternalContents: MockExternalContent[];
  /**
   * Words to pre-register with the mock blocklist service before the editor
   * loads data. Replaces per-test `addBlockedWord` calls.
   */
  blockedWords: string[];
  /**
   * Draggable input-example elements to create as drag/paste sources when the
   * scenario mounts. Replaces per-test `addInputExampleElement` calls.
   */
  inputExampleElements: InputExampleElement[];
  /**
   * Observable outputs the scenario should render as locator-readable DOM, so
   * tests can read live editor/service values without `page.evaluate`. Empty by
   * default (no harness rendered).
   */
  outputs: ScenarioOutput[];
  /**
   * Content uris evaluated for the `is-droppable-state` /
   * `is-droppable-in-link-balloon` outputs. Only relevant when those outputs are
   * requested.
   */
  droppableUris: string[];
  /**
   * When set, the scenario writes this item to the browser clipboard while
   * mounting, so a test can paste a fully prepared payload (e.g. a Word HTML
   * document) without itself calling `page.evaluate`. Requires the browser
   * context to grant the `clipboard-write` permission (the Playwright config
   * does). Defaults to `null` (no clipboard write).
   */
  clipboard: ClipboardScenarioItem | null;
}

/**
 * Default scenario args. Stories spread these and override only what they need.
 */
export const defaultScenarioArgs: ScenarioArgs = {
  dataType: "richtext",
  data: "",
  uiLanguage: "en",
  readOnly: false,
  mockContents: [],
  mockExternalContents: [],
  blockedWords: [],
  inputExampleElements: [],
  outputs: [],
  droppableUris: [],
  clipboard: null,
};
