import type {
  InputExampleElement,
  MockContentConfig,
  MockExternalContent,
} from "@coremedia-internal/ckeditor5-coremedia-studio-integration-mock";

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
};
