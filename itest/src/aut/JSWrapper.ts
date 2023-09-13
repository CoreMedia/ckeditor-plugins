/* eslint-disable @typescript-eslint/no-invalid-void-type */
import { JSHandle } from "playwright";
import { PageFunctionOn, SmartHandle } from "playwright-core/types/structs";

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

  exists(): Promise<boolean> {
    return this.evaluate((w) => !!w);
  }

  evaluate<R, Arg, O extends T = T>(pageFunction: PageFunctionOn<O, Arg, R>, arg: Arg): Promise<R>;
  evaluate<R, O extends T = T>(pageFunction: PageFunctionOn<O, void, R>, arg?: unknown): Promise<R>;
  /**
   * Evaluate on the given wrapper.
   *
   * @param pageFunction - function to be evaluated in the page context
   * @param arg - optional argument to pass to `pageFunction`.
   */
  async evaluate<R, Arg, O extends T = T>(
    pageFunction: PageFunctionOn<O, Arg | void, R>,
    arg?: Arg | unknown,
  ): Promise<R> {
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
    arg?: Arg | unknown,
  ): Promise<SmartHandle<R>> {
    const instance = await this.instance;
    return instance.evaluateHandle(pageFunction, arg);
  }
}
