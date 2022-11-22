export const isDocument = (value: unknown): value is Document => value instanceof Document;

type DomCreateDocument = typeof DOMImplementation.prototype.createDocument;

export interface CreateDocumentParams {
  namespaceURI?: Parameters<DomCreateDocument>[0];
  qualifiedName?: Parameters<DomCreateDocument>[1];
  doctype?: Parameters<DomCreateDocument>[2];
}

export const createDocument = (params: CreateDocumentParams): ReturnType<DomCreateDocument> => {
  const { namespaceURI, qualifiedName, doctype } = params;
  return document.implementation.createDocument(namespaceURI ?? null, qualifiedName ?? null, doctype ?? null);
};

type DomCreateElementNS = typeof Document.prototype.createElementNS;

export interface CreateElementNSParams {
  document: Document;
  namespaceURI?: Parameters<DomCreateElementNS>[0];
  qualifiedName: Parameters<DomCreateElementNS>[1];
  // options: Not supported by Safari yet, skipping.
}

export const createElementNS = (params: CreateElementNSParams): ReturnType<DomCreateElementNS> => {
  const { document, namespaceURI, qualifiedName } = params;
  return document.createElementNS(namespaceURI ?? null, qualifiedName);
};

export type CreateElementNS = typeof createElementNS;
