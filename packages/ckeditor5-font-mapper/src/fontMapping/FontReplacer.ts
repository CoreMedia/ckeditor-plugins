import Node from "@ckeditor/ckeditor5-engine/src/view/node";
import Element from "@ckeditor/ckeditor5-engine/src/view/element";
import Text from "@ckeditor/ckeditor5-engine/src/view/text";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import FontMapping from "./FontMapping";
import FontMappingRegistry from "./FontMappingRegistry";

const fontFamilyPropertyName = "font-family";

/**
 * Recursively replaces the characters in direct children and removes their font-family style property.
 * The documentFragment given as the first parameter of this function will be altered directly.
 *
 * @param documentFragment - the document fragment
 * @param currentFontFamily - font-family style, inherited by parent
 */
export const replaceFontInDocumentFragment = (
  documentFragment: DocumentFragment,
  parentFontMapping?: FontMapping
): void => {
  const childElements = findChildren(documentFragment) as Array<Element>;

  for (const child of childElements) {
    // get the font mapping for the child element or use the one inherited from the parent:
    const fontMapping = computeFontMappingForElement(child, parentFontMapping);
    if (!fontMapping) {
      replaceFontInDocumentFragment(child, undefined);
      continue;
    }
    // A new element will be cloned and font mappings will be applied to its
    // text node children:
    const replacementElement = createAlteredElementClone(fontMapping, child);
    if (replacementElement) {
      const childIndex: number = documentFragment.getChildIndex(child);
      documentFragment._removeChildren(childIndex, 1);
      documentFragment._insertChild(childIndex, replacementElement);
    }

    replaceFontInDocumentFragment(child, fontMapping);
  }
};

/**
 * Returns all direct children of a document fragment.
 * Only returns elements of type {@link Element}.
 *
 * @param documentFragment - the document fragment
 * @returns an array of child elements
 */
const findChildren = (documentFragment: DocumentFragment): Array<Element> => {
  const children: Array<Element> = Array.from<Node>(documentFragment.getChildren())
    .filter((value) => value instanceof Element)
    .map((value) => value as Element);
  return children;
};

/**
 * Returns a registered {@link FontMapping} based on the given element.
 * Returns undefined if no fontMapping is registered for the element's font-family
 * or the defaultFontMapping if no font-family is found.
 *
 * @param element - the element to inspect
 * @returns the fontMapping based on the given element or undefined
 */
const computeFontMappingForElement = (element: Element, defaultFontMapping?: FontMapping): FontMapping | undefined => {
  const fontFamily = evaluateFontFamily(element);
  if (fontFamily) {
    return getFontMappingForFontFamily(fontFamily);
  }
  return defaultFontMapping;
};

/**
 * Returns the value of the element's font-family style property.
 *
 * @param element - the element
 * @returns the font-family or undefined if no font-family style property is set
 */
const evaluateFontFamily = (element: Element): string | undefined => {
  return element.getStyle(fontFamilyPropertyName);
};

/**
 * Returns a mapping for the given font-family string from the {@link FontMappingRegistry}.
 * Only the first font in the font-family string will be taken into account.
 *
 * @param fontFamily - the font family
 * @returns a {@link FontMapping} or undefined if no such mapping exists.
 */
const getFontMappingForFontFamily = (fontFamily: string): FontMapping | undefined => {
  /*
   * Splits a string into an array and returns the first element
   *
   * Example:
   * "Symbol, Arial" is converted to ["Symbol", "Arial"]
   * "Symbol" is converted to ["Symbol"]
   */
  const fontName = fontFamily.split(",")[0];

  // Replace quotes, since they are used for some fonts in the font-family string
  const escapedFontName = fontName.replaceAll('"', "");
  return FontMappingRegistry.getFontMapping(escapedFontName);
};

/**
 * Creates a new element, based on an existing one.
 * The new element's font-family style property will be removed
 * and direct children of {@link Text} type will be changed according to the given {@link FontMapping}.
 *
 * @param fontMapping - the font mapping
 * @param element - the element to clone
 * @returns the element clone
 */
const createAlteredElementClone = (fontMapping: FontMapping, element: Element): Element => {
  const clone: Element = new UpcastWriter(element.document).clone(element, true);
  clone._removeStyle(fontFamilyPropertyName);
  replaceCharactersInTextNodeChildren(fontMapping, clone);
  return clone;
};

/**
 * Replaces characters in the element directly.
 * The given {@link FontMapping} determines how the characters in the text
 * node children of the element are converted.
 *
 * @param fontMapping - the font mapping
 * @param element - the element to alter
 */
const replaceCharactersInTextNodeChildren = (fontMapping: FontMapping, element: Element): void => {
  const textElements = findTextNodeChildren(element);
  if (!textElements) {
    return;
  }
  for (const textElement of textElements) {
    const oldTextData: string = textElement._textData;
    textElement._textData = fontMapping.toEscapedHtml(oldTextData);
  }
};

/**
 * Returns all direct text node children in the given element.
 *
 * @param element - the element
 * @returns all direct text node children or null
 */
const findTextNodeChildren = (element: Element): Array<Text> | null => {
  return Array.from<Node>(element.getChildren())
    .filter((value) => value instanceof Text)
    .map((value) => value as Text);
};
