import { render as htmlRender } from "@bbob/html/es";
import { CoreRenderable, CoreRenderer, CoreRenderNode } from "@bbob/core/es";
import { isStringNode, isTagNode, TagAttrs } from "@bbob/plugin-helper/es";
import { bbCodeLogger } from "../BBCodeLogger";
import { RequireSelected } from "@coremedia/ckeditor5-common";
import { AttributeGuard, defaultAttributeGuard } from "./AttributeGuard";

const setAttributes = (
  element: HTMLElement,
  attrs: TagAttrs,
  tag: string,
  options: RequireSelected<HtmlDomRendererOptions, "attributeGuard">,
): void => {
  const { attributeGuard } = options;
  attributeGuard
    .filteredEntries(attrs, {
      owner: element,
      tag,
    })
    .forEach(([name, value]) => {
      try {
        element.setAttribute(name, value);
      } catch (e) {
        bbCodeLogger.debug(
          `Ignoring error for setting attribute '${name}' for element ${element.localName} to value '${value}'.`,
          e,
        );
      }
    });
};

const renderDomNode = (node: CoreRenderable, options: Required<HtmlDomRendererOptions>): Node => {
  if (typeof node === "number") {
    return document.createTextNode(String(node));
  }

  if (!node || isStringNode(node)) {
    return document.createTextNode(node ?? "");
  }

  if (!isTagNode(node)) {
    throw new Error(`Unexpected node. Expected TagNode, but is: ${typeof node}: ${JSON.stringify(node)}`);
  }

  const { tag, attrs, content } = node;
  const { stripTags } = options;

  const renderedContents = renderDomNodes(content ?? [], options);

  if (stripTags) {
    const fragment = document.createDocumentFragment();
    fragment.append(...renderedContents);
    return fragment;
  }

  const element = document.createElement(tag);
  setAttributes(element, attrs, tag, options);

  element.append(...renderedContents);

  return element;
};

const renderDomNodes = (node: CoreRenderable[], options: Required<HtmlDomRendererOptions>): Node[] =>
  node.map((n) => renderDomNode(n, options));

const renderTree = (node: CoreRenderable[], options: Required<HtmlDomRendererOptions>): string => {
  const container = document.createElement("div");
  container.append(...renderDomNodes(node, options));
  return container.innerHTML;
};

export interface HtmlDomRendererOptions {
  /**
   * Prior to adding an attribute, checks if an attribute should be added
   * to a given element.
   *
   * @param attrName - attribute name to add
   * @param context - context information that may be used for validation
   * @param context.owner - element to add attribute to
   * @param context.tag - node tag from BBCode processing
   * @param context.value - value, the attribute shall get
   */
  attributeGuard?: AttributeGuard;
  /**
   * If to strip any tags. If set on global level, only text-content will be
   * returned.
   */
  stripTags?: boolean;
}

const defaultHtmlDomRendererOptions: Required<HtmlDomRendererOptions> = {
  attributeGuard: defaultAttributeGuard,
  stripTags: false,
};

export const htmlDomRenderer = (defaultOptions: HtmlDomRendererOptions = {}): CoreRenderer => {
  const configuredDefaultOptions: Required<HtmlDomRendererOptions> = {
    ...defaultHtmlDomRendererOptions,
    ...defaultOptions,
  };
  return (node: CoreRenderNode, options: object & HtmlDomRendererOptions = {}): string => {
    const optionsWithDefaults: Required<HtmlDomRendererOptions> = {
      ...configuredDefaultOptions,
      ...options,
    };
    let result: string;
    if (Array.isArray(node)) {
      // Main purpose is to intervene on render when `.html` is retrieved
      // from processed result. Here, we will get the complete tree as input.
      result = renderTree(node, optionsWithDefaults);
      console.debug("htmlDomRenderer, mode: DOM", { result });
    } else {
      // Some defensive approach to fall back to an alternative rendering for
      // in-between processing.
      result = htmlRender(node, optionsWithDefaults);
      console.debug("htmlDomRenderer, mode: Fallback", { result });
    }
    return result;
  };
};

export const renderHtmlDom: CoreRenderer = htmlDomRenderer();
