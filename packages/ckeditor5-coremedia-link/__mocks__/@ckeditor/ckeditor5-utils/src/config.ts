class Config {
  readonly #config: Map<string, unknown> = new Map<string, unknown>();

  get(name: string): unknown {
    return this.#config.get(name);
  }

  set(name: string, value: unknown): void {
    this.#config.set(name, value);
  }
}

export default Config;
