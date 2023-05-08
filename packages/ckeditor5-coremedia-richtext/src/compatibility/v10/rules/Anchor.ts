import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/src/Rules";
import ElementProxy from "@coremedia/ckeditor5-dataprocessor-support/src/ElementProxy";
import { xLinkActuateMapper, xLinkTitleMapper, xLinkTypeMapper } from "./XLink";
import { langMapper } from "./Lang";
import { formatLink } from "./IdHelper";
import { formatTarget, parseTarget } from "../../../rules/AnchorElements";

const CONTENT_LINK_DATA_REGEXP = /^content\/(?<id>\d+)*/;
const CONTENT_LINK_DATA_PREFIX = "content/";
const CONTENT_LINK_MODEL_REGEXP = /^content:(?<id>\d+)*/;
const CONTENT_LINK_MODEL_PREFIX = "content:";

const hasHref = ({ attributes }: ElementProxy): boolean => {
  const href = attributes.href;
  return href === "" || !!href;
};

/**
 * Transforms any possible occurrence of `content:123` to `content/123` as this
 * is the required representation for Studio REST Backend. Any unmatched href
 * will be returned unmodified.
 *
 * @param href - href to transform
 */
const contentLinkToData = (href: string): string => {
  const match = CONTENT_LINK_MODEL_REGEXP.exec(href);
  if (!match) {
    return href;
  }
  return `${CONTENT_LINK_DATA_PREFIX}${match[1]}`;
};

const hrefToXLinkHref = ({ attributes }: ElementProxy): void => {
  // It should have been checked before, that we have a href attribute set.
  const href: string = attributes.href as string;
  delete attributes.href;
  attributes["xlink:href"] = contentLinkToData(href);
};

/**
 * Transforms any possible occurrence of `content/123` to `content:123` as this
 * is the recommended representation within CKEditor. This way, CKEditor assumes
 * that `content:` is a schema and does not try adding any schema to the value.
 * `content/123` is the representation as provided in Studio REST Backend, while
 * the representation in CoreMedia CMS is `coremedia:///cap/content/123`.
 *
 * Any unmatched href will be returned unmodified, assuming that it is an
 * external link.
 *
 * @param href - href to transform
 */
const contentLinkToModel = (href: string): string => {
  // If data or not retrieved via CoreMedia Studio Server, we may have
  // UAPI Links in our data (for example, from source editing). `formatLink`
  // will respect such URIs and transform them according to our expectations.
  const link = formatLink(href);
  const match = CONTENT_LINK_DATA_REGEXP.exec(link);
  if (!match) {
    return link;
  }
  return `${CONTENT_LINK_MODEL_PREFIX}${match[1]}`;
};

const xLinkHrefToHref = ({ attributes }: ElementProxy): void => {
  // It should have been checked before, that we have a href attribute set.
  const href = attributes["xlink:href"] as string;
  delete attributes["xlink:href"];
  attributes.href = contentLinkToModel(href);
};

const targetToXLinkAttributes = ({ attributes }: ElementProxy): void => {
  const target = attributes.target ?? "";
  // Just ensure that even no empty target is written.
  delete attributes.target;

  const newAttrs = parseTarget(target);

  if (newAttrs.show) {
    attributes["xlink:show"] = newAttrs.show;
  }
  if (newAttrs.role) {
    attributes["xlink:role"] = newAttrs.role;
  }
};

const xLinkShowAndRoleToTarget = (node: ElementProxy): void => {
  const show = node.attributes["xlink:show"] ?? "";
  const role = node.attributes["xlink:role"] ?? "";

  delete node.attributes["xlink:show"];
  delete node.attributes["xlink:role"];

  const target = formatTarget({ show, role });
  if (target) {
    node.attributes.target = target;
  }
};

const handleAnchor: ToDataAndViewElementConfiguration = {
  toData: (params) => {
    const { node } = params;
    if (!hasHref(node)) {
      // Invalid state: We have an a-element without href, which is not
      // supported by CoreMedia RichText DTD.
      node.replaceByChildren = true;
      return;
    }
    hrefToXLinkHref(node);
    targetToXLinkAttributes(node);
    xLinkTypeMapper.toData(params);
    xLinkActuateMapper.toData(params);
    xLinkTitleMapper.toData(params);
    langMapper.toData(params);
  },
  toView: (params) => {
    const { node } = params;
    xLinkHrefToHref(node);
    xLinkShowAndRoleToTarget(node);
    xLinkTypeMapper.toView(params);
    xLinkActuateMapper.toView(params);
    xLinkTitleMapper.toView(params);
    langMapper.toView(params);
  },
};

export { handleAnchor };
