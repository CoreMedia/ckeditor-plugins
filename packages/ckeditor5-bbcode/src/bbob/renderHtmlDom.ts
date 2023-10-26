import { render as htmlRender } from "@bbob/html/es";
import { CoreRenderable, CoreRenderer, CoreRenderNode } from "@bbob/core/es";
import { isStringNode, isTagNode, TagAttrs } from "@bbob/plugin-helper/es";
import { bbCodeLogger } from "../BBCodeLogger";
import { RequireSelected } from "@coremedia/ckeditor5-common";

const setAttributes = (
  element: HTMLElement,
  attrs: TagAttrs,
  options: RequireSelected<HtmlDomRendererOptions, "isAttributeAllowed">,
): void => {
  const { isAttributeAllowed } = options;
  Object.entries(attrs)
    .filter(([name, value]) =>
      isAttributeAllowed(name, {
        tag: element.localName,
        owner: element,
        value,
      }),
    )
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
  setAttributes(element, attrs, options);

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
  isAttributeAllowed?: (
    attrName: string,
    context: {
      owner: HTMLElement;
      tag: string;
      value: TagAttrs[string];
    },
  ) => boolean;
  /**
   * If to strip any tags. If set on global level, only text-content will be
   * returned.
   */
  stripTags?: boolean;
}

/**
 * Rather broad set of protocols/URI-schemes, we respect as secure.
 * Note that blocking dedicated protocols is considered not enough.
 */
const allowedProtocols = [
  "about:",
  "callto:",
  "chrome:",
  "facetime:",
  "fax:",
  "feed:",
  "ftp:",
  "geo:",
  "git:",
  "gopher:",
  "gtalk:",
  "http:",
  "https:",
  "im:",
  "irc:",
  "ircs:",
  "jabber:",
  "mailto:",
  "news:",
  "nntp:",
  "rtmfp:",
  "sftp:",
  "skype:",
  "soap:",
  "spotify:",
  "steam:",
  "svn:",
  "tel:",
  "telnet:",
  "xmpp:",
];

/**
 * Allows any attributes despite those starting with `on*`.
 * @param attrName - attribute name to validate.
 * @param context - context of attribute check
 * @param context.owner - owner element to set the attribute to
 * @param context.value - the value to set for the given attribute
 */
const isAttributeAllowed: NonNullable<HtmlDomRendererOptions["isAttributeAllowed"]> = (
  attrName: string,
  { owner, value },
): boolean => {
  switch (attrName) {
    case "href":
      if (owner instanceof HTMLAnchorElement) {
        return isAllowedUrl(value);
      }
      break;
    case "src":
      if (owner instanceof HTMLImageElement) {
        return isAllowedUrl(value);
      }
      break;
    default:
      return !attrName.toLowerCase().startsWith("on");
  }
  return true;
};

/**
 * Validates if a URL is allowed. Validation focuses on the given protocol.
 * This function also URLs that are assumed to be relative.
 */
const isAllowedUrl = (url: string): boolean => {
  if (!url) {
    // We allow empty URLs by default. They may be a result of named anchors
    // to create. While not described to be supported by the `[url]` tag, we
    // may end up with customizations that allow also [a id="top"] or similar.
    return true;
  }
  let result: boolean;
  let reason: string;
  try {
    // Will also fail with TypeError for relative URL references. Still, we
    // do not check in advance, but validate this case later.
    const parsedUrl = new URL(url);
    const { protocol } = parsedUrl;
    result = allowedProtocols.includes(protocol.toLowerCase());
    reason = `validated protocol '${protocol}'`;
  } catch (e) {
    // On exception, there is some chance, that we deal with a relative URL.
    // TODO: Do we want to allow relative URLs? While this may make sense
    //   directly on the website, it poses some risk, that relative URLs
    //   within Studio may trigger malicious behavior.
    //   Example: A reviewer may add the following malicious BBCode to trick
    //   an editor to do unwanted actions:
    //     [url=/apps/workflow-app/]😈[/url]
    result = !url.includes(":");
    reason = `checked for assumed relative URL`;
  }
  bbCodeLogger.debug(`URL validation for '${url}: isValid=${result} (${reason})'`);
  return result;
};

const defaultHtmlDomRendererOptions: Required<HtmlDomRendererOptions> = {
  isAttributeAllowed,
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
