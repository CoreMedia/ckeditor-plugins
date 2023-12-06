import { ExampleData } from "../ExampleData";
import { richtext } from "../RichTextBase";
import { h1 } from "../RichTextConvenience";

// noinspection HtmlUnknownAttribute
export const invalidData: ExampleData = {
  "Invalid RichText": richtext(
    `${h1(
      "Invalid RichText",
    )}<p>Parsing cannot succeed below, because xlink-namespace declaration is missing.</p><p>LINK</p>`,
  ).replace("LINK", `<a xlink:href="https://example.org/">Link</a>`),
};
