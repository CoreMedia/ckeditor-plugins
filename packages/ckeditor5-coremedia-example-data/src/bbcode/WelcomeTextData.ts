import { ExampleData } from "../ExampleData";
import { bbCode } from "./BBCode";

export const welcomeText = `${bbCode.h1("CKEditor 5: CoreMedia Plugin Showcase")}\
${bbCode.p(`\
This example instance of CKEditor 5 serves as a showcase for plugins provided \
by CoreMedia. Most of these plugins are mandatory to use CKEditor 5 as editor \
within CoreMedia Studio. Others are required to edit CoreMedia RichText, and \
then again others provide more additional functionality. For details see \
corresponding documentation.`)}\
${bbCode.h2("Example Data")}\
${bbCode.p(`
For testing several use-cases you will see buttons at the top, which load
different data-sets for testing and for experimenting with this CKEditor
instance and its plugins.`)}`;

export const welcomeTextData: ExampleData = {
  Welcome: welcomeText,
};
