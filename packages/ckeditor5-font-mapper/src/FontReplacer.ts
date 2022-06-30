import ViewNode from "@ckeditor/ckeditor5-engine/src/view/node";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import ViewText from "@ckeditor/ckeditor5-engine/src/view/text";
import UpcastWriter from "@ckeditor/ckeditor5-engine/src/view/upcastwriter";
import ViewDocumentFragment from "@ckeditor/ckeditor5-engine/src/view/documentfragment";
import { FontMapping } from "./FontMapping";
import { fontMappingRegistry } from "./FontMappingRegistry";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const FONT_FAMILY_PROPERTY_NAME = "font-family";
const logger: Logger = LoggerProvider.getLogger("FontMapper");
/**
 * Recursively replaces the characters in direct children and removes their
 * font-family style property if a font mapping for the font-family exists.
 * The documentFragment given as the first parameter of this function will
 * be altered directly.
 *
 * @param documentFragment - the document fragment
 * @param parentFontMapping - parent font mapping to be respected in calculation
 * of the applied font mapping.
 */
export const replaceFontInDocumentFragment = (
  documentFragment: ViewDocumentFragment | ViewElement,
  parentFontMapping?: FontMapping
): void => {
  const childElements = findChildren(documentFragment);
  logger.debug("Starting to analyze children", childElements);
  for (const child of childElements) {
    // get the font mapping for the child element or use the one inherited from the parent:
    const fontMapping = computeFontMappingForElement(child, parentFontMapping);
    if (!fontMapping) {
      replaceFontInDocumentFragment(child, undefined);
      continue;
    }
    logger.debug("Found a font mapping for child: ", child, fontMapping);
    // A new element will be cloned and font mappings will be applied to its
    // text node children:
    const replacementElement = createAlteredElementClone(fontMapping, child);

    //replacementElement might be a container.
    //If the container get replaced the current recursion has the element before
    //the container gets replaced and therefore is adding the other replaced elements
    //to the removed container. In reality we only have to replace elements with text.
    if (hasTextChild(replacementElement)) {
      const childIndex: number = documentFragment.getChildIndex(child);
      //@ts-expect-error TODO _removeChildren is protected for Element
      documentFragment._removeChildren(childIndex, 1);
      //@ts-expect-error TODO _insertChild is protected for Element
      documentFragment._insertChild(childIndex, replacementElement);
    }

    replaceFontInDocumentFragment(child, fontMapping);
  }
};

/**
 * Analyzes the direct children of the given element if one of the children is
 * a text.
 *
 * @param element - a view element
 * @returns true if the given element has at least one child which is of type text.
 */
const hasTextChild = (element: ViewElement): boolean => {
  const children = Array.from<ViewNode>(element.getChildren());
  return children.some((node: ViewNode) => {
    return node instanceof ViewText;
  });
};

/**
 * Returns all direct children of a document fragment.
 * Only returns elements of type Element.
 *
 * @param documentFragment - the document fragment
 * @returns an array of child elements
 */
const findChildren = (documentFragment: ViewDocumentFragment | ViewElement): Array<ViewElement> => {
  return Array.from<ViewNode>(documentFragment.getChildren())
    .filter((value) => value instanceof ViewElement)
    .map((value) => value as ViewElement);
};

/**
 * Returns a registered {@link FontMapping} based on the given element.
 *
 * A {@link FontMapping} will be looked up by first checking if a font-family
 * exists on the element:
 *
 * * If a font-family exists, a font mapping for the font-family will be returned
 *   or undefined if no font mapping exists.
 *
 * * If no font-family exists, on the element the inherited font mapping will be
 *   returned.
 *
 * @param element - the element to inspect
 * @param inheritedFontMapping - a font mapping inherited from parent hierarchy
 *    or `undefined` if no font-family exist in the parent hierarchy
 * @returns the fontMapping based on the given element or `undefined`
 */
