/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module blocklist/ui/blocklistactionsview
 */

import { View, ViewCollection, FocusCycler } from "@ckeditor/ckeditor5-ui";
import { FocusTracker, KeystrokeHandler, type LocaleTranslate, type Locale } from "@ckeditor/ckeditor5-utils";
import { Editor } from "@ckeditor/ckeditor5-core";
import BlocklistInputView from "./blocklistInputView";
import BlockedWordView from "./blockedWordView";

/**
 * The blocklist actions view consists of a list of blocked words, currently selected, and an input field
 * to add new words to the list.
 */
export default class BlocklistActionsView extends View {
  readonly focusTracker = new FocusTracker();

  readonly keystrokes = new KeystrokeHandler();

  blocklistInputView: BlocklistInputView;

  blockedWordViews: BlockedWordView[];

  /**
   * And array of blocked words.
   * This field is controlled via the blocklistCommand.
   * Every word in this array will create a new BlockedWordView to display the given value.
   *
   */
  public declare blockedWords: string[];

  /**
   * A collection of views that can be focused in the view.
   */
  readonly #focusables = new ViewCollection();

  readonly #focusCycler: FocusCycler;

  public declare t: LocaleTranslate;

  constructor(editor: Editor) {
    super(editor.locale);

    // TODO remove this line
    this.blockedWords = ["hello", "world"];

    this.blocklistInputView = this.createBlocklistInputView(editor.locale);

    this.blockedWordViews = this.createBlockedWordsViews(editor.locale);

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

    this.setTemplate({
      tag: "div",

      attributes: {
        class: ["ck", "cm-ck-blocklist-form", "ck-vertical-form"],

        // https://github.com/ckeditor/ckeditor5-link/issues/90
        tabindex: "-1",
      },

      children: [...this.blockedWordViews, this.blocklistInputView],
    });
  }

  public override render(): void {
    super.render();

    const childViews = [...this.blockedWordViews, this.blocklistInputView];

    childViews.forEach((childView) => {
      // Register the view as focusable.
      this.#focusables.add(childView);

      // Register the view in the focus tracker.
      if (childView.element) {
        this.focusTracker.add(childView.element);
      }
    });

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

  createBlocklistInputView(locale: Locale): BlocklistInputView {
    const blockListInputView = new BlocklistInputView(locale);
    return blockListInputView;
  }

  createBlockedWordsViews(locale: Locale): BlockedWordView[] {
    return this.blockedWords.map((word) => {
      const view = new BlockedWordView(locale);
      view.set("label", word);
      return view;
    });
  }
}
