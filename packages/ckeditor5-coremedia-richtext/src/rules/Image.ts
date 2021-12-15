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

/**
 * Placeholder image as long as we have no image support yet.
 * The placeholder is a 10x10 red PNG image.
 */
// TODO[cke] Remove, as soon as images are supported.
const INLINE_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8AARIQB46hC+ioEAGX8E/cKr6qsAAAAAElFTkSuQmCC";

function hasHref({ attributes }: ElementProxy): boolean {
  const href = attributes["xlink:href"];
  return href === "" || !!href;
}

export const handleImage: ToDataAndViewElementConfiguration = {
  toData: (params) => {
    const { node } = params;
    delete node.attributes["src"];
    // Just ensure, that we have the required alt Attribute if it is unset.
    node.attributes["alt"] = node.attributes["alt"] || "";
    xLinkActuateMapper.toData(params);
    xLinkHrefMapper.toData(params);
    xLinkRoleMapper.toData(params);
    xLinkShowMapper.toData(params);
    xLinkTitleMapper.toData(params);
    xLinkTypeMapper.toData(params);
    langMapper.toData(params);

    if (!hasHref(node)) {
      // Invalid state: We have an img-element without href which is not
      // supported by CoreMedia RichText DTD.
      node.replaceByChildren = true;
    }
  },
  toView: (params) => {
    const { node } = params;
    node.attributes["src"] = INLINE_IMG;
    xLinkActuateMapper.toView(params);
    xLinkHrefMapper.toView(params);
    xLinkRoleMapper.toView(params);
    xLinkShowMapper.toView(params);
    xLinkTitleMapper.toView(params);
    xLinkTypeMapper.toView(params);
    langMapper.toView(params);
  },
};
