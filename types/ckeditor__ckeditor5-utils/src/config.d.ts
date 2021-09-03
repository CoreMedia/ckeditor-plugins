export default class Config {
  constructor(configurations?: object, defaultConfigurations?: object);

  get(name: string): unknown | undefined;

  set(name: string | object, value: unknown): void;
}
