import { ExampleData } from "../ExampleData";

const text = `\
[h1]Paragraphs in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports implicit paragraphs and integrates
with the
[url=https://ckeditor.com/docs/ckeditor5/latest/api/paragraph.html]Paragraph feature[/url]
available for CKEditor 5.

[h2]Design Scope[/h2]

There is no clear definition how line breaks are handled within BBCode. Most
BBCode processors do not add paragraphs, but instead replace any newline by
a <br> tag. Such a mapping would clash with several features of CKEditor 5,
though.

Instead, the provided processing follows the same rule as for Markdown (also
suggested by some for processing BBCode): Any two consecutive newlines denote
a paragraph.

The CKEditor 5 BBCode plugin takes a minor detour here, not to break, for
example, inline tags, such as \\[b\\] or \\[i\\]: Within these tags, no
paragraphs will be created.

[h2]Paragraph Example[/h2]

A paragraph is denoted by an additional newline.

That is why this line is placed into an extra paragraph.
`;

export const paragraphData: ExampleData = {
  Paragraphs: text,
};
