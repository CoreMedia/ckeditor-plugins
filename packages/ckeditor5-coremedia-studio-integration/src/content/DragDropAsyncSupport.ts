import { serviceAgent } from "@coremedia/service-agent";
import RichtextConfigurationService from "./RichtextConfigurationService";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { createRichtextConfigurationServiceDescriptor } from "./RichtextConfigurationServiceDescriptor";
import {
  ContentReferenceResponse,
  createContentReferenceServiceDescriptor,
  IContentReferenceService,
} from "./studioservices/IContentReferenceService";

const IN_PROGRESS = "IN_PROGRESS";
type IsLinkableResponse = boolean | "IN_PROGRESS";
type IsEmbeddableResponse = boolean | "IN_PROGRESS";
type ContentReferenceResponseCacheValue = ContentReferenceResponse[] | "IN_PROGRESS";
type Cache = Map<string, IsLinkableResponse | IsEmbeddableResponse>;
type ContentReferenceCache = Map<string, ContentReferenceResponseCacheValue>;
type LoadFunction = (uriPath: string, service: RichtextConfigurationService, callback: EvaluationCallback) => void;
type ContentReferenceServiceLoadFunction = (
  uriPath: string[],
  service: IContentReferenceService,
  callback: ContentReferenceEvaluationCallback
) => void;
type EvaluationCallback = (cacheValue: boolean) => void;
type ContentReferenceEvaluationCallback = (cacheValue: ContentReferenceResponseCacheValue) => void;

