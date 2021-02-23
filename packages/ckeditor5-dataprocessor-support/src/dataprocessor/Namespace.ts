export const DEFAULT_NAMESPACE_PREFIX = "";

export default interface Namespace {
  uri: string,
}

export interface Namespaces {
  [prefix: string]: Namespace;
}