const computeFontMappingForElement = (
  element: ViewElement,
  inheritedFontMapping?: FontMapping
): FontMapping | undefined => {
  logger.debug("Looking up fontFamily for element, respecting inheritedFontMapping", element, inheritedFontMapping);
  const fontFamily = evaluateFontFamily(element);
  if (fontFamily) {
    logger.debug(`Found "${fontFamily}" as font family directly on element, looking up a font mapping`, element);
    const fontMapping = getFontMappingForFontFamily(fontFamily);
    if (fontMapping) {
      //if a font mapping is available for the current font family the font family has to be removed.
      logger.debug(`Found ${fontMapping}. Will remove font-family ${fontFamily} from element ${element}`);
      //@ts-expect-error TODO _removeStyle is protected
      element._removeStyle(fontFamily);
    }
    return fontMapping;
  }
  logger.debug("No font family directly found on element, returning inherited font mapping", inheritedFontMapping);
  return inheritedFontMapping;
};

/**
 * Returns the value of the element's font-family style property.
 *
 * @param element - the element
 * @returns the font-family or undefined if no font-family style property is set
 */
const evaluateFontFamily = (element: ViewElement): string | undefined => {
  return element.getStyle(FONT_FAMILY_PROPERTY_NAME);
};

/**
 * Returns a mapping for the given font-family string from the
 * {@link FontMappingRegistry}.
 *
 * Only the first font in the font-family string will be taken into account.
 *
 * **Caution:**
 *
 * This means that this might not be as precise as it should be. In a real CSS
 * style the font-family string can contain fallbacks which means that if the
 * searched `fontFamily` is part of the fallbacks won't be respected.
 *
 * This might cause problems in some scenarios. For example, font-family style
 * contains two font-families: "SomeSpecialFont" and the specified font-family.
 * Now "SomeSpecialFont" is not supported by browsers and the fallback font-family
 * is used to display the characters in the browser. But the algorithm returns
 * `undefined` instead of the `FontMapping` for the specified fontFamily. Reason
 * for this is that we can not say when which style is really applied as it highly
 * depends on the used browser and installed fonts.
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
  const fontFamilyArray = fontFamily.split(",").map(escapeFontFamily);

  return fontMappingRegistry.getFontMapping(fontFamilyArray[0]);
};

/**
 * Escapes a font-family name to be used as a key in a FontMapping
 *
 * The parameter fontFamilyStyle is a comma separated list of font families.
 * The result is the first font family of the comma separated list without
 * any leading and trailing special characters (like whitespace, quotes, comma).
 *
 * @param fontFamilyStyle - the font name
 * @returns the escaped font name
 */
export const escapeFontFamily = (fontFamilyStyle: string): string => {
  return fontFamilyStyle
    .split(/\s*(?:^,*|,|$)\s*/)
    .map((s) => s.replace(/^"(.*)"$/, "$1"))
    .filter((s) => !!s)[0];
};

/**
 * Creates a new element, based on an existing one.
 * The new element's font-family style property will be removed
 * and direct children of type Text will be changed according to the given {@link FontMapping}.
 *
 * @param fontMapping - the font mapping
 * @param element - the element to clone
 * @returns the element clone
 */
const createAlteredElementClone = (fontMapping: FontMapping, element: ViewElement): ViewElement => {
  const clone: ViewElement = new UpcastWriter(element.document).clone(element, true);
  //@ts-expect-error TODO _removeStyle is protected
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
const replaceCharactersInTextNodeChildren = (fontMapping: FontMapping, element: ViewElement): void => {
  const textElements = findTextNodeChildren(element);
  for (const textElement of textElements) {
    //@ts-expect-error TODO _textData is protected
    const oldTextData: string = textElement._textData;
    logger.debug("Searching replacement character for textElement:", textElement);
    //@ts-expect-error TODO _textData is protected
    textElement._textData = fontMapping.toReplacementCharacter(oldTextData);
  }
};

/**
 * Returns all direct text node children in the given element.
 *
 * @param element - the element
 * @returns all direct text node children
 */
const findTextNodeChildren = (element: ViewElement): Array<ViewText> => {
  return Array.from<ViewNode>(element.getChildren())
    .filter((value) => value instanceof ViewText)
    .map((value) => value as ViewText);
};
