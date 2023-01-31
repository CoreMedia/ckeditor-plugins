import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import ElementProxy from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";
import {
  xLinkActuateMapper,
  xLinkHrefMapper,
  xLinkRoleMapper,
  xLinkShowMapper,
  xLinkTitleMapper,
  xLinkTypeMapper,
} from "./XLink";
import { langMapper } from "./Lang";
import { INLINE_IMG } from "../../../rules/ImageElements";

/**
 * Valides, if the given element has an `xlink:href` set.
 *
 * @param attributes - the proxy to check the attributes of
 * @param attributes.attributes - attributes to check
 * @returns `true` if an `xlink:href` attribute exists, `false`otherwise.
 */
const hasHref = ({ attributes }: ElementProxy): boolean => {
  const href = attributes["xlink:href"];
  return href === "" || !!href;
};

export const handleImage: ToDataAndViewElementConfiguration = {
  toData: (params) => {
    const { node } = params;
    delete node.attributes.src;
    // Just ensure, that we have the required alt Attribute if it is unset.
    node.attributes.alt = node.attributes.alt ?? "";
    xLinkActuateMapper.toData(params);
    xLinkHrefMapper.toData(params);
    xLinkRoleMapper.toData(params);
    xLinkShowMapper.toData(params);
    xLinkTitleMapper.toData(params);
    xLinkTypeMapper.toData(params);
    langMapper.toData(params);

    if (!hasHref(node)) {
      // Invalid state: We have an img-element without href, which is not
      // supported by CoreMedia RichText DTD.
      node.replaceByChildren = true;
    }
  },
  toView: (params) => {
    const { node } = params;
    node.attributes.src = INLINE_IMG;
    xLinkActuateMapper.toView(params);
    xLinkHrefMapper.toView(params);
    xLinkRoleMapper.toView(params);
    xLinkShowMapper.toView(params);
    xLinkTitleMapper.toView(params);
    xLinkTypeMapper.toView(params);
    langMapper.toView(params);
  },
};
