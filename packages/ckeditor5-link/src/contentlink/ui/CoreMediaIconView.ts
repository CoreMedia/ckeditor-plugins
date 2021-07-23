import View from "@ckeditor/ckeditor5-ui/src/view";

/**
 * The CoreMedia icon view class.
 * Used to display icons in CoreMedia Studio.
 * Renders a span with css icon classes.
 */
export default class CoreMediaIconView extends View {
  /**
   * @inheritDoc
   */
  constructor() {
    super();

    const bind = this.bindTemplate;

    /**
     * The additional css class of the icon element.
     *
     * @observable
     * @member {String} #typeClass
     * @default undefined
     */
    this.set("iconClass", undefined);

    this.setTemplate({
      tag: "span",
      attributes: {
        class: ["cm-core-icons", bind.to("iconClass")],
      },
    });
  }
}
