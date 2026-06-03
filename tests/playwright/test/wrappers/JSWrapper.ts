import type { ElementHandle, JSHandle } from "playwright-core";

/**
 * Local counterpart to Playwright's internal `PageFunctionOn` type. It is
 * reconstructed from the `pageFunction` parameter of `JSHandle.evaluateHandle`
 * (whose signature is
 * `evaluateHandle<R, Arg, O extends T = T>(pageFunction: PageFunctionOn<O, Arg, R>, arg: Arg)`),
 * so that we neither have to import it from the non-exported
 * `playwright-core/types/structs` nor patch `playwright-core`.
 */
type PageFunctionOn<On, Arg, R> = string | ((on: On, arg2: Arg) => R | Promise<R>);

/**
 * Local counterpart to Playwright's internal `SmartHandle` type, i.e. the
 * resolved return type of `JSHandle.evaluateHandle`.
 */
type SmartHandle<R> = [R] extends [Node] ? ElementHandle<R> : JSHandle<R>;

/**
 * General concept for JSHandle wrappers.
 */
export class JSWrapper<T> {
  readonly #instance: Promise<JSHandle<T>>;

  constructor(instance: Promise<JSHandle<T>>) {
    this.#instance = instance;
  }

  /**
   * Get a handle on the wrapped item.
   */
  get instance(): Promise<JSHandle<T>> {
    return this.#instance;
  }

  evaluate<R, Arg, O extends T = T>(pageFunction: PageFunctionOn<O, Arg, R>, arg: Arg): Promise<R>;
  evaluate<R, O extends T = T>(pageFunction: PageFunctionOn<O, void, R>, arg?: unknown): Promise<R>;
  /**
   * Evaluate on the given wrapper.
   *
   * @param pageFunction - function to be evaluated in the page context
   * @param arg - optional argument to pass to `pageFunction`.
   */
  async evaluate<R, Arg, O extends T = T>(pageFunction: PageFunctionOn<O, Arg | void, R>, arg?: Arg): Promise<R> {
    const instance = await this.instance;
    return instance.evaluate(pageFunction, arg);
  }

  evaluateHandle<R, Arg, O extends T = T>(pageFunction: PageFunctionOn<O, Arg, R>, arg: Arg): Promise<SmartHandle<R>>;
  evaluateHandle<R, O extends T = T>(pageFunction: PageFunctionOn<O, void, R>, arg?: unknown): Promise<SmartHandle<R>>;
  /**
   * Returns the return value of `pageFunction` as a [JSHandle].
   *
   * @param pageFunction - function to be evaluated in the page context.
   * @param arg - optional argument to pass to `pageFunction`.
   */
  async evaluateHandle<R, Arg, O extends T = T>(
    pageFunction: PageFunctionOn<O, Arg | void, R>,
    arg?: Arg,
  ): Promise<SmartHandle<R>> {
    const instance = await this.instance;
    return instance.evaluateHandle(pageFunction, arg);
  }
}
