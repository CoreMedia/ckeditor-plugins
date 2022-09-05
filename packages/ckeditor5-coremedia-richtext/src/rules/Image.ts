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

// noinspection SpellCheckingInspection
/**
 * Placeholder for images when CoreMedia ContentImagePlugin is not enabled.
 * The placeholder is a grey PNG image.
 */
const INLINE_IMG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAO0AAABoCAMAAAAq7ofWAAAA5FBMVEXl5eXg4ODJycnQ0NCKioqCgoKfn5+AgICDg4Otra3j4+O9vb3ExMSFhYWdnZ3f39+5ubmOjo6JiYmBgYGenp7GxsaGhoa+vr6RkZG1tbWoqKjDw8O7u7uPj4+4uLiUlJSpqamZmZnPz8+ampra2tre3t7V1dWXl5e3t7fi4uKhoaHc3NysrKyzs7O/v7/k5OSTk5PIyMiEhITLy8vMzMzAwMDd3d2lpaWcnJyMjIyNjY3S0tKxsbHY2NiIiIirq6u6urqkpKS0tLTZ2dmurq68vLzb29uWlpbCwsKLi4u2trbT09NF2z01AAABsUlEQVR4nO3WW1fTQBSG4V3p+LWVtpQeCFKgVLFKgNKKnDTWAyLq//8/zmRQ72ldWSvrfW5mJsnF/lYyk20GAAAAAAAAAAAAAAAAAAAeq/JkrVJ0DatTdWZPVYuLuhSGhtOzeGG9Ka/VNttQ1Cmq0JXY7Jr1pH6+GMS0W1KSr7flnu8Md9Vp2J72R8FGcaWuwEPagzAfK6ZN3Au99ONht/YqrCfa8WlfF1jlqsS0+903fn6kJKRN1err2E9GOsmfGW/WS5X2VEOzqTubhLR1zaau6SeJ/h1QZUqbzv1GXddWnnZQC5femjX9CWbndW/o00bvii54KTHtxaVSm3QbIe25rtL0VC2zeTiqj0PGa5/2phWMiy54KQ9p3+tDpXtlIW0vvkS/kzvyu7mdZZm7LtWXfGEfq3uahbQNN194iT7ZZ33Jn/mqsqW9VXMe/jX2LT+Obc33EXfxDzT9Xrq0d9JlnjZRlt8Y+PFEbnS//SPu27O8u/hZcL3LCZ1jT4dmu/oV0qZ/esOFFmb90Dm6+6Obv51jtdhy/7P2LCu6BAAAAAAAAAAAAAAAAAAAAAB4pN9v+SLwroRK9gAAAABJRU5ErkJggg==";

function hasHref({ attributes }: ElementProxy): boolean {
  const href = attributes["xlink:href"];
  return href === "" || !!href;
}

export const handleImage: ToDataAndViewElementConfiguration = {
  toData: (params) => {
    const { node } = params;
    delete node.attributes.src;
    // Just ensure, that we have the required alt Attribute if it is unset.
    node.attributes.alt = node.attributes.alt || "";
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
