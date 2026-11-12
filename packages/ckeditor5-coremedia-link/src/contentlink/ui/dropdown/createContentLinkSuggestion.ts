import type { Editor } from "ckeditor5";
import ContentLinkView from "../ContentLinkView";

export interface ContentLinkSuggestionProps {
  editor: Editor;
  uriPath: string;
  onClick: (uriPath: string) => void;
}

export const createContentLinkSuggestion: (props: ContentLinkSuggestionProps) => ContentLinkView = ({
  editor,
  uriPath,
  onClick,
}): ContentLinkView => {
  const contentLinkView = new ContentLinkView(editor, { renderTypeIcon: true, renderStatusIcon: true });

  contentLinkView.set("uriPath", uriPath);
  contentLinkView.set("contentName", editor.locale.t("Loading Content..."));
  contentLinkView.set("ariaLabelText", editor.locale.t("Loading Content..."));
  contentLinkView.on("contentClick", () => onClick(uriPath));

  return contentLinkView;
};
