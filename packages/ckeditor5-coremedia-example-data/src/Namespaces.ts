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

/**
 * Wraps XML by corresponding `<div>` as used in CoreMedia RichText.
 * Required namespaces are dynamically added.
 *
 * Note, that this method is meant for test-purpose only! For adding
 * required namespaces, only a rough check is applied, not suitable for
 * production scenarios.
 *
 * @param innerXml - the XML to wrap into `<div>`.
 * @param addXmlDeclaration - if to add the XML declaration with UTF-8 encoding)
 * in front.
 */
export const wrapXml = (innerXml: string, addXmlDeclaration = true): string => {
  let result = "";
  if (addXmlDeclaration) {
    result += xmlDeclaration;
  }
  result += `<div xmlns="${nsRichText.uri}"`;
  onDemandNamespaces.forEach((namespace) => {
    if (innerXml.includes(`${namespace.name}:`)) {
      result += ` xmlns:${namespace.name}="${namespace.uri}"`;
    }
  });
  result += `>${innerXml}</div>`;
  return result;
};
