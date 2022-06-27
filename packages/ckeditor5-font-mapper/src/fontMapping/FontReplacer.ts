import Node from "@ckeditor/ckeditor5-engine/src/view/node";
import Element from "@ckeditor/ckeditor5-engine/src/view/element";
import Text from "@ckeditor/ckeditor5-engine/src/view/text";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import DocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import { FontMapping } from "./FontMapping";
import { fontMappingRegistry } from "./FontMappingRegistry";

const FONT_FAMILY_PROPERTY_NAME = "font-family";

/**
 * Recursively replaces the characters in direct children and removes their font-family style property
 * if a font mapping for the font-family exists.
 * The documentFragment given as the first parameter of this function will be altered directly.
 *
 * @param documentFragment - the document fragment
 * @param parentFontMapping - parent font mapping to be respected in calculation of the applied font mapping.
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
 *
 * A {@link FontMapping} will be looked up by first checking if a font-family exist
 * on the element. If a font-family exists a font mapping for the font-family will be returned
 * or undefined if no font mapping exists.
 * If no font-family exists on the element the inherited font mapping will be returned.
 *
 * @param element - the element to inspect
 * @param inheritedFontMapping - a font mapping inherited from parent hierarchy
 *    or undefined if no font-family exist in the parent hierarchy
 * @returns the fontMapping based on the given element or undefined
 */
const computeFontMappingForElement = (
  element: Element,
  inheritedFontMapping?: FontMapping
): FontMapping | undefined => {
  const fontFamily = evaluateFontFamily(element);
  if (fontFamily) {
    return getFontMappingForFontFamily(fontFamily);
  }
  return inheritedFontMapping;
};

/**
 * Returns the value of the element's font-family style property.
 *
 * @param element - the element
 * @returns the font-family or undefined if no font-family style property is set
 */
const evaluateFontFamily = (element: Element): string | undefined => {
  return element.getStyle(FONT_FAMILY_PROPERTY_NAME);
};

/**
 * Returns a mapping for the given font-family string from the {@link FontMappingRegistry}.
 * Only the first font in the font-family string will be taken into account.
 *
 * Caution:
 *
 * This means that this might no be as precise as it should be. In a real css style
 * the font-family string can contain fallbacks which means that if the searched <i>fontFamily</i> is
 * part of the fallbacks won't be respected.
 *
 * This might cause problems in some scenarios.
 * For example font-family style contains two font-families: SomeSpecialFont and the passed font-family.
 * Now "SomeSpecialFont" is not supported by browsers and the fallback font-family is used to display
 * the characters in the browser. But the algorithm returns undefined instead of the <i>FontMapping</i>
 * for the passsed fontFamily.
 * Reason for this is that we can not say when which style is really applied as it highly depends on the
 * used browser and installed fonts.
 *
 * @param fontFamily - the font family to get a font mapping for.
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
  return fontMappingRegistry.getFontMapping(escapedFontName);
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
  clone._removeStyle(FONT_FAMILY_PROPERTY_NAME);
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
    textElement._textData = fontMapping.toReplacementCharacter(oldTextData);
  }
};

/**
 * Returns all direct text node children in the given element.
 *
 * @param element - the element
 * @returns all direct text node children or null
 */
const findTextNodeChildren = (element: Element): Array<Text> => {
  return Array.from<Node>(element.getChildren())
    .filter((value) => value instanceof Text)
    .map((value) => value as Text);
};
