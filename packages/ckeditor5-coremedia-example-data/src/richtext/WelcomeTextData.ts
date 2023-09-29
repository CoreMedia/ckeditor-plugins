import { ExampleData } from "../ExampleData";
import { h1, p, richtext, h2 } from "../RichText";

const rawText = `${h1("CKEditor 5: CoreMedia Plugin Showcase")}\
${p(`\
This example instance of CKEditor 5 serves as a showcase for plugins provided \
by CoreMedia. Most of these plugins are mandatory to use CKEditor 5 as editor \
within CoreMedia Studio. Others are required to edit CoreMedia RichText, and \
then again others provide more additional functionality. For details see \
corresponding documentation.\
`)}\
${h2("Example Data")}\
${p(`\
For testing several use-cases you will see buttons at the top, which load \
different data-sets for testing and for experimenting with this CKEditor \
instance and its plugins. \
`)}\
`;

export const welcomeText = richtext(rawText);

export const welcomeTextData: ExampleData = {
  Welcome: welcomeText,
};
