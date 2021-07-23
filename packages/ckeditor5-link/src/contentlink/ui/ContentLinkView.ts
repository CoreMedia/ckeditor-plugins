import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { Subscription } from "rxjs";
import { CONTENT_CKE_MODEL_URI_REGEXP, UriPath } from "@coremedia/coremedia-studio-integration/content/UriPath";
import ContentAsLink from "@coremedia/coremedia-studio-integration/dist/content/ContentAsLink";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import CoreMediaIconView from "./CoreMediaIconView";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import CancelButtonView from "./CancelButtonView";

/**
 * A ContentView that renders a custom template, containing of 2 different components.
 * The first element displays the information of a content item (containing title and icons of the content)
 * and the buttonView renders a button that can be used to remove the displayed content.
 */
export default class ContentLinkView extends ButtonView {
  private _contentSubscription: Subscription | undefined = undefined;
  readonly renderOptions;

  private _typeIcon: CoreMediaIconView | undefined = undefined;
  private _statusIcon: CoreMediaIconView | undefined = undefined;
  private _cancelButton: ButtonView | undefined = undefined;

  constructor(
    locale: Locale,
    linkUI: LinkUI,
    renderOptions?: {
      renderTypeIcon?: boolean;
      renderStatusIcon?: boolean;
      renderCancelButton?: boolean;
    }
  ) {
    super(locale);

    const bind = this.bindTemplate;
    this.renderOptions = renderOptions;

    /**
     * The value of the content uri path.
     *
     * @observable
     * @member {String} #uriPath
     * @default undefined
     */
    this.set("uriPath", undefined);

    /**
     * Defines whether the label should be underlined
     *
     * @observable
     * @member {Boolean} #underlined
     * @default false
     */
    this.set("underlined", false);

    this.withText = true;

    if (renderOptions?.renderTypeIcon) {
      this._typeIcon = new CoreMediaIconView();
      this.children.add(this._typeIcon);
    }

    this.extendTemplate({
      attributes: {
        class: ["ck-cm-content-link-view", bind.if("underlined", "cm-ck-button--underlined")],
      },
    });

    this.on("change:uriPath", (evt) => {
      // unsubscribe the currently running subscription
      if (this._contentSubscription) {
        this._contentSubscription.unsubscribe();
      }

      const value = evt.source.uriPath;
      if (CONTENT_CKE_MODEL_URI_REGEXP.test(value)) {
        this.#subscribeToContent(value.replace(":", "/"));
      }
    });
  }

  render() {
    super.render();
    if (this.renderOptions?.renderStatusIcon) {
      this._statusIcon = new CoreMediaIconView();
      this.children.add(this._statusIcon);
    }

    if (this.renderOptions?.renderCancelButton) {
      this._cancelButton = new CancelButtonView(this.locale);
      this.children.add(this._cancelButton);
    }
  }

  #subscribeToContent(uriPath: UriPath): void {
    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        // save the subscription to be able to unsubscribe later
        this._contentSubscription = contentDisplayService.observe_asLink(uriPath).subscribe({
          next: (received: ContentAsLink) => {
            this._typeIcon?.set({
              iconClass: received.type.classes?.join(" "),
            });
            this._statusIcon?.set({
              iconClass: received.state.classes?.join(" "),
            });
            this.set({
              label: received.content.name,
            });
          },
        });
      })
      .catch((): void => {
        console.warn("ContentDisplayService not available.");
      });
  }

  destroy(): Promise<never> | null {
    if (this._contentSubscription) {
      this._contentSubscription.unsubscribe();
    }
    super.destroy();
    return null;
  }
}
