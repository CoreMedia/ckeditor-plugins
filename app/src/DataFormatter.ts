import { default as formatXml } from "xml-formatter";

export type DataFormatter = (data: string, empty?: string) => string;

export const dataFormatter: {
  xml: DataFormatter;
  text: DataFormatter;
} = {
  xml: (data, empty) =>
    data
      ? formatXml(data, {
          indentation: "  ",
          collapseContent: false,
          whiteSpaceAtEndOfSelfclosingTag: true,
        })
      : (empty ?? ""),
  text: (data, empty) => (data ? data : (empty ?? "")),
};
