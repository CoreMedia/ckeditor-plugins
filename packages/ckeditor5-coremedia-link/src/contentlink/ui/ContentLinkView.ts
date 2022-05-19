import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import { serviceAgent } from "@coremedia/service-agent";
import ContentDisplayService from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { Subscription } from "rxjs";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  requireContentUriPath,
  UriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import ContentAsLink from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentAsLink";
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
  readonly renderOptions;

  /**
   * Signals, if subscriptions are still accepted. Set to
   * `false` when destruction got triggered.
   */
  #acceptSubscriptions = true;

  #contentSubscription: Subscription | undefined = undefined;
  readonly #typeIcon: CoreMediaIconView | undefined = undefined;
  readonly #statusIcon: CoreMediaIconView | undefined = undefined;
  readonly #cancelButton: ButtonView | undefined = undefined;

  declare uriPath: string | undefined;
  declare contentName: string | undefined;

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

    /*
     * The value of the content uri path.
     *
     * @observable
     * @member {String} #uriPath
     * @default undefined
     */
    this.set("uriPath", undefined);

    /*
     * The value of the content name.
     *
     * @observable
     * @member {String} #contentName
     * @default undefined
     */
    this.set("contentName", undefined);

    /*
     * Renders the link as a simple text link
     *
     * @observable
     * @member {Boolean} #renderAsTextLink
     * @default false
     */
    this.set("renderAsTextLink", false);

    this.withText = true;

    if (renderOptions?.renderTypeIcon) {
      this.#typeIcon = new CoreMediaIconView();
      this.children.add(this.#typeIcon);
    }

    /*
     * We need these, but will only add them in the render phase to make them
     * appear behind all other children.
     */
    if (this.renderOptions?.renderStatusIcon) {
      this.#statusIcon = new CoreMediaIconView();
    }
    if (this.renderOptions?.renderCancelButton) {
      this.#cancelButton = new CancelButtonView(this.locale);
    }

    this.extendTemplate({
      attributes: {
        class: [
          "cm-ck-content-link-view",
          bind.if("underlined", "cm-ck-button--underlined"),
          bind.if("renderAsTextLink", "ck-link-actions__preview"),
        ],
      },
      on: {
        click: bind.to((evt: MouseEvent) => {
          evt.preventDefault();
          const el: Element = <Element>evt.target;
          if (el?.id === CancelButtonView.iconId) {
            this.fire("cancelClick");
          } else {
            this.fire("contentClick");
          }
        }),
        dblclick: bind.to((evt: Event) => {
          evt.preventDefault();
          const el: Element = <Element>evt.target;
          if (!(el?.id === CancelButtonView.iconId)) {
            this.fire("doubleClick");
          }
        }),
      },
    });

    this.bind("label").to(this, "contentName");

    this.on("change:uriPath", (evt) => {
      // URI changes, thus contentName, icons and tooltip are not valid anymore for the new URI
      this.set({
        contentName: undefined,
        tooltip: undefined,
      });
      this.#typeIcon?.set({
        iconClass: undefined,
      });
      this.#statusIcon?.set({
        iconClass: undefined,
      });

      this.#endContentSubscription();

      const value = evt.source.uriPath;
      if (CONTENT_CKE_MODEL_URI_REGEXP.test(value)) {
        this.#subscribeToContent(requireContentUriPath(value));
      }
    });
  }

  render(): void {
    super.render();
    if (this.renderOptions?.renderStatusIcon) {
      this.children.add(this.#statusIcon);
    }

    if (this.renderOptions?.renderCancelButton) {
      this.children.add(this.#cancelButton);
    }
  }

  #endContentSubscription(): void {
    this.#contentSubscription?.unsubscribe();
    this.#contentSubscription = undefined;
  }

  #registerSubscription(subscriptionSupplier: () => Subscription): void {
    if (!this.#acceptSubscriptions) {
      return;
    }
    // Ensure that there is no other existing subscription.
    this.#endContentSubscription();
    this.#contentSubscription = subscriptionSupplier();
  }

  #subscribeToContent(uriPath: UriPath): void {
    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        // save the subscription to be able to unsubscribe later
        this.#registerSubscription(() =>
          contentDisplayService.observe_asLink(uriPath).subscribe({
            next: (received: ContentAsLink) => {
              this.#typeIcon?.set({
                iconClass: received.type.classes?.join(" "),
              });
              this.#statusIcon?.set({
                iconClass: received.state.classes?.join(" "),
              });
              this.set({
                tooltip: received.content.name,
                contentName: received.content.name,
              });
            },
          })
        );
      })
      .catch((reason): void => {
        console.warn("ContentDisplayService not available.", reason);
      });
  }

  destroy(): void {
    // Prevent possible asynchronous events from re-triggering subscription.
    this.#acceptSubscriptions = false;
    this.#endContentSubscription();
    super.destroy();
  }
}
