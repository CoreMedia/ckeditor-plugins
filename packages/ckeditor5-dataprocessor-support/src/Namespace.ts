export const DEFAULT_NAMESPACE_PREFIX = "";

export default interface Namespace {
  uri: string;
}

export interface Namespaces {
  [prefix: string]: Namespace;
}

export const DEFAULT_NAMESPACES: Namespaces = {
  xlink: {
    uri: "http://www.w3.org/1999/xlink",
  },
  xml: {
    uri: "http://www.w3.org/XML/1998/namespace",
  },
  xmlns: {
    uri: "http://www.w3.org/2000/xmlns/",
  },
};
