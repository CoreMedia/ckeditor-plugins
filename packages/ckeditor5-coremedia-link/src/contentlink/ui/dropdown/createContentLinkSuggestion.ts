import { Editor } from "ckeditor5";
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
  contentLinkView.on("contentClick", () => onClick(uriPath));

  return contentLinkView;
};
