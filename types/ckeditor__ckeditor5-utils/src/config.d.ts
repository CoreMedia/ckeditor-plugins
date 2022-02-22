export default class Config {
  constructor(configurations?: object, defaultConfigurations?: object);

  get(name: string): unknown | undefined;

  set(name: string | object, value: unknown): void;

  /**
   * Does exactly the same as {@link #set} with one exception – passed configuration extends
   * existing one, but does not overwrite already defined values.
   *
   * This method is supposed to be called by plugin developers to setup plugin's configurations. It would be
   * rarely used for other needs.
   */
  define<T, K extends keyof T>(name: K, value: T[K]): void;
  define(name: string, value: any): void;
  define<T, K extends keyof T>(values: Record<K, T[K]>): void;
  define(values: Record<string, any>): void;
}
