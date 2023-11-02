import { ExampleData } from "../ExampleData";

const text = `\
[h1]\\[code\\]: CKEditor 5 Code Blocks in BBCode[/h1]

The CKEditor 5 BBCode Plugin supports the \\[code\\] tag along with its
optional language identifier.

[h2]No Language Identifier[/h2]

If no language identifier is given, it is assumed, that the code block defaults
to [i]plain text[/i].

[code]
No Language = Plain Text
[/code]

[h2]With Language Identifier[/h2]

[code=bbcode]
\\[code=bbcode\\]
Some BBCode.
\\[/code\\]
[/code]

[h2]Formatting[/h2]

You may apply formatting within code blocks:

[code=bbcode]
[b]\\[i\\][/b]Italic[b]\\[/i\\][/b]
[/code]
`;

export const codeBlockData: ExampleData = {
  "Code Blocks": text,
};
