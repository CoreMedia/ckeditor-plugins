export const isElement = (value: unknown): value is Element => value instanceof Element;

export interface ElementDefinition {
  namespaceURI?: null | string;
  qualifiedName: string;
}

export type ElementDefinitionType = string | ElementDefinition;

export const compileElementDefinition = (definition: ElementDefinitionType): ElementDefinition => {
  if (typeof definition === "string") {
    return { qualifiedName: definition };
  }
  return definition;
};

export interface CreateElementParams extends ElementDefinition {
  document: Document;
}

export const createElement = (params: CreateElementParams): Element => {
  const { document, namespaceURI, qualifiedName } = params;
  return document.createElementNS(namespaceURI ?? null, qualifiedName);
};
