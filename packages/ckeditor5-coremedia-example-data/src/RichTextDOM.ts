import { richtext } from "./RichTextBase";

export const richTextDocument = () => {
  const xml = richtext("", true, ["xlink"]);
  return new DOMParser().parseFromString(xml, "text/xml");
};
