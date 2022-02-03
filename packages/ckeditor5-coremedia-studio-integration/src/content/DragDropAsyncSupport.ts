import { serviceAgent } from "@coremedia/service-agent";
import RichtextConfigurationService from "./RichtextConfigurationService";
import RichtextConfigurationServiceDescriptor from "./RichtextConfigurationServiceDescriptor";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const IN_PROGRESS = "IN_PROGRESS";
type IsLinkableResponse = boolean | "IN_PROGRESS";
type IsEmbeddableResponse = boolean | "IN_PROGRESS";
type Cache = Map<string, IsLinkableResponse | IsEmbeddableResponse>;
type LoadFunction = (uriPath: string, service: RichtextConfigurationService, callback: EvaluationCallback) => void;
type EvaluationCallback = (cacheValue: boolean) => void;

/**
 * Provides support for asynchronous API called within synchronous drag and
 * drop event handling.
 */
export default class DragDropAsyncSupport {
  static readonly #logger = LoggerProvider.getLogger("DragDropAsyncSupport");

  /**
   * Short-term cache required to resolve asynchronous responses in
   * synchronous environment. Responses are meant to be cached only for the
   * short time between drag-start and drag-end.
   */
  static readonly #isLinkableCache: Cache = new Map<string, IsLinkableResponse>();
  static readonly #isEmbeddableTypeCache: Cache = new Map<string, IsEmbeddableResponse>();

  /**
   * Workaround for the HTML 5 behaviour that drag over is always synchronous,
   * but we have to call an asynchronous service.
   *
   * When the method is called the first time for a URI-Path, the method calls
   * the asynchronous `RichtextConfigurationService` and stores the actual state
   * of the call in a map and returns probably `false` because the service call
   * is probably still in progress.
   *
   * When the method is called next time the service call might have been
   * returned and the result is `true` if the given URI-path is a linkable,
   * `false` otherwise.
   *
   * **On drop the cache has to be cleared so the short-term cache does not grow eternally.**
   *
   * @param uriPath - the URI-Path of the content, e.g., `content/42`
   * @param evictImmediately - `true` to immediately evict the response from
   * cache; defaults to `false`
   * immediate response; defaults to `false`.
   */
  static isLinkable(uriPath: string, evictImmediately = false): boolean {
    const loadFunction: LoadFunction = (
      uriPath: string,
      service: RichtextConfigurationService,
      callback: EvaluationCallback
    ): void => {
      service.hasLinkableType(uriPath).then((hasLinkableType: boolean) => {
        callback(hasLinkableType);
      });
    };
    return DragDropAsyncSupport.#loadFromCache(
      uriPath,
      evictImmediately,
      DragDropAsyncSupport.#isLinkableCache,
      loadFunction
    );
  }

  static isEmbeddable(uriPath: string, evictImmediately = false): boolean {
    const loadFunction: LoadFunction = (
      uriPath: string,
      service: RichtextConfigurationService,
      callback: EvaluationCallback
    ): void => {
      service.isEmbeddableType(uriPath).then((isEmbeddable: boolean) => {
        callback(isEmbeddable);
      });
    };
    return DragDropAsyncSupport.#loadFromCache(
      uriPath,
      evictImmediately,
      DragDropAsyncSupport.#isEmbeddableTypeCache,
      loadFunction
    );
  }

  /**
   * Validates, if all URI-Paths represent displayable contents.
   * A content is displayable if there is a represenation to visualize in ckeditor (e.g. as a link or as an embedded image).
   *
   * This method triggers asynchronous updates, so that repetitive calls
   * for the same URI-Paths may result in different responses. A positive
   * answer (=== `true`) is only returned, when all responses are available
   * and positive.
   *
   * **On drop the cache has to be cleared so the short-term cache does not grow eternally.**
   * @param uriPaths
   */
  static containsDisplayableContents(uriPaths: string[]): boolean {
    for (const uriPath of uriPaths) {
      if (!DragDropAsyncSupport.isLinkable(uriPath) && !DragDropAsyncSupport.isEmbeddable(uriPath)) {
        return false;
      }
    }
    return true;
  }

  static #loadFromCache(uriPath: string, evictImmediately = false, cache: Cache, loadFunction: LoadFunction): boolean {
    const logger = DragDropAsyncSupport.#logger;

    const actualValue = cache.get(uriPath);

    if (actualValue !== undefined) {
      if (evictImmediately) {
        cache.delete(uriPath);
      }
      logger.debug("isLinkable: Providing cached response.", {
        value: actualValue,
        uriPath: uriPath,
        evictImmediately: evictImmediately,
      });
      return actualValue !== IN_PROGRESS && actualValue;
    }
    return DragDropAsyncSupport.#evaluate(uriPath, evictImmediately, cache, loadFunction);
  }

  /**
   * Triggers cache-update.
   *
   * @param uriPath - the URI-Path of the content, e.g., `content/42`
   * @param evictImmediately - `true` to immediately evict the response from
   * cache; defaults to `false`
   * @param cache - the cache to update
   * @param loadFunction - a function to load the value from
   * @returns `false`, if either the value is false or a different response is not
   * available yet; `true` if response is true
   */
  static #evaluate(uriPath: string, evictImmediately = false, cache: Cache, loadFunction: LoadFunction): boolean {
    const logger = DragDropAsyncSupport.#logger;

    const service = serviceAgent.getService<RichtextConfigurationService>(new RichtextConfigurationServiceDescriptor());

    if (!service) {
      // Synchronous behavior: We don't have a service yet, so assume for now,
      // that the content is not linkable.
      logger.debug("isLinkable: Configuration service unavailable up to now. Providing precautious answer `false`", {
        value: false,
        uriPath: uriPath,
        evictImmediately: evictImmediately,
      });
      return false;
    }

    cache.set(uriPath, IN_PROGRESS);
    loadFunction(uriPath, service, (cacheValue: boolean) => {
      if (cache.get(uriPath) !== undefined) {
        logger.debug("isLinkable: Updating cache.", {
          value: cacheValue,
          uriPath: uriPath,
          evictImmediately: evictImmediately,
        });
        cache.set(uriPath, cacheValue);
      }
    });

    // || false -> required for possible undefined response from get() which
    // cannot happen here.
    const cacheValue = cache.get(uriPath) || false;
    const actualValue = cacheValue === IN_PROGRESS ? false : cacheValue;

    if (evictImmediately) {
      cache.delete(uriPath);
    }

    logger.debug("isLinkable: Providing intermediate response", {
      value: actualValue,
      uriPath: uriPath,
      evictImmediately: evictImmediately,
    });

    return actualValue;
  }

  /**
   * Validates, if all URI-Paths represent linkable contents.
   *
   * This method triggers asynchronous updates, so that repetitive calls
   * for the same URI-Paths may result in different responses. A positive
   * answer (`=== true`) is only returned, when all responses are available
   * and positive.
   *
   * **On drop the cache has to be cleared so the short-term cache does not grow eternally.**
   */
  static containsOnlyLinkables(uriPaths: string[]): boolean {
    for (const uriPath of uriPaths) {
      if (!DragDropAsyncSupport.isLinkable(uriPath)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Resets cached responses to `isLinkable`.
   *
   * Must be called after drag-drop-operation to prevent cache growing endlessly.
   * The cache is meant for short-term caching only.
   */
  static resetCache(): void {
    DragDropAsyncSupport.#isLinkableCache.clear();
    DragDropAsyncSupport.#isEmbeddableTypeCache.clear();
  }
}
