import type { ExampleData } from "../ExampleData";
import { richtext } from "../RichTextBase";

export const simpleData: ExampleData = {
  "Empty: ''": "",
  "Empty Paragraph: '<p></p>'": richtext(`<p></p>`),
  "Empty Paragraph: '<p/>'": richtext(`<p/>`),
  "Hello": richtext(`<p>Hello World!</p>`),
};
