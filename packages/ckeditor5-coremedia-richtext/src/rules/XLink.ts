import { preserveAttributeAs } from "@coremedia/ckeditor5-dataprocessor-support/Attributes";

const xLinkTypeMapper = preserveAttributeAs("xlink:type", "data-xlink-type");
const xLinkActuateMapper = preserveAttributeAs("xlink:actuate", "data-xlink-actuate");

export { xLinkTypeMapper, xLinkActuateMapper };
