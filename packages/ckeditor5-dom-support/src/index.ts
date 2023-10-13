/**
 * @module ckeditor5-dom-support
 */

export { copyAttributesFrom, describeAttr } from "./Attrs";
export { fragmentFromNodeContents, fragmentToString } from "./DocumentFragments";
export { documentFromHtml, documentFromXml } from "./Documents";
export {
  type ElementDefinition,
  type ElementDefinitionType,
  compileElementDefinition,
  createElement,
  renameElement,
  removeClass,
} from "./Elements";
export {
  wrapIfHTMLElement,
  defaultDataAttributeClassNamePrefix,
  defaultDataAttributeElementName,
  type HTMLElementWrapper,
} from "./HTMLElements";
export { wrapIfTableElement, type HTMLTableElementWrapper } from "./HTMLTableElements";
export { registerNamespacePrefixes, xmlnsNamespaceUri } from "./Namespaces";
export {
  appendNodeContents,
  extractNodeContents,
  lookupDocumentDefaultNamespaceURI,
  lookupNamespaceURI,
  prependNodeContents,
  serializeToXmlString,
} from "./Nodes";
export { querySelectorAllDirectChildren, querySelectorDirectChild } from "./ParentNodes";
export {
  isAttr,
  isCharacterData,
  isComment,
  isDocument,
  isDocumentFragment,
  isElement,
  isHTMLAnchorElement,
  isHTMLElement,
  isHTMLImageElement,
  isHTMLTableElement,
  isHasNamespaceUri,
  isParentNode,
  isText,
} from "./TypeGuards";
export {
  getColor,
  getFontWeight,
  getFontWeightNumeric,
  fontWeightToNumber,
  type FontWeightInformation,
} from "./CSSStyleDeclarations";
export { RgbColor, rgb } from "./RgbColor";
export { w3ExtendedColorNames } from "./w3ExtendedColorNames";
export { type HasChildren, type HasNamespaceUri } from "./Types";
