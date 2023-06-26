/**
 * @module blocklist/ui/blocklistactionsview
 */

import { View, ViewCollection, FocusCycler, ListView } from "@ckeditor/ckeditor5-ui";
import { FocusTracker, KeystrokeHandler, type Locale } from "@ckeditor/ckeditor5-utils";
import { Editor } from "@ckeditor/ckeditor5-core";
import BlocklistInputView from "./blocklistInputView";
import BlockedWordView from "./blockedWordView";

/**
 * The blocklist actions view consists of a list of blocked words, currently selected, and an input field
 * to add new words to the list.
 */
export default class BlocklistActionsView extends View {
  // Focus handling
  readonly focusTracker = new FocusTracker();
  readonly keystrokes = new KeystrokeHandler();
  readonly #focusables = new ViewCollection();
  readonly #focusCycler: FocusCycler;

  /**
   * A view, holding an input field to add new words to the list.
   */
  blocklistInputView: BlocklistInputView;

  /**
   * A list, displaying currently selected words from the list.
   */
  blockedWordlistView: ListView;

  /**
   * The editor instance.
   */
  editor: Editor;

  /**
   * The list of words, to be displayed in this view.
   * Used to create a ViewList, that represents the words in the current selection.
   */
  public declare blockedWords: string[];

  constructor(editor: Editor) {
    super(editor.locale);

    this.editor = editor;

    this.blockedWords = [];

    // create all views
    this.blocklistInputView = this.createBlocklistInputView(editor.locale);
    this.blockedWordlistView = this.createBlockedWordListView(editor.locale);

    // init focus handling
    this.#focusCycler = new FocusCycler({
      focusables: this.#focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate fields backwards using the Shift + Tab keystroke.
        focusPrevious: "shift + tab",

        // Navigate fields forwards using the Tab key.
        focusNext: "tab",
      },
    });

    // set the view template
    this.setTemplate({
      tag: "div",
      attributes: {
        class: ["ck", "cm-ck-blocklist-form", "ck-vertical-form"],
        tabindex: "-1",
      },
      children: [this.blockedWordlistView, this.blocklistInputView],
    });
  }

  refreshList() {
    this.blockedWordlistView.items.clear();
    this.blockedWords.forEach((word) => {
      const view = new BlockedWordView(this.editor.locale);
      view.delegate("unblock").to(this);
      view.set("label", word);
      this.blockedWordlistView.items.add(view);
    });
  }

  public override render(): void {
    super.render();

    this.#focusables.add(this.blocklistInputView.wordToBlockInputView);
    this.#focusables.add(this.blocklistInputView.saveButtonView);
    this.#focusables.add(this.blockedWordlistView);

    if (this.blocklistInputView.wordToBlockInputView.element) {
      this.focusTracker.add(this.blocklistInputView.wordToBlockInputView.element);
    }

    if (this.blocklistInputView.saveButtonView.element) {
      this.focusTracker.add(this.blocklistInputView.saveButtonView.element);
    }

    if (this.blockedWordlistView.element) {
      this.focusTracker.add(this.blockedWordlistView.element);
    }

    // Start listening for the keystrokes coming from #element.
    if (this.element) {
      this.keystrokes.listenTo(this.element);
    }
  }

  public override destroy(): void {
    super.destroy();
    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  public focus(): void {
    this.#focusCycler.focusFirst();
  }

  /**
   * Creates the input view, used to add new words to the list.
   *
   * @param locale - the editor's locale.
   */
  createBlocklistInputView(locale: Locale): BlocklistInputView {
    return new BlocklistInputView(locale);
  }

  /**
   * Creates the list view, used to display all words in the list,
   * based on the current selection inside the editor.
   *
   * @param locale - the editor's locale.
   */
  createBlockedWordListView(locale: Locale): ListView {
    const listView = new ListView();
    this.blockedWords.forEach((word) => {
      const view = new BlockedWordView(locale);
      view.set("label", word);
      view.delegate("unblock").to(this);
      listView.items.add(view);
    });
    return listView;
  }
}
