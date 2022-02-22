import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import MockContent, {
  asStaticContent,
  isMockContentConfigs,
  MockContentConfig,
  withContentDefaults,
} from "./MockContent";
import Delayed from "./Delayed";
import { isObject } from "./MockContentUtils";
import { numericId, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";

/**
 * If states shall change, it will be done with this fixed
 * interval (in milliseconds).
 */
const DEFAULT_CHANGE_DELAY_MS = 10000;

const PLUGIN_NAME = "MockContent";
const CONFIG_KEY = "coremedia:mock-content";
const DEFAULTS_CONFIG_KEY = "defaults";
const DEFAULTS_CONFIG_PATH = `${CONFIG_KEY}.${DEFAULTS_CONFIG_KEY}`;
const CONTENTS_CONFIG_KEY = "contents";
const CONTENTS_CONFIG_PATH = `${CONFIG_KEY}.${CONTENTS_CONFIG_KEY}`;

/**
 * Example Blob Fixture for 10×10 red PNG.
 */
const PNG_RED_10x10_2 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAABJJREFUGNNj/M+ADzAxjEpjAQBBLAETZWIQMwAAAABJRU5ErkJggg==";
/**
 * Example Blob Fixture for 10×10 green PNG.
 */
const PNG_GREEN_10x10 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAABRJREFUGNNjZPjPgAcwMTCMSmMCAEAtARMGRTsOAAAAAElFTkSuQmCC";
/**
 * Example Blob Fixture for 10×10 blue PNG.
 */
const PNG_BLUE_10x10 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAIAAAACUFjqAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAABVJREFUGNNjZGD4z4AbMDHgBSNVGgA/LgETzitWmwAAAABJRU5ErkJggg==";

type ContentsById = Map<number, MockContentConfig>;

/**
 * Plugin, which manages mocking contents. Contents may be pre-defined by ID
 * in CKEditor configuration, or they may be defined on the fly via
 * `addContent`.
 *
 * `getContent` will either provide one of these registered contents or
 * fallback to some default behavior, which will be a static content of
 * reasonable state.
 *
 * @example
 * ```typescript
 * ClassicEditor
 *     .create( document.querySelector( '#editor' ), {
 *         'coremedia:mock-content': {
 *             defaults: {
 *               initialDelayMs: 0,
 *               changeDelayMs: 10000,
 *             },
 *             contents: [
 *               { id: 2, name: 'Static Name' },
 *               { id: 4, name: 'An Article', type: 'CMArticle' },
 *               // Will toggle names back and forth.
 *               { id: 6, name: ['First Name', 'Second Name'] },
 *               // Very Fast: Will toggle names back and forth.
 *               { id: 8, name: ['First Name', 'Second Name'], changeDelayMs: 1 },
 *               // Represents a checked out document.
 *               { id: 10, editing: true },
 *               // Represents a document, which is being worked on.
 *               { id: 12, editing: [true, false] },
 *               // Represents an unreadable document.
 *               { id: 14, readable: false },
 *               // Represents a document changing readable state.
 *               { id: 16, readable: [ false, true ] },
 *             ]
 *         },
 *     } )
 *     .then( ... )
 *     .catch( ... );
 * ```
 */
class MockContentPlugin extends Plugin {
  static readonly pluginName: string = PLUGIN_NAME;
  static readonly #logger: Logger = LoggerProvider.getLogger(PLUGIN_NAME);
  /**
   * The root folder is predefined with ID 1 and (as in CoreMedia CMS) has
   * an empty name.
   */
  static readonly #rootFolderConfig: MockContentConfig = {
    id: 1,
    name: "",
    type: "folder",
  };
  /**
   * Default timings to apply.
   */
  static readonly #defaultDefaults: Delayed = {
    initialDelayMs: 0,
    changeDelayMs: DEFAULT_CHANGE_DELAY_MS,
  };
  /**
   * The pre-defined contents we provide by default.
   */
  static readonly #defaultContents: MockContentConfig[] = [MockContentPlugin.#rootFolderConfig];
  /**
   * All registered contents.
   */
  readonly #registeredContents: ContentsById = new Map<number, MockContentConfig>();
  /**
   * Defaults to apply to provided contents like especially the default change
   * delay.
   */
  #defaults = MockContentPlugin.#defaultDefaults;

  /**
   * Plugin constructor.
   */
  constructor(editor: Editor) {
    super(editor);

    editor.config.define(CONFIG_KEY, {
      [CONTENTS_CONFIG_KEY]: MockContentPlugin.#defaultContents,
      [DEFAULTS_CONFIG_KEY]: MockContentPlugin.#defaultDefaults,
    });
  }

  /**
   * Initialize Plugin.
   */
  init(): Promise<void> | null {
    const logger = MockContentPlugin.#logger;
    const pluginName = MockContentPlugin.pluginName;

    const startTimestamp = performance.now();

    logger.info(`Initializing ${pluginName}...`);

    this.#initContents();
    this.#initDefaults();

    logger.info(`Initialized ${pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }

  /**
   * Initializes contents from configuration.
   */
  #initContents(): void {
    const logger = MockContentPlugin.#logger;
    const { editor } = this;
    const config = editor.config.get(CONTENTS_CONFIG_PATH);
    const ids: number[] = [];

    if (!isMockContentConfigs(config)) {
      throw new Error(`Invalid configuration at ${CONTENTS_CONFIG_PATH}.`);
    }

    config.forEach((contentConfig: MockContentConfig): void => {
      const { id } = contentConfig;
      this.#registeredContents.set(id, contentConfig);
      ids.push(id);
    });

    if (ids.length > 0) {
      logger.debug("No custom content mocks configured.");
    } else {
      logger.info(`Custom Content Mocks for ${ids.length} IDs: ${ids.sort().join(", ")}`);
    }
  }

  /**
   * Initializes content defaults from configuration.
   */
  #initDefaults(): void {
    const { editor } = this;
    const config = editor.config.get(DEFAULTS_CONFIG_PATH);
    if (!isObject(config)) {
      return;
    }
    this.#defaults = { ...this.#defaults, ...config };
  }

  /**
   * If `config` is defined, enriches it by default settings.
   *
   * @param config - configuration to possibly extend
   * @returns `undefined` iff. `config` is `undefined`, otherwise enriched mock content
   */
  #addDefaults(config: MockContentConfig | undefined): MockContent | undefined {
    if (!config) {
      return undefined;
    }
    return withContentDefaults({ ...this.#defaults, ...config });
  }

  /**
   * Add a well-known content by ID. This overrides any possible default or
   * previously registered content state.
   */
  addContent(config: MockContentConfig): void {
    this.#registeredContents.set(config.id, config);
  }

  /**
   * Retrieve a content representation. The representation is either retrieved
   * from configuration or some static content with reasonable defaults is
   * provided.
   */
  getContent(idOrUriPath: number | UriPath): MockContent {
    let id: number;
    if (typeof idOrUriPath === "string") {
      id = numericId(idOrUriPath);
    } else {
      id = idOrUriPath;
    }
    const addDefaults = this.#addDefaults;
    return addDefaults(this.#registeredContents.get(id)) ?? asStaticContent(id);
  }
}

export default MockContentPlugin;
export { CONFIG_KEY as MOCK_CONTENT_PLUGIN, PNG_RED_10x10_2, PNG_GREEN_10x10, PNG_BLUE_10x10 };
