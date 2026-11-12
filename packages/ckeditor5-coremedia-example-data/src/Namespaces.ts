export interface Namespace {
  uri: string;
}

export interface NamedNamespace extends Namespace {
  name: string;
}

export const nsRichText: Namespace = {
  uri: "http://www.coremedia.com/2003/richtext-1.0",
};

export const nsXLink: NamedNamespace = {
  name: "xlink",
  uri: "http://www.w3.org/1999/xlink",
};

export const nsXDiff: NamedNamespace = {
  name: "xdiff",
  uri: "http://www.coremedia.com/2015/xdiff",
};

export const onDemandNamespaces = [nsXLink, nsXDiff];

export const xmlDeclaration = `<?xml version="1.0" encoding="utf-8"?>`;
