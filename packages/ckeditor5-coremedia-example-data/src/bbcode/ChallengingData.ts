import type { ExampleData } from "../ExampleData";

const introduction = `\
When it comes to detecting, if data need to be updated within an external
storage layer, there may be a challenge not to propagate semantically equal
data. This is at least true, if any update triggers subsequent processes, that
may be more or less expensive (think of publishing data, translating data,
etc.).

To prevent such propagation in a flow setting data and subsequently getting
data, a plugin "DataFacade" exists, that will provide some caching and may
decide to forward the unchanged data instead to the  storage layer. This enables
the storage layer by strict equivalence check just  to skip a given update.\
`;

const debuggingHint = `\
If debug logging is activated, then you will see, that when choosing this
example, not the data retrieved from CKEditor 5 are forwarded to the storage
layer, but the cached data.
`;

const elementOrder = `\
[h1]Challenge: Element Order[/h1]

${introduction}

This challenge is dedicated to element order: In HTML it does not (really)
matter, if the order of elements is <em><strong> or <strong><em>.
CKEditor 5 will prefer one of them when transforming the model state towards
the data layer.

${debuggingHint}

[h2]Italic, Bold[/h2]

[code=bbcode]
\\[i\\]\\[b\\]italic, bold\\[/b\\]\\[/i\\]
[/code]

Rendered as:

[i][b]italic, bold[/b][/i]

[h2]Bold, Italic[/h2]

[code=bbcode]
\\[b\\]\\[i\\]bold, italic\\[/i\\]\\[/b\\]
[/code]

Rendered as:

[b][i]bold, italic[/i][/b]
`;

export const challengingData: ExampleData = {
  "Challenge: Element Order": elementOrder,
};