/**
 * Provides support for asynchronous API called within synchronous HTML5 drag
 * and drop event handling.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class DragDropAsyncSupport {
  static readonly #logger = LoggerProvider.getLogger("DragDropAsyncSupport");

  /**
   * Short-term cache required to resolve asynchronous responses in
   * synchronous environment. Responses are meant to be cached only for the
   * short time between drag-start and drag-end.
   */
  static readonly #isLinkableCache: Cache = new Map<string, IsLinkableResponse>();
  static readonly #isEmbeddableTypeCache: Cache = new Map<string, IsEmbeddableResponse>();
  static readonly #contentReferenceResponseCache: ContentReferenceCache = new Map<
    string,
    ContentReferenceResponseCacheValue
  >();

  /**
   * States if the content denoted by the given URI-path is configured, that it
   * may be referenced by an anchor-element `<a>` as so-called content-link.
   *
   * The implementation contains a workaround for the HTML 5 drag and drop
   * behaviour that drag over is always synchronous, but we have to call an
   * asynchronous service.
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
   * **On drop the cache has to be cleared so the short-term cache does not grow
   * eternally.**
   *
   * @param uriPath - the URI-Path of the content, e.g., `content/42`
   * @param evictImmediately - `true` to immediately evict the response from
   * cache; defaults to `false` immediate response; defaults to `false`.
   */
  static isLinkable(uriPath: string, evictImmediately = false): boolean {
    const loadFunction: LoadFunction = (
      uriPath: string,
      service: RichtextConfigurationService,
      callback: EvaluationCallback
    ): void => {
      void service.hasLinkableType(uriPath).then((hasLinkableType: boolean) => {
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

  //TODO: This is just a spike implementation and has to be unified with the other cache example
  static validateUris(uris: string[], evictImmediately = false): ContentReferenceResponse[] | undefined {
    const loadFunction: ContentReferenceServiceLoadFunction = (
      uriPaths: string[],
      service: IContentReferenceService,
      callback: ContentReferenceEvaluationCallback
    ): void => {
      service
        .getContentReferences(uriPaths)
        .then((result) => callback(result))
        .catch((reason) => this.#logger.warn(reason));
    };
    return DragDropAsyncSupport.#loadFromContentReferenceCache(
      uris,
      evictImmediately,
      DragDropAsyncSupport.#contentReferenceResponseCache,
      loadFunction
    );
  }

  static #loadFromContentReferenceCache(
    uris: string[],
    evictImmediately = false,
    cache: ContentReferenceCache,
    loadFunction: ContentReferenceServiceLoadFunction
  ): ContentReferenceResponse[] | undefined {
    const logger = DragDropAsyncSupport.#logger;

    const actualValue = cache.get(JSON.stringify(uris));

    if (actualValue !== undefined) {
      if (evictImmediately) {
        cache.delete(JSON.stringify(uris));
      }
      logger.debug("isLinkable: Providing cached response.", {
        value: actualValue,
        uris,
        evictImmediately,
      });
      if (actualValue === IN_PROGRESS) {
        return undefined;
      }
      return actualValue;
    }
    return DragDropAsyncSupport.#evaluateContentReferenceService(uris, evictImmediately, cache, loadFunction);
  }

  static #evaluateContentReferenceService(
    uriPath: string[],
    evictImmediately = false,
    cache: ContentReferenceCache,
    loadFunction: ContentReferenceServiceLoadFunction
  ): ContentReferenceResponse[] | undefined {
    const logger = DragDropAsyncSupport.#logger;

    const service = serviceAgent.getService(createContentReferenceServiceDescriptor());

    if (!service) {
      // Synchronous behavior: We don't have a service yet, so assume for now,
      // that the content is not linkable.
      logger.debug("isLinkable: Configuration service unavailable up to now. Providing precautious answer `false`", {
        value: false,
        uriPath,
        evictImmediately,
      });
      return undefined;
    }

    cache.set(JSON.stringify(uriPath), IN_PROGRESS);
    loadFunction(uriPath, service, (cacheValue: ContentReferenceResponseCacheValue) => {
      if (cache.get(JSON.stringify(uriPath)) !== undefined) {
        logger.debug("isLinkable: Updating cache.", {
          value: cacheValue,
          uriPath,
          evictImmediately,
        });
        cache.set(JSON.stringify(uriPath), cacheValue);
      }
    });
  }

  /**
   * States if the content denoted by the given URI-path is configured, that it
   * may be referenced by an image-element `<img>`, which again is meant to
   * reference a BLOB-property of the given content.
   *
   * The implementation contains a workaround for the HTML 5 drag and drop
   * behavior that drag over is always synchronous, but we have to call an
   * asynchronous service.
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
   * **On drop the cache has to be cleared so the short-term cache does not grow
   * eternally.**
   *
   * @param uriPath - the URI-Path of the content, e.g., `content/42`
   * @param evictImmediately - `true` to immediately evict the response from
   * cache; defaults to `false` immediate response; defaults to `false`.
   */
  static isEmbeddable(uriPath: string, evictImmediately = false): boolean {
    const loadFunction: LoadFunction = (
      uriPath: string,
      service: RichtextConfigurationService,
      callback: EvaluationCallback
    ): void => {
      void service.isEmbeddableType(uriPath).then((isEmbeddable: boolean) => {
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
   * A content is displayable if there is a representation to visualize in
   * CKEditor (e.g., as a link or as an embedded image).
   *
   * This method triggers asynchronous updates, so that repetitive calls
   * for the same URI-Paths may result in different responses. A positive
   * answer (`=== true`) is only returned, when all responses are available
   * and positive.
   *
   * **On drop the cache has to be cleared so the short-term cache does not grow eternally.**
   *
   * @param uriPaths - URI paths to validate
   */
  static containsDisplayableContents(uriPaths: string[]): boolean {
    const isLinkable = DragDropAsyncSupport.isLinkable;
    const isEmbeddable = DragDropAsyncSupport.isEmbeddable;
    return uriPaths.every((uriPath) => {
      // Do not use short-circuit (McCarthy) evaluation!
      //
      // It is important invoking both functions, isLinkable and isEmbeddable,
      // so that caching mechanism to deal with synchronous drag and drop
      // vs. asynchronous responses works correctly. Thus, a short-circuit
      // evaluation like (isLinkable() || isEmbeddable()) must not be used.
      //
      // Invoking both is crucial, because the initial call of isLinkable() or
      // isEmbeddable() might return a wrong value due to asynchronous behavior.
      //
      // On each consecutive call, the correct value will be returned from the
      // cache. That is why we should make sure isLinkable() and isEmbeddable()
      // are called at least once while dragging to have the correct (cached)
      // result when calling these functions when we finally drop.
      const linkableValue = isLinkable(uriPath);
      const embeddableValue = isEmbeddable(uriPath);
      return linkableValue || embeddableValue;
    });
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
        uriPath,
        evictImmediately,
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
   * @returns `false`, if either the value is false or a different response is
   * not available yet; `true` if response is true
   */
  static #evaluate(uriPath: string, evictImmediately = false, cache: Cache, loadFunction: LoadFunction): boolean {
    const logger = DragDropAsyncSupport.#logger;

    const service = serviceAgent.getService(createRichtextConfigurationServiceDescriptor());

    if (!service) {
      // Synchronous behavior: We don't have a service yet, so assume for now,
      // that the content is not linkable.
      logger.debug("isLinkable: Configuration service unavailable up to now. Providing precautious answer `false`", {
        value: false,
        uriPath,
        evictImmediately,
      });
      return false;
    }

    cache.set(uriPath, IN_PROGRESS);
    loadFunction(uriPath, service, (cacheValue: boolean) => {
      if (cache.get(uriPath) !== undefined) {
        logger.debug("isLinkable: Updating cache.", {
          value: cacheValue,
          uriPath,
          evictImmediately,
        });
        cache.set(uriPath, cacheValue);
      }
    });

    // || false -> required for possible undefined response from get() which
    // cannot happen here.
    const cacheValue = cache.get(uriPath) ?? false;
    const actualValue = cacheValue === IN_PROGRESS ? false : cacheValue;

    if (evictImmediately) {
      cache.delete(uriPath);
    }

    logger.debug("isLinkable: Providing intermediate response", {
      value: actualValue,
      uriPath,
      evictImmediately,
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
   * **On drop the cache has to be cleared so the short-term cache does not grow
   * eternally.**
   */
  static containsOnlyLinkables(uriPaths: string[]): boolean {
    const isLinkable = DragDropAsyncSupport.isLinkable;
    return uriPaths.every((uriPath) => isLinkable(uriPath));
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
