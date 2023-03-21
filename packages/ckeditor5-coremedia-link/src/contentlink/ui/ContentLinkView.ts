import { serviceAgent } from "@coremedia/service-agent";
import { createContentDisplayServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentDisplayServiceDescriptor";
import { Subscription } from "rxjs";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  requireContentUriPath,
  UriPath,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import ContentAsLink from "@coremedia/ckeditor5-coremedia-studio-integration/content/ContentAsLink";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import CoreMediaIconView from "./CoreMediaIconView";
import CancelButtonView from "./CancelButtonView";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

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

  /**
   * The editor
   *
   * @private
   */
  #editor: Editor;

  #contentSubscription: Subscription | undefined = undefined;
  readonly #typeIcon: CoreMediaIconView | undefined = undefined;
  readonly #statusIcon: CoreMediaIconView | undefined = undefined;
  readonly #cancelButton: ButtonView | undefined = undefined;

  declare uriPath: string | undefined;
  declare contentName: string | undefined;
  declare renderAsTextLink: boolean;
  declare ariaLabelText: string;

  constructor(
    editor: Editor,
    renderOptions?: {
      renderTypeIcon?: boolean;
      renderStatusIcon?: boolean;
      renderCancelButton?: boolean;
    }
  ) {
    super(editor.locale);

    const bind = this.bindTemplate;
    this.renderOptions = renderOptions;
    this.#editor = editor;

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

    /*
     * The aria label usually just points to the label of the button. Since we want to
     * add information about the document type to the aria label and not to the text
     * of the button, the best solution is to remove the "aria-labelledby" attribute and
     * use "aria-label" instead.
     *
     * @observable
     * @member {string} #ariaLabelText
     * @default empty string
     */
    this.set("ariaLabelText", "");

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
      this.#cancelButton.delegate("execute").to(this, "executeCancel");
    }
    this.delegate("execute").to(this, "executeContentLink");

    this.extendTemplate({
      attributes: {
        "class": [
          "cm-ck-content-link-view",
          // @ts-expect-errors since 37.0.0, how to extend the view with another property?
          bind.if("underlined", "cm-ck-button--underlined"),
          bind.if("renderAsTextLink", "ck-link-actions__preview"),
        ],
        "aria-label": bind.to("ariaLabelText"),
      },
    });

    this.listenTo(this, "executeContentLink", () => {
      // If cancel button is executed, this button also executes
      // We must not fire the contentClick event then. Therefore, check
      // if executeCancel already removed the uriPath
      if (this.uriPath) {
        this.fire("contentClick");
      }
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

      const hasUriPath = this.hasUriPathProperty(evt.source);
      if (!hasUriPath) {
        return;
      }
      const value = evt.source.uriPath;
      if (typeof value === "string" && CONTENT_CKE_MODEL_URI_REGEXP.test(value)) {
        this.#subscribeToContent(requireContentUriPath(value));
      }
    });
  }

  hasUriPathProperty(obj: object): obj is { uriPath: string } {
    return "uriPath" in obj;
  }

  render(): void {
    super.render();
    if (this.renderOptions?.renderStatusIcon) {
      if (!this.#statusIcon) {
        throw new Error(
          "Unexpected State: Although render options request rendering a status icon, the required status icon is not available."
        );
      }
      this.children.add(this.#statusIcon);
    }

    if (this.renderOptions?.renderCancelButton) {
      if (!this.#cancelButton) {
        throw new Error(
          "Unexpected State: Although render options request rendering a cancel icon, the required cancel icon is not available."
        );
      }
      this.children.add(this.#cancelButton);
    }
    if (this.element) {
      this.element.removeAttribute("aria-labelledby");
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
      .fetchService(createContentDisplayServiceDescriptor())
      .then((contentDisplayService): void => {
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
                ariaLabelText: `${received.type.name}: ${received.content.name}`,
              });
            },
          })
        );
      })
      .catch((reason): void => {
        console.warn("ContentDisplayService not available.", reason);
      });
  }

  get cancelButton(): ButtonView | undefined {
    return this.#cancelButton;
  }

  destroy(): void {
    // Prevent possible asynchronous events from re-triggering subscription.
    this.#acceptSubscriptions = false;
    this.#endContentSubscription();
    super.destroy();
  }
}
