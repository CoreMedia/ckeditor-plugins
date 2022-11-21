/* eslint-disable no-null/no-null */
import { MatcherPattern } from "@ckeditor/ckeditor5-engine/src/view/matcher";
import { ConversionContext } from "./ConversionContext";
import priorities, { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";

export type FromType = MatcherPattern;
export type ToType = string | Element | ElementConversionFunction;

export type ElementConversionFunction = (element: Element, context: ConversionContext) => Element;

/**
 * Configuration for transforming one element to another.
 */
export interface ElementToElementConfig {
  readonly from: FromType;
  readonly to: ToType;
  readonly priority?: PriorityString;
}

export interface ParsedElementToElementConfig {
  readonly from: FromType;
  readonly to: ElementConversionFunction;
  readonly priority: number;
}

export class DefaultElementToElementConfig implements ParsedElementToElementConfig {
  readonly from: FromType = /.*/;
  readonly priority = priorities.lowest;

  readonly to: ElementConversionFunction = (element: Element): Element => element;
}

/**
 * Transforms `to` to be always a conversion function, so that it can be
 * easily applied.
 *
 * @param to - original `to` parameter to transform
 */
const parseTo = (to: ToType): ElementConversionFunction => {
  if (typeof to === "string") {
    return (element: Element, context: ConversionContext): Element => {
      const { document } = context;
      return document.createElementNS(null, to);
    };
  }
  if (to instanceof Element) {
    return (element: Element, context: ConversionContext): Element => {
      const { document } = context;
      return document.importNode(to, true);
    };
  }
  return to;
};

const parseElementToElementConfig = (config: ElementToElementConfig): ParsedElementToElementConfig => {
  return {
    from: config.from,
    to: parseTo(config.to),
    priority: priorities.get(config.priority ?? priorities.normal),
  };
};

const applyToDocumentFragment = (fragment: DocumentFragment, config: ParsedElementToElementConfig): void => {
  fragment.normalize();
  const sourceDocument = fragment.ownerDocument;
};

/**
 * Helpers (toView/toData), that expose `apply` to
 * given document fragment.
 */
export interface ElementToElement extends ParsedElementToElementConfig {
  /**
   * Apply configured transformations.
   *
   * @param fragment
   */
  apply(fragment: DocumentFragment): void;
}

export const elementToElement = (): ElementToElementConfig => {
  return {} as ElementToElementConfig;
};
