import { ifCommand } from "@coremedia/ckeditor5-core-common/src/Commands";
import blocklistIcon from "../theme/icons/blocklist.svg";
import {
  Plugin,
  ButtonView,
  clickOutsideHandler,
  ContextualBalloon,
  TextProxy,
  ViewAttributeElement,
  ViewDocumentClickEvent,
  ViewDocumentFragment,
  ViewNode,
  ViewPosition,
  PositionOptions,
} from "ckeditor5";
import BlocklistCommand, { BLOCKLIST_COMMAND_NAME } from "./blocklistCommand";
import BlocklistActionsView from "./ui/blocklistActionsView";
import "./lang/blocklist";
import { UnblockEvent } from "./ui/blockedWordView";
import BlocklistEditing from "./blocklistediting";
const BLOCKLIST_KEYSTROKE = "Ctrl+Shift+B";

/**
 * The Blocklist UI plugin. It introduces the `'blocklist'` button and support for the <kbd>Ctrl+Shift+B</kbd> keystroke.
 * It also creates the views, that are displayed inside the contextual balloon when triggered by the button, click or
 * keystroke.
 *
 * It uses the contextual balloon plugin.
 */
export default class Blocklistui extends Plugin {
  static readonly pluginName: string = "BlocklistUI";
  static readonly requires = [ContextualBalloon, BlocklistEditing];
  blocklistActionsView?: BlocklistActionsView;
  blocklistCommand: BlocklistCommand | undefined;
  #balloon: ContextualBalloon | undefined = undefined;
  async init(): Promise<void> {
    const editor = this.editor;
    this.blocklistCommand = (await ifCommand(editor, BLOCKLIST_COMMAND_NAME)) as BlocklistCommand;
    this.#balloon = editor.plugins.get(ContextualBalloon);

    // listen to click and key events to open the blocklist balloon
    this.#initBalloonListeners();

    // adds a blocklist button to the componentFactory
    this.#createBlocklistToolbarButton(this.blocklistCommand);

    // listen to click and key events while the balloon is open (to navigate or close the balloon)
    this.#initBalloonViewListeners();
    this.blocklistActionsView = this.#createBlocklistActionsView();
    this.blocklistActionsView.bind("blockedWords").to(this.blocklistCommand, "value");

    // listen to changes in blocklistCommand and refresh the list in the blocklist view accordingly
    this.blocklistCommand.on("change:value", this.blocklistActionsView.refreshList.bind(this.blocklistActionsView));
  }
  #getBlocklistActionsView(): BlocklistActionsView {
    if (!this.blocklistActionsView) {
      this.blocklistActionsView = this.#createBlocklistActionsView();
    }
    return this.blocklistActionsView;
  }

  /**
   * Creates the blocklist view, that will be displayed inside a contextual balloon.
   * Also registers a listener to close the view on ESC when the view is focused.
   *
   * @private
   */
  #createBlocklistActionsView(): BlocklistActionsView {
    const editor = this.editor;
    const blocklistActionsView = new BlocklistActionsView(editor);
    this.listenTo(blocklistActionsView.blocklistInputView, "submit", () => {
      const blockWordInput = blocklistActionsView.blocklistInputView.getInputElement();
      if (!this.blocklistCommand) {
        return;
      }

      // Return, if the word is already in the blocklist
      const blocklistCommandValue = this.blocklistCommand.value;
      if (blocklistCommandValue.includes(blockWordInput.value)) {
        return;
      }

      // Add markers and sync with service
      const editingPlugin = editor.plugins.get(BlocklistEditing);
      editingPlugin.addBlocklistWord(blockWordInput.value);
      const newValue = [...blocklistCommandValue, blockWordInput.value];
      this.blocklistCommand.set("value", newValue);

      // Clear the input
      blocklistActionsView.blocklistInputView.setInputText("");
    });

    // Execute unblock command after clicking on the "remove" button.
    this.listenTo<UnblockEvent>(blocklistActionsView, "unblock", (eventInfo, wordToUnblock) => {
      if (!this.blocklistCommand) {
        return;
      }

      // Remove markers
      const editingPlugin = editor.plugins.get(BlocklistEditing);
      editingPlugin.removeBlocklistWord(wordToUnblock);
      const blocklistCommandValue = this.blocklistCommand.value;
      const index = blocklistCommandValue.indexOf(wordToUnblock);
      blocklistCommandValue.splice(index, 1);
      this.blocklistCommand.set("value", [...blocklistCommandValue]);

      // Close blocklist balloon if last word has been unblocked
      if (blocklistCommandValue.length === 0) {
        this.#hideBlocklistBalloon();
      }
    });

    // Close the panel on esc key press when the **form has focus**.
    blocklistActionsView.keystrokes.set("Esc", (data, cancel) => {
      this.#hideBlocklistBalloon();
      cancel();
    });
    return blocklistActionsView;
  }

  /**
   * The button for the editor's main toolbar that opens the blocklist view in the balloon.
   *
   * @param command - the blocklist command
   * @private
   */
  #createBlocklistToolbarButton(command: BlocklistCommand) {
    const editor = this.editor;
    const t = editor.t;
    editor.ui.componentFactory.add("blocklist", (locale) => {
      const button = new ButtonView(locale);
      button.isEnabled = true;
      button.label = t("Manage Blocklist");
      button.icon = blocklistIcon;
      button.keystroke = BLOCKLIST_KEYSTROKE;
      button.class = "open-blocklist";
      button.tooltip = true;
      button.isToggleable = true;

      // Bind button to the command.
      button.bind("isEnabled").to(command, "isEnabled");
      button.bind("isOn").to(command, "value", (value: string[]) => value && value.length > 0);

      // Show the panel on button click.
      this.listenTo(button, "execute", () => {
        this.#showBlocklistBalloonConsideringSelection();
      });
      return button;
    });
  }

  /**
   * Opens the blocklist balloon, considering the current selection.
   * If one or more blocked words are selected, the balloon will be opened with
   * those words. Otherwise, the balloon will be opened with an empty list.
   *
   * @private
   */
  #showBlocklistBalloonConsideringSelection() {
    const blockedWords = this.#getSelectedBlocklistWords();
    if (!blockedWords || blockedWords.length === 0) {
      this.#showBlocklistBalloon(true);
      return;
    }

    // Set the currently selected words in the blocklist command
    this.blocklistCommand?.set("value", blockedWords);
    this.#showBlocklistBalloon(true);
  }

  /**
   * Opens the balloon with the blocklist actions view.
   *
   * @param forceFocus - forces the balloon to focus blocklist view.
   * @private
   */
  #showBlocklistBalloon(forceFocus = false): void {
    if (!this.#balloon) {
      return;
    }

    // Set the value of the input element in the blocklist balloon to the current selection
    // For clicks on a blocked word, no value is set since the selection is collapsed
    this.#getBlocklistActionsView().blocklistInputView.setInputText(this.#getSelectedText());
    this.#addBalloonView();
    if (forceFocus) {
      this.#getBlocklistActionsView().focus();
    }
  }

  /**
   * Closes the blocklist actions view in the contextual balloon.
   * If another view is present, that one will be shown instead.
   *
   * @private
   */
  #hideBlocklistBalloon(): void {
    const editor = this.editor;
    this.stopListening(editor.ui, "update");
    this.stopListening(this.#balloon, "change:visibleView");

    // Make sure the focus always gets back to the editable _before_ removing the focused form view.
    // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
    editor.editing.view.focus();

    // Blur the input element before removing it from DOM to prevent issues in some browsers.
    // See https://github.com/ckeditor/ckeditor5/issues/1501.
    if (this.blocklistActionsView) {
      this.blocklistActionsView.blocklistInputView.saveButtonView.focus();
    }
    // Then remove the blocklist.
    if (this.#balloon && this.blocklistActionsView) {
      this.#balloon.remove(this.blocklistActionsView);
    }

    // reset the command value
    this.blocklistCommand?.set("value", []);
  }

  /**
   * Adds the blocklist view to the balloon views.
   * This will result in opening the balloon, if it was not visible until now.
   *
   * @private
   */
  #addBalloonView(): void {
    if (!this.#balloon) {
      return;
    }
    this.#balloon.add({
      view: this.#getBlocklistActionsView(),
      position: this.#getBalloonPositionData(),
    });
  }
  #getBalloonPositionData(): Partial<PositionOptions> {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();
    const target: PositionOptions["target"] = () => {
      const targetWord = selectedElement;
      if (targetWord) {
        const targetWordViewElement = view.domConverter.mapViewToDom(targetWord);
        if (targetWordViewElement) {
          return targetWordViewElement;
        }
      }

      // Otherwise attach panel to the selection.
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange()!);
    };
    return {
      target,
    };
  }

  /**
   * Initializes listeners to open the balloon, or switch to the blocklist balloon view.
   * The balloon opens, if the command is enabled and the shortcut is pressed,
   * or if a blocked word is clicked on.
   *
   * @private
   */
  #initBalloonListeners(): void {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    // Handle click on view document and show panel when selection is placed inside a blocked element.
    this.listenTo<ViewDocumentClickEvent>(viewDocument, "click", () => {
      const view = this.editor.editing.view;
      const selection = view.document.selection;
      if (!selection.isCollapsed) {
        // If an author is selecting a range of text, we suppose that the authors intention
        // is not to open the blocked words balloon even if blocked words are part of the selection.
        return;
      }
      const blockedWords = this.#getSelectedBlocklistWords();
      if (!blockedWords || blockedWords.length === 0) {
        return;
      }

      // Set the currently selected words in the blocklist command
      this.blocklistCommand?.set("value", blockedWords);

      // Then show panel but keep focus inside editor editable.
      this.#showBlocklistBalloon();
    });

    // Handle the blocklist keystroke and show the panel.
    editor.keystrokes.set(BLOCKLIST_KEYSTROKE, (keyEvtData, cancel) => {
      // Prevent focusing the search bar in FF, Chrome and Edge. See https://github.com/ckeditor/ckeditor5/issues/4811.
      cancel();
      if (editor.commands.get(BLOCKLIST_COMMAND_NAME)?.isEnabled) {
        this.#showBlocklistBalloonConsideringSelection();
      }
    });
  }

  /**
   * Initializes listeners to close the balloon, or navigate the blocklist balloon view.
   * These listeners will only execute while the balloon is shown and the blocklist view is visible.
   *
   * @private
   */
  #initBalloonViewListeners(): void {
    // Focus the blocklist view if the balloon is visible and the Tab key has been pressed.
    this.editor.keystrokes.set(
      "Tab",
      (data, cancel) => {
        if (this.#isBlocklistVisible() && !this.#getBlocklistActionsView().focusTracker.isFocused) {
          this.#getBlocklistActionsView().focus();
          cancel();
        }
      },
      {
        // Use the normal priority because the link UI navigation is more important
        priority: "normal",
      },
    );

    // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
    this.editor.keystrokes.set("Esc", (data, cancel) => {
      if (this.#isBlocklistVisible()) {
        this.#hideBlocklistBalloon();
        cancel();
      }
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.#getBlocklistActionsView(),
      activator: () => this.#isBlocklistViewInBalloonPanel(),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      contextElements: () => [this.#balloon!.view.element!],
      callback: () => this.#hideBlocklistBalloon(),
    });
  }

  /**
   * Returns `true` when {@link #blocklistActionsView} is in the balloon, and it is
   * currently visible.
   */
  #isBlocklistVisible(): boolean {
    if (!this.#balloon) {
      return false;
    }
    return !!this.blocklistActionsView && this.#balloon.visibleView === this.blocklistActionsView;
  }

  /**
   * Returns `true` when {@link #blocklistActionsView} is in the balloon.
   */
  #isBlocklistViewInBalloonPanel(): boolean {
    if (!this.#balloon) {
      return false;
    }
    return !!this.blocklistActionsView && this.#balloon.hasView(this.blocklistActionsView);
  }

  /**
   * Returns a list of blocked words, based on the current cursor position.
   * A list will only be returned if the selection is collapsed.
   *
   * @returns All words, displayed by markers at the current position
   */
  #getSelectedBlocklistWords(): string[] | undefined {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const firstRange = selection.getFirstRange();
    if (!firstRange) {
      return undefined;
    }
    const positions = firstRange.getPositions();
    const blockedWords: Set<string> = new Set<string>();
    for (const position of positions) {
      const words = this.#getAllBlockedWordsForPosition(position);
      words.forEach((word) => blockedWords.add(word));
    }
    return Array.from(blockedWords.values());
  }

  /**
   * Returns the raw text in the currently selected editor content.
   *
   * @private
   */
  #getSelectedText(): string {
    const selection = this.editor.model.document.selection;
    const range = selection.getFirstRange();
    const isTextProxy = (node: unknown): node is TextProxy =>
      // eslint-disable-next-line no-null/no-null
      typeof node === "object" && node !== null && "data" in node;
    if (range) {
      return Array.from(range.getItems())
        .filter((item) => isTextProxy(item))
        .map((item) => {
          if (isTextProxy(item)) {
            return item.data;
          }
          return "";
        })
        .join("");
    }
    return "";
  }

  /**
   * Returns whether a node is of type ViewAttributeElement or not.
   * Returns true for different types, such as element, node, view:attributeElement, view:element etc.
   *
   * @param node - the ViewNode or ViewDocumentFragment to be checked.
   * @returns true if the node is of type ViewAttributeElement
   */
  #isViewAttributeElement(node: ViewNode | ViewDocumentFragment): boolean {
    return node.is("attributeElement");
  }

  /**
   * Returns the value of the data attribute that holds the value of the blocked word.
   *
   * @param node - the node, containing the attribute
   * @returns the attribute value or undefined if not existing
   */
  #getBlocklistWordAttribute(node: ViewAttributeElement): string | undefined {
    return node.getAttribute("data-blocklist-blocked-word");
  }

  /**
   * Returns all blocked words for the current selection position.
   *
   * @param position - the position to check for
   * @returns the list of words
   */
  #getAllBlockedWordsForPosition(position: ViewPosition): string[] {
    return position
      .getAncestors()
      .filter((ancestor): ancestor is ViewAttributeElement => this.#isViewAttributeElement(ancestor))
      .map((ancestor) => this.#getBlocklistWordAttribute(ancestor))
      .filter((attribute) => attribute !== undefined) as string[];
  }
}
