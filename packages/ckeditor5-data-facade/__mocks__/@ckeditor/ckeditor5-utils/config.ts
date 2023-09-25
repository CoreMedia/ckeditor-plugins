export class Config {
  readonly #config: Record<string, unknown>;

  constructor(config: Record<string, unknown>) {
    this.#config = config;
  }

  get(name: string): unknown | undefined {
    return this.#config[name];
  }
}
