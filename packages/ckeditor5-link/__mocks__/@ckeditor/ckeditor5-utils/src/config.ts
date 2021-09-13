class Config {
  #config: Map<string, unknown> = new Map<string, unknown>();

  get(name: string): unknown | undefined {
    return this.#config.get(name);
  }

  set(name: string, value: unknown): void {
    this.#config.set(name, value);
  }
}

export default Config;
