import { Plugin } from "@ckeditor/ckeditor5-core";
import { getLinkAttributes, LinkAttributes } from "@coremedia/ckeditor5-link-common/src/LinkAttributes";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";

/**
 * Provides integration with the CKEditor 5 Link Feature.
 */
export class LinkIntegration extends Plugin {
  public static readonly pluginName = "LinkIntegration" as const;

  static readonly requires = [LinkAttributes];

  init(): void {
    const initInformation = reportInitStart(this);

    const { editor } = this;

    // Using String reference here, as we spare one
    // dependency then.
    if (editor.plugins.has("LinkEditing")) {
      // Only registering `xlink:type` here, as this is a fixed
      // attribute in CoreMedia Rich Text 1.0 DTD. Thus, it does not
      // make sense to ever provide editing features for this attribute.
      // Nevertheless, we need to ensure proper cleanup.
      getLinkAttributes(editor)?.registerAttribute({ view: "data-xlink-type", model: "linkType" });
    }

    reportInitEnd(initInformation);
  }
}
