import { render as htmlRender } from "@bbob/html/es";
import { CoreRenderable, CoreRenderer, CoreRenderNode } from "@bbob/core/es";
import { isStringNode, isTagNode } from "@bbob/plugin-helper/es";
import { bbCodeLogger } from "../BBCodeLogger";

const renderDomNode = (node: CoreRenderable, stripTags = false): Node => {
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

  const renderedContents = renderDomNodes(content ?? [], stripTags);

  if (stripTags) {
    const fragment = document.createDocumentFragment();
    fragment.append(...renderedContents);
    return fragment;
  }

  const element = document.createElement(node.tag);
  Object.entries(attrs).forEach(([name, value]) => {
    try {
      element.setAttribute(name, value);
    } catch (e) {
      bbCodeLogger.debug(`Ignoring error for setting attribute '${name}' for node ${tag} to value '${value}'.`, e);
    }
  });

  element.append(...renderedContents);

  return element;
};

const renderDomNodes = (node: CoreRenderable[], stripTags = false): Node[] =>
  node.map((n) => renderDomNode(n, stripTags));

const renderTree = (node: CoreRenderable[], stripTags = false): string => {
  const container = document.createElement("div");
  container.append(...renderDomNodes(node, stripTags));
  return container.innerHTML;
};

export const renderHtmlDom: CoreRenderer = (
  node: CoreRenderNode,
  options: object & { stripTags?: boolean } = {},
): string => {
  const { stripTags = false } = options;

  if (Array.isArray(node)) {
    // Main purpose is to intervene on render when `.html` is retrieved
    // from processed result. Here, we will get the complete tree as input.
    return renderTree(node);
  } else {
    // Some defensive approach to fall back to an alternative rendering for
    // in-between processing.
    return htmlRender(node, { stripTags });
  }
};
