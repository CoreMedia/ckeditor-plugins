import "../../../theme/contentlinkview.css";
import type { Editor, LinkUI } from "ckeditor5";
import { LabeledFieldView } from "ckeditor5";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { requireContentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { executeOpenContentInTabCommand } from "../OpenContentInTabCommand";
import { requireNonNullsAugmentedLinkUI } from "./AugmentedLinkUI";
import ContentLinkView from "./ContentLinkView";

/**
 * Creates an ContentLinkView that renders content links in the link form-view.
 * It is initially hidden and must be revealed by removing its hidden class manually.
 *
 * The ContentLinkView is a LabeledFieldView, which contains a ContentView.
 *
 * @param linkUI - the linkUI plugin
 * @param editor - the editor
 * @param onCancel - the callback to execute when the cancel button is clicked
 */
const createContentLinkView = (linkUI: LinkUI, editor: Editor, onCancel: () => void): LabeledFieldView => {
  const logger = LoggerProvider.getLogger("ContentLinkView");
  const { t } = editor.locale;
  const { formView } = requireNonNullsAugmentedLinkUI(linkUI, "formView");
  const contentLinkView = new LabeledFieldView(
    editor.locale,
    () =>
      new ContentLinkView(editor, {
        renderTypeIcon: true,
        renderCancelButton: true,
      }),
  );
  contentLinkView.set({
    label: t("Link"),
    isEmpty: false,
    class: "cm-ck-content-link-view-wrapper",
  });

  // Propagate URI-Path from formView (see FormViewExtension) to ContentLinkView

  const { fieldView } = contentLinkView;
  fieldView.bind("uriPath").to(formView, "contentUriPath");
  // Propagate Content Name from ContentLinkView to FormView, as we require to
  // knowing the name in some link insertion scenarios.

  formView.bind("contentName").to(contentLinkView.fieldView);
  fieldView.on("contentClick", () => {
    const { uriPath } = fieldView;
    if (typeof uriPath === "string") {
      logger.debug(`Executing OpenContentInTabCommand for: ${uriPath}.`);
      executeOpenContentInTabCommand(editor, [requireContentUriPath(uriPath)])
        ?.then((result) => {
          logger.debug("Result for OpenContentInTabCommand by click:", result);
        })
        .catch((reason) => {
          logger.warn("Failed executing OpenContentInTabCommand invoked by click:", reason);
        });
    }
  });
  fieldView.on("executeCancel", onCancel);
  return contentLinkView;
};
export default createContentLinkView;
