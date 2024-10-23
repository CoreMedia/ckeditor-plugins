const DEFAULT_NAMESPACE_PREFIX = "";

interface Namespace {
  uri: string;
}

type Namespaces = Record<string, Namespace>;

const DEFAULT_NAMESPACES: Namespaces = {
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

export { DEFAULT_NAMESPACE_PREFIX, DEFAULT_NAMESPACES, Namespaces, Namespace };
