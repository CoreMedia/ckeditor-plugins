import { ExampleData } from "../ExampleData";
import { bbCode } from "./BBCode";

const introduction = `${bbCode.p(`\
When it comes to detecting, if data need to be updated within an external \
storage layer, there may be a challenge not to propagate semantically equal \
data. This is at least true, if any update triggers subsequent processes, that \
may be more or less expensive (think of publishing data, translating data, \
etc.).\
`)}\
${bbCode.p(`\
To prevent such propagation in a flow setting data and subsequently getting \
data, a plugin ${bbCode.code("DataFacade")} exists, that will provide some \
caching and may decide to forward the unchanged data instead to the \
storage layer. This enables the storage layer by strict equivalence check just \
to skip a given update.\
`)}\
`;

const debuggingHint = `${bbCode.p(`\
If debug logging is activated, then you will see, that when choosing this \
example, not the data retrieved from CKEditor 5 are forwarded to the storage \
layer, but the cached data.\
`)}\
`;

const elementOrder = `${bbCode.h1("Challenge: Element Order")}\
${introduction}\
${bbCode.p(`\
This challenge is dedicated to element order: \
It does not (really) matter, if the order of elements is \
${bbCode.code("&lt;em&gt;&lt;strong&gt;")} or \
${bbCode.code("&lt;strong&gt;&lt;em&gt;")}. \
CKEditor 5 will prefer one of them when transforming the model state towards \
the data layer.\
`)}\
${debuggingHint}\
${bbCode.h2("Italic, Bold")}\
${bbCode.p(`\
${bbCode.italic(bbCode.bold("italic, bold"))}\
`)}\
${bbCode.h2("Bold, Italic")}\
${bbCode.p(`\
${bbCode.bold(bbCode.italic("bold, italic"))}\
`)}\
`;

export const challengingData: ExampleData = {
  "Challenge: Element Order": elementOrder,
};
