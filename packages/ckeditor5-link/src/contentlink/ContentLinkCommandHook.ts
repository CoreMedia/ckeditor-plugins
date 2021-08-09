import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";
import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";
import Text from "@ckeditor/ckeditor5-engine/src/model/text";
import Position from "@ckeditor/ckeditor5-engine/src/model/position";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";

type InsertContentCallback = (eventInfo: EventInfo, params: unknown[]) => void;

interface NextData {
  text: Text;
  href: string;
}

interface Next {
  data?: NextData;
}

/**
 * LinkCommand has a special handling when inserting links with a collapsed
 * (not expanded) selection (aka: no selection). We need to take care of this
 * behavior, which is, that LinkCommand inserts the `linkHref` attribute as
 * text within the editor and afterwards places the cursor after the link.
 *
 * For content-links this is no valid approach. We don't want `content:123`
 * to be written into the CKEditor text field. We want the content's name
 * to be written (and, perhaps, if not available because of concurrent changes,
 * fallback to the `content:123` form.
 *
 * To do so, we have several approaches, where some are expected not to work
 * or to produce unexpected behavior.
 *
 * **Option 1: Listening to model.insertContent:**
 *
 * We could listen to `model.insertContent`. We would get all relevant information
 * to know, that we have to adapt something. But there is no way to veto
 * `insertContent` or to replace the inserted text. Thus, we would have to fix
 * the text after `LinkCommand` already inserted it. This may cause visible
 * changes (flicker) in the UI and it will generate two undo steps, where the
 * first one is a text `content:123` having a link and the second one is changing
 * the link text to the content's name.
 *
 * **Option 2: Applying Changes in a Post-Fixer**
 *
 * The best approach to _veto_ changes from other sources is a post-fixer,
 * registered at document. It will create just one Undo-step. Nevertheless,
 * we have an issue here, as the LinkCommand not only inserts the text, but
 * also adjusts the cursor position to be directly behind the just inserted
 * link (so that, when you continue typing, the link is not continued).
 *
 * **Option 3:** Listen to _Submit_ button in LinkUI's FormView**
 *
 * Listening has to be done with high priority, so that this is done before
 * the LinkCommand executes. If there is a collapsed selection, write the
 * content's name into the CKEditor and select the just written text. Then,
 * LinkCommand will assume that the link has to be applied to the just selected
 * text. Caveat: This will most likely generate two undo steps instead of one.
 * Not a bug but a feature? This could be perceived as feature: You could add a
 * link and undo once, and you will have the plain document name in your Richtext.
 *
 * Challenge here: We already listen to the Submit button for the LinkTarget
 * feature. We would have to ensure running even before `LinkTarget`, as
 * otherwise `LinkTarget` will make the wrong assumption. This may apply to
 * any feature which adds additional fields to link creation.
 */
class ContentLinkCommandHook extends Plugin {
  static readonly pluginName: string = "ContentLinkCommandHook";

  readonly #next: Next = {};

  /**
   * Callback to listen to insertContent event. Stored, because we need to remove
   * the listener on destroy.
   * @private
   */
  #insertContentCallback?: InsertContentCallback;

  static get requires(): Array<new (editor: Editor) => Plugin> {
    // The LinkEditing registers the command, which we want to hook into.
    return [LinkEditing];
  }

  init(): null {
    const editor = this.editor;
    const model = editor.model;
    const document = model.document;

    /*
     * Callbacks: We need to create an extra "redirection" as otherwise, we
     * won't have access to `this` anymore. This applies to "insertContent"
     * listener as well as the post-fixer.
     */

    document.registerPostFixer((writer) => this.#postFix(writer));

    this.#insertContentCallback = (eventInfo: EventInfo, args: unknown[]) => this.#interceptInsertContent(args);

    model.on("insertContent", (eventInfo: EventInfo, args: unknown[]) => this.#interceptInsertContent(args));

    return null;
  }

  destroy(): null {
    const editor = this.editor;
    const model = editor.model;

    model.off("insertContent", this.#insertContentCallback);

    this.#next.data = undefined;
    this.#insertContentCallback = undefined;

    return null;
  }

  #postFix(writer: Writer): boolean {
    const { data } = this.#next;

    // Parent: We don't want to apply changes to unattached text node.
    if (!data || !data.text.parent) {
      // We have nothing to do and did not change anything.
      return false;
    }

    const { text, href } = data;

    // Clear next.
    this.#next.data = undefined;

    /*
     * We need to remember the position of the original text. This is because
     * we need to remove the text prior to adding a new one, as otherwise
     * the text nodes will be merged by CKEditor, which again makes it impossible
     * to remove the original text.
     * Prevent to do that again.
     */
    const position = writer.createPositionBefore(text);
    const attrs = text.getAttributes();

    // We first need to remove the text, as otherwise it will be merged with
    // the next text to add.
    writer.remove(text);
    writer.insertText(`ACME (${href})`, attrs, position);

    return true;
  }

  #interceptInsertContent(args: unknown[]): void {
    // We expect at least two arguments from `insertContent` triggered by
    // LinkCommand: Text node (with href attribute) and position to insert.
    if (args.length >= 2) {
      const [text, position] = args;

      if (text instanceof Text && position instanceof Position) {
        if (text.hasAttribute("linkHref")) {
          const href = <string>text.getAttribute("linkHref");
          if (CONTENT_CKE_MODEL_URI_REGEXP.test(href)) {
            this.#next.data = {
              text: text,
              href: href,
            };
          }
        }
      }
    }
  }
}

export default ContentLinkCommandHook;
