// noinspection HttpUrlsUsage
import {
  PREDEFINED_MOCK_BLOB_DATA,
  PREDEFINED_MOCK_LINK_DATA,
} from "@coremedia/ckeditor5-coremedia-studio-integration-mock/src/content/PredefinedMockContents";
import { setData } from "./dataFacade";
import { View } from "@ckeditor/ckeditor5-engine";
import {
  bbCodeData,
  ExampleData,
  initExamples,
  richTextData,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { Editor } from "@ckeditor/ckeditor5-core";

const exampleData: {
  richtext: ExampleData;
  bbcode: ExampleData;
} = {
  richtext: {
    ...richTextData,
    "Various Links": PREDEFINED_MOCK_LINK_DATA,
    "Various Images": PREDEFINED_MOCK_BLOB_DATA,
  },
  bbcode: bbCodeData,
};

export type ExampleDataType = keyof typeof exampleData;

const dumpEditingViewOnRender = (editor: Editor): void => {
  const {
    editing: { view },
  } = editor;

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
      }
    },
    {
      priority: "lowest",
    },
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
    },
  );
};

export const initExamplesAndBindTo = (editor: Editor, examplesType: ExampleDataType = "richtext"): void => {
  initExamples({
    id: "examples",
    examples: exampleData[examplesType],
    default: "Welcome",
    onChange: (data: string): void => {
      dumpEditingViewOnRender(editor);
      dumpDataViewOnRender(editor);
      setData(editor, data);
    },
  });
};
