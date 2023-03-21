import View from "@ckeditor/ckeditor5-ui/src/view";

/**
 * The CoreMedia icon view class.
 * Used to display icons in CoreMedia Studio.
 * Renders a span with css icon classes.
 */
export default class CoreMediaIconView extends View {
  declare iconClass: string | undefined;
  declare id: string;

  constructor() {
    super();

    const bind = this.bindTemplate;

    /*
     * The additional css class of the icon element.
     *
     * @observable
     * @member {String} #typeClass
     * @default undefined
     */
    this.set("iconClass", undefined);

    /*
     * The id of the icon element.
     *
     * @observable
     * @member {String} #id
     * @default ""
     */
    this.set("id", "");

    this.setTemplate({
      tag: "span",
      attributes: {
        id: bind.to("id"),
        class: ["cm-core-icons", bind.to("iconClass")],
      },
    });
  }
}
