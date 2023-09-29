// noinspection HttpUrlsUsage
import {
  PREDEFINED_MOCK_BLOB_DATA,
  PREDEFINED_MOCK_LINK_DATA,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/PredefinedMockContents";
import { setData } from "./dataFacade";
import { welcomeTextData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/WelcomeTextData";
import { differencingData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/DifferencingData";
import { grsData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/GrsData";
import { loremIpsumData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/LoremIpsumData";
import { linkTargetData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/LinkTargetData";
import { h1, richtext } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/RichText";
import { entitiesData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/EntitiesData";
import { View } from "@ckeditor/ckeditor5-engine";
import { initExamples } from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { Editor } from "@ckeditor/ckeditor5-core";
import { contentLinkData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/ContentLinkData";
import { invalidData } from "@coremedia-internal/ckeditor5-coremedia-example-data/src/data/InvalidData";

// noinspection HtmlUnknownAttribute
const exampleData: Record<string, string> = {
  ...differencingData,
  ...entitiesData,
  ...linkTargetData,
  ...loremIpsumData,
  ...grsData,
  ...welcomeTextData,
  ...contentLinkData,
  ...invalidData,
  "Various Links": PREDEFINED_MOCK_LINK_DATA,
  "Various Images": PREDEFINED_MOCK_BLOB_DATA,
  "Empty": "",
  "Hello": richtext(`<p>Hello World!</p>`),
};

const dumpEditingViewOnRender = (editor: Editor): void => {
  const {
    editing: { view },
  } = editor;
      },

  // noinspection InnerHTMLJS
  view.once(
    "render",
    (event) => {
      const { source } = event;
      if (source instanceof View) {
        console.log("CKEditor's Editing-Controller rendered data.", {
          source,
          innerHtml: source.getDomRoot()?.innerHTML,
        });
    );
    editor.data.once(
      "set",
      (event, details) =>
        console.log("CKEditor's Data-Controller received data via 'set'.", {
          event,
          // eslint-disable-next-line
          data: details[0],
        }),
      {
        priority: "lowest",
      },
    );

    const data = exampleData[exampleKey];
    console.log("Setting Example Data.", { [exampleKey]: data });
    setData(editor, data);

    const xmpInput = document.getElementById("xmp-input") as HTMLInputElement;
    if (xmpInput) {
      xmpInput.value = exampleKey;
    }
  );
};

const dumpDataViewOnRender = (editor: Editor): void => {
  const { data } = editor;
  data.once(
    "set",
    (event, details) =>
      console.log("CKEditor's Data-Controller received data via 'set'.", {
        event,
        // eslint-disable-next-line
        data: details[0],
      }),
    {
      priority: "lowest",
    }
  );
};

export const initExamplesAndBindTo = (editor: Editor): void => {
  initExamples({
    id: "examples",
    examples: exampleData,
    default: "Welcome",
    onChange: (data: string): void => {
      dumpEditingViewOnRender(editor);
      dumpDataViewOnRender(editor);
      setData(editor, data);
    },
  });
};
