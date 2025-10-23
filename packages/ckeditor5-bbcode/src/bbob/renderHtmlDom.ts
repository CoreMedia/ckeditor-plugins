import { render } from "@bbob/html";
import type { ParseOptions, TagNodeTree } from "@bbob/types";
import { isStringNode, isTagNode } from "@bbob/plugin-helper";
import { bbCodeLogger } from "../BBCodeLogger";
import { setAttributesFromTagAttrs } from "./Attributes";

const renderDomNode = (node: null | string | number | TagNodeTree, options: Required<HtmlDomRendererOptions>): Node => {
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
  setAttributesFromTagAttrs(element, attrs);

  element.append(...renderedContents);

  return element;
};

const renderDomNodes = (node: TagNodeTree, options: Required<HtmlDomRendererOptions>): Node[] =>
  (Array.isArray(node) ? node : [node]).map((n) => renderDomNode(n, options));

const renderTree = (node: TagNodeTree, options: Required<HtmlDomRendererOptions>): string => {
  const logger = bbCodeLogger;

  if (logger.isDebugEnabled()) {
    logger.debug(`renderTree starting with: ${JSON.stringify(node)}`);
  }

  const container = document.createElement("div");
  container.append(...renderDomNodes(node, options));
  const result = container.innerHTML;

  if (logger.isDebugEnabled()) {
    logger.debug(`renderTree done with: ${JSON.stringify(result)}`);
  }

  return result;
};

export interface HtmlDomRendererOptions {
  /**
   * If to strip any tags. If set on global level, only text-content will be
   * returned.
   */
  stripTags?: boolean;
}

const defaultHtmlDomRendererOptions: Required<HtmlDomRendererOptions> = {
  stripTags: false,
};

export const htmlDomRenderer = (defaultOptions: HtmlDomRendererOptions = {}) => {
  const configuredDefaultOptions: Required<HtmlDomRendererOptions> = {
    ...defaultHtmlDomRendererOptions,
    ...defaultOptions,
  };
  return (node?: TagNodeTree, options?: ParseOptions): string => {
    const optionsWithDefaults: Required<HtmlDomRendererOptions> = {
      ...configuredDefaultOptions,
      ...(options ?? {}),
    };
    let result: string;
    if (Array.isArray(node)) {
      // Main purpose is to intervene on render when `.html` is retrieved
      // from processed result. Here, we will get the complete tree as input.
      result = renderTree(node, optionsWithDefaults);
    } else {
      // Some defensive approach to fall back to an alternative rendering for
      // in-between processing.
      result = render(node, optionsWithDefaults);
    }
    return result;
  };
};

export const renderHtmlDom = htmlDomRenderer();
