import { ExampleData } from "../ExampleData";
import { h1, p, em, strong, richtext, h2, code, a } from "../RichText";

const introduction = `${p(`\
When it comes to detecting, if data need to be updated within an external \
storage layer, there may be a challenge not to propagate semantically equal \
data. This is at least true, if any update triggers subsequent processes, that \
may be more or less expensive (think of publishing data, translating data, \
etc.).\
`)}\
${p(`\
To prevent such propagation in a flow setting data and subsequently getting \
data, a plugin ${code("DataFacade")} exists, that will provide some \
caching and may decide to forward the unchanged data instead to the \
storage layer. This enables the storage layer by strict equivalence check just \
to skip a given update.\
`)}\
`;

const debuggingHint = `${p(`\
If debug logging is activated, then you will see, that when choosing this \
example, not the data retrieved from CKEditor 5 are forwarded to the storage \
layer, but the cached data.\
`)}\
`;

const elementOrder = `${h1("Challenge: Element Order")}\
${introduction}\
${p(`\
This challenge is dedicated to element order: \
It does not (really) matter, if the order of elements is \
${code("&lt;em&gt;&lt;strong&gt;")} or \
${code("&lt;strong&gt;&lt;em&gt;")}. \
CKEditor 5 will prefer one of them when transforming the model state towards \
the data layer.\
`)}\
${debuggingHint}\
${h2("EM, STRONG")}\
${p(`\
${em(strong("em, strong"))}\
`)}\
${h2("STRONG, EM")}\
${p(`\
${strong(em("strong, em"))}\
`)}\
`;

// noinspection HtmlUnknownAttribute
const attributeOrder = `${h1("Challenge: Attribute Order")}\
${introduction}\
${p(`\
This challenge is dedicated to attribute order: \
It does not (really) matter, if the order of attributes is \
${code("xlink:href")}, ${code("xlink:show")} or \
${code("xlink:show")}, ${code("xlink:href")} . \
CKEditor 5 will prefer one of them when transforming the model state towards \
the data layer.\
`)}\
${debuggingHint}\
${h2("HREF, SHOW")}\
${p(`\
<a xlink:href="https://example.org/" xlink:show="new">href, show</a>\
`)}\
${h2("SHOW, HREF")}\
${p(`\
<a xlink:show="new" xlink:href="https://example.org/">show, href</a>
`)}\
`;

export const challengingData: ExampleData = {
  "Challenge: Attribute Order": richtext(attributeOrder),
  "Challenge: Element Order": richtext(elementOrder),
};
