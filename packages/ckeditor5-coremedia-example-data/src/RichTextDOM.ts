import { Content, richtext } from "./RichTextBase";

const domParser = new DOMParser();

export const parseRichTextFromString = (
  innerXml: Content = "",
  enforcedNamespaces: readonly string[] = []
): Document => {
  const xml = richtext(innerXml, true, enforcedNamespaces);
  return domParser.parseFromString(xml, "text/xml");
};

export const richTextDocument = parseRichTextFromString("", ["xlink"]);
