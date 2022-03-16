import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import MockContent, {
  asStaticContent,
  isMockContentConfigs,
  MockContentConfig,
  withContentDefaults,
} from "./MockContent";
import Delayed from "./Delayed";
import { isObject } from "./MockContentUtils";
import { numericId, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { PREDEFINED_MOCK_CONTENTS } from "./PredefinedMockContents";

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

type ContentsById = Map<number, MockContentConfig>;

/**
 * Function to resolve an ID or URI Path to a `MockContent`.
 */
interface MockContentProvider {
  (idOrUriPath: number | UriPath): MockContent;
}

/**
 * Default provider will just serve static contents without respecting any
 * configuration.
 */
const defaultMockContentProvider: MockContentProvider = (idOrUriPath: number | UriPath): MockContent => {
  let id: number;
  if (typeof idOrUriPath === "string") {
    id = numericId(idOrUriPath);
  } else {
    id = idOrUriPath;
  }
  return asStaticContent(id);
};

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
    // For testing with empty names, we ensure, that this folder is linkable.
    linkable: true,
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
  static readonly #defaultContents: MockContentConfig[] = [
    MockContentPlugin.#rootFolderConfig,
    // Easier to prefill some mock contents here.
    ...PREDEFINED_MOCK_CONTENTS,
  ];
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
    let combinedConfigs: MockContentConfig[];

    if (isMockContentConfigs(config)) {
      // The order is important, as we want to allow overriding default contents by config.
      combinedConfigs = [...MockContentPlugin.#defaultContents, ...config];
    } else {
      logger.error(`Ignoring invalid configuration at ${CONTENTS_CONFIG_PATH}.`, config);
      combinedConfigs = MockContentPlugin.#defaultContents;
    }

    combinedConfigs.forEach((contentConfig: MockContentConfig): void => {
      const { id } = contentConfig;
      this.#registeredContents.set(id, contentConfig);
    });

    const pluralize = (term: string, count: number): string => `${term}${count === 1 ? "" : "s"}`;

    if (logger.isDebugEnabled()) {
      // Sorted by ID is more convenient to lookup possible IDs to use.
      const sortedMocks = new Map<number, MockContentConfig>(
        [...this.#registeredContents].sort(([id1], [id2]) => id1 - id2)
      );
      const len = sortedMocks.size;
      // Intentional logging-guard quirk: We want to be more verbose, when debug logging is activated.
      logger.info(`Initially available Custom Content ${pluralize("Mock", len)} (${len}):`, [...sortedMocks.values()]);
    } else if (logger.isInfoEnabled()) {
      const sortedMocks = [...this.#registeredContents.keys()].sort();
      const len = sortedMocks.length;
      logger.info(`Initially available Custom Content ${pluralize("Mock", len)} (${len}) with IDs:`, sortedMocks);
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
   * Add well-known contents by ID. This overrides any possible default or
   * previously registered content state.
   */
  addContents(...configs: MockContentConfig[]): void {
    configs.forEach((config) => this.#registeredContents.set(config.id, config));
  }

  /**
   * Validates, if a content of given ID or URI path is explicitly available.
   * If not, methods such as `getContent` will provide some default content
   * instead.
   *
   * @param idOrUriPath - numeric ID or URI path to validate
   */
  readonly hasExplicitContent = (idOrUriPath: number | UriPath): boolean => {
    const registeredContents = this.#registeredContents;
    const id = numericId(idOrUriPath);
    return registeredContents.has(id);
  };

  /**
   * Validates, if a content of given ID or URI path is explicitly available.
   * If not, this method will escalate with an Error.
   *
   * If this method fails, you should validate, if the default mock contents
   * provided here have been modified, or if you forgot calling `addContents`
   * before.
   *
   * @param idOrUriPath - numeric ID or URI path to validate
   * @returns the provided ID or URI path to validate as is
   * @throws Error if the content is not explicitly defined.
   */
  readonly requireExplicitContent = <T extends number | UriPath>(idOrUriPath: T): T => {
    if (!this.hasExplicitContent(idOrUriPath)) {
      throw new Error(`Required explicitly defined content ${idOrUriPath} is missing.`);
    }
    return idOrUriPath;
  };

  /**
   * Retrieve a content representation. The representation is either retrieved
   * from configuration or some static content with reasonable defaults is
   * provided.
   */
  readonly getContent = (idOrUriPath: number | UriPath): MockContent => {
    const registeredContents = this.#registeredContents;
    const id = numericId(idOrUriPath);
    return this.#addDefaults(registeredContents.get(id)) ?? asStaticContent(id);
  };
}

export default MockContentPlugin;
export { CONFIG_KEY as COREMEDIA_MOCK_CONTENT_PLUGIN, MockContentProvider, defaultMockContentProvider };
