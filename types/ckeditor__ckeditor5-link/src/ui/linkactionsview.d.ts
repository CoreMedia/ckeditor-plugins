import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import View from "@ckeditor/ckeditor5-ui/src/view";

export default class LinkActionsView extends View {
  editButtonView: ButtonView;
  readonly focusTracker: any;
  readonly keystrokes: any;
  previewButtonView: ButtonView;
  unlinkButtonView: ButtonView;

  focus(): void;
}
