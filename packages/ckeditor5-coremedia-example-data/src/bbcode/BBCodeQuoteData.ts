import type { ExampleData } from "../ExampleData";

const introduction = `\
[h1]\\[quote\\]: CKEditor 5 Block Quotes in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[quote\\] tag and integrates
with the
[url=https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html]Block quote feature[/url]
available for CKEditor 5.
`;

const minimalScenarios = `\
${introduction}

[h2]Minimal Scenarios[/h2]

[quote]Quote in one line with only plain-text.[/quote]

[quote][b]Quote[/b] in one line with some [u]nested[/u] tag-nodes.[/quote]

[quote]
Quote with minor pretty printing.
[/quote]

[quote]

Quote with some
extra newlines.

[/quote]

[quote]
Paragraphs within quotes.

They are supported, too!
[quote]
`;

const nestedScenarios = `\
${introduction}

[h2]Nested Scenarios[/h2]

[quote]Nested quotes in one line. Before.[quote]Nested[/quote]After.[/quote]

[quote]
Nested quotes with minor pretty-printing.
Before.
[quote]
Nested.
[/quote]
After.
[/quote]

[quote]
  Nested quotes with pretty-print-indents.
  Before.
  [quote]
    Nested.
  [/quote]
  After.
[/quote]
`;

export const quoteData: ExampleData = {
  "Quotes: Minimal": minimalScenarios,
  "Quotes: Nested": nestedScenarios,
};
