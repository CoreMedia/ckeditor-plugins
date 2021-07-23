import View from "@ckeditor/ckeditor5-ui/src/view";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import ContentDisplayService from "@coremedia/coremedia-studio-integration/content/ContentDisplayService";
import ContentDisplayServiceDescriptor from "@coremedia/coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { Subscription } from "rxjs";
import { CONTENT_CKE_MODEL_URI_REGEXP, UriPath } from "@coremedia/coremedia-studio-integration/content/UriPath";
import ContentAsLink from "@coremedia/coremedia-studio-integration/dist/content/ContentAsLink";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";

/**
 * A ContentView that renders a custom template, containing of 2 different components.
 * The first element displays the information of a content item (containing title and icons of the content)
 * and the buttonView renders a button that can be used to remove the displayed content.
 */
export default class ContentView extends View {
  readonly _buttonView: ButtonView;

  private _contentSubscription: Subscription | undefined = undefined;

  constructor(locale: Locale, linkUI: LinkUI) {
    super(locale);

    const bind = this.bindTemplate;

    /**
     * The title of the content.
     *
     * @observable
     * @member {String} #title
     * @default undefined
     */
    this.set("title", undefined);

    /**
     * The css class of the type icon element.
     *
     * @observable
     * @member {String} #typeClass
     * @default undefined
     */
    this.set("typeClass", undefined);

    /**
     * The css class of the status icon element.
     *
     * @observable
     * @member {String} #statusClass
     * @default undefined
     */
    this.set("statusClass", undefined);

    /**
     * Controls whether the input view is in read-only mode.
     *
     * @observable
     * @member {Boolean} #isReadOnly
     * @default false
     */
    this.set("isReadOnly", false);

    /**
     * Set to `true` when the field has some error. Usually controlled via
     * {@link module:ui/labeledinput/labeledinputview~LabeledInputView#errorText}.
     *
     * @observable
     * @member {Boolean} #hasError
     * @default false
     */
    this.set("hasError", false);

    /**
     * The `id` of the element describing this field. When the field has
     * some error, it helps screen readers read the error text.
     *
     * @observable
     * @member {Boolean} #ariaDescribedById
     */
    this.set("ariaDescribedById");

    /**
     * An instance of the cancel button allowing the user to dismiss the content.
     */
    this._buttonView = this.#createButtonView(locale);

    this.setTemplate({
      tag: "div",
      attributes: {
        class: ["ck", "ck-cm-content-link-view", bind.if("hasError", "ck-error")],
        id: bind.to("id"),
        "aria-invalid": bind.if("hasError", true),
        "aria-describedby": bind.to("ariaDescribedById"),
      },
      children: [
        {
          tag: "div",
          attributes: {
            class: ["cm-ck-content-item"],
          },
          children: [
            {
              tag: "span",
              attributes: {
                class: ["cm-core-icons", bind.to("typeClass")],
              },
            },
            {
              tag: "span",
              attributes: {
                class: ["cm-ck-content-item__title"],
              },
              children: [{ text: bind.to("title") }],
            },
            {
              tag: "span",
              attributes: {
                class: ["cm-core-icons", bind.to("statusClass")],
              },
            },
          ],
        },
        this._buttonView,
      ],
    });

    linkUI.on("change:contentUriPath", (evt) => {
      // unsubscribe the currently running subscription
      if (this._contentSubscription) {
        this._contentSubscription.unsubscribe();
      }

      const value = evt.source.contentUriPath;
      if (CONTENT_CKE_MODEL_URI_REGEXP.test(value)) {
        this.#subscribeToContent(value.replace(":", "/"));
      }
    });
  }

  #subscribeToContent(uriPath: UriPath): void {
    serviceAgent
      .fetchService<ContentDisplayService>(new ContentDisplayServiceDescriptor())
      .then((contentDisplayService: ContentDisplayService): void => {
        // save the subscription to be able to unsubscribe later
        this._contentSubscription = contentDisplayService.observe_asLink(uriPath).subscribe({
          next: (received: ContentAsLink) => {
            this.set({
              title: received.content.name,
              typeClass: received.type.classes?.join(" "),
              statusClass: received.state.classes?.join(" "),
            });
          },
        });
      })
      .catch((): void => {
        console.warn("ContentDisplayService not available.");
      });
  }

  #createButtonView(locale: Locale): ButtonView {
    const cancelButton = new ButtonView(locale);
    cancelButton.set({
      label: "x",
      keystroke: "Ctrl+B",
      tooltip: true,
      withText: true,
    });

    return cancelButton;
  }

  destroy(): Promise<never> | null {
    if (this._contentSubscription) {
      this._contentSubscription.unsubscribe();
    }
    super.destroy();
    return null;
  }
}
