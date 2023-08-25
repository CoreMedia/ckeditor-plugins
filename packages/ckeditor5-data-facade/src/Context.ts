/**
 * The default context to assume when no explicit context has been set.
 */
export const defaultContext = Symbol("defaultContext");

/**
 * Type of the `DefaultContext`.
 */
export type DefaultContext = typeof defaultContext;

/**
 * Context for data caching.
 *
 * Contextual information may be required if a given CKEditor 5 instance
 * is re-used in different contexts. In terms of CoreMedia CMS, a CKEditor
 * instance may be used for different contents having different IDs. To
 * ensure that data is not accidentally propagated to an unrelated content,
 * you may, for example, provide the content ID as context information.
 */
export type Context = string | DefaultContext;

/**
 * Options to provide as context information.
 */
export interface ContextOptions {
  /**
   * The current context for setting and getting data. Possibly, some ID
   * the data is bound to. Default to `defaultContext` if unset.
   */
  context?: Context;
}
