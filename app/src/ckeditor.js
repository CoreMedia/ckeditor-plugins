import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import CodeBlock from "@ckeditor/ckeditor5-code-block/src/codeblock";
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import AutoLink from "@ckeditor/ckeditor5-link/src/autolink";
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

import CoreMediaSymbolOnPasteMapper from '@coremedia/ckeditor5-symbol-on-paste-mapper/SymbolOnPasteMapper';
import MockStudioIntegration from "@coremedia/ckeditor5-coremedia-studio-integration-mock/MockStudioIntegration";

import {setupPreview, updatePreview} from './preview'
import {initExamples} from './example-data'
import CoreMediaStudioEssentials, {
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  Strictness
} from "@coremedia/ckeditor5-studio-essentials/CoreMediaStudioEssentials";
import {initDragExamples} from "./dragExamples";
import GeneralRichTextSupport
  from "@coremedia/ckeditor5-coremedia-general-richtext-support/GeneralRichTextSupport";
import {replaceByElementAndClassBackAndForth} from "@coremedia/ckeditor5-coremedia-richtext/rules/ReplaceBy";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import {CoreMediaRichText10Dtd} from "@coremedia/ckeditor5-coremedia-general-richtext-support/GeneralRichTextSupport";

const editorLanguage = document.currentScript.dataset.lang || "en";

// setup dnd IFrame
const dndButton = document.querySelector("#dragExamplesButton");
const dndFrame = document.querySelector("#dragExamplesDiv");
dndButton.addEventListener("click", () => {
  dndFrame.hidden = !dndFrame.hidden;
  dndButton.textContent = `${dndFrame.hidden ? "Show" : "Hide"} drag examples`;
});

setupPreview();

let editor;

ClassicEditor.create(document.querySelector('.editor'), {
  licenseKey: '',
  placeholder: 'Type your text here...',
  plugins: [
    Alignment,
    Autosave,
    BlockQuote,
    Bold,
    CodeBlock,
    Essentials,
    Heading,
    Highlight,
    Indent,
    Italic,
    AutoLink,
    Link,
    CoreMediaStudioEssentials,
    GeneralHtmlSupport,
    GeneralRichTextSupport,
    List,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    Strikethrough,
    SourceEditing,
    Subscript,
    Superscript,
    Table,
    TableToolbar,
    Underline,
    CoreMediaSymbolOnPasteMapper,
    MockStudioIntegration
  ],
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      'underline',
      'strikethrough',
      'subscript',
      'superscript',
      'highlight',
      'removeFormat',
      '|',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      'outdent',
      'indent',
      '|',
      'codeBlock',
      'blockQuote',
      'alignment',
      '|',
      'insertTable',
      '|',
      'sourceEditing',
    ]
  },
  alignment: {
    // The following alternative to signal alignment was used in CKEditor 4
    // of CoreMedia CMCC 10 and before.
    // Note, that in contrast to CKEditor 4 approach, these classes are now
    // applicable to any block element, while it supported only `<p>` in the
    // past.
    options: [
      {
        name: "left",
        className: "align--left",
      },
      {
        name: "right",
        className: "align--right",
      },
      {
        name: "center",
        className: "align--center",
      },
      {
        name: "justify",
        className: "align--justify",
      },
    ],
  }, heading: {
    options: [
      {model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph'},
      {model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1'},
      {model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2'},
      {model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3'},
      {model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4'},
      {model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5'},
      {model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6'},
    ]
  },
  link: {
    defaultProtocol: 'https://',
    disabled_decorators: {
      hasTitle: {
        mode: 'manual',
        label: 'Title',
        attributes: {
          title: 'Example how standard-decorators of the link-plugin works. To enable/disable, just rename decorators section to "disabled_decorators" and back again to "decorators" to activate it and see the results.',
        },
      }
    },
  },
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  language: {
    // Language switch only applies to editor instance.
    ui: editorLanguage,
    // Won't change language of content.
    content: 'en',
  },
  autosave: {
    waitingTime: 1000, // in ms
    save(currentEditor) {
      console.log("Save triggered...");
      const start = performance.now();
      const data = currentEditor.getData({
        // set to none, to trigger data-processing for empty text, too
        // possible values: empty, none (default: empty)
        trim: 'empty',
      });
      saveData("autosave", data);
      console.log(`Saved data within ${performance.now() - start} ms.`);
    }
  },
  [COREMEDIA_RICHTEXT_CONFIG_KEY]: {
    strictness: Strictness.STRICT,
    rules: {
      elements: {
        // Highlight Plugin Support
        mark: replaceByElementAndClassBackAndForth("mark", "span", "mark"),
      },
    },
  },
  htmlSupport: {
    allow: [
      {
        // As we represent `<mark>` as `<span class="mark">`, we must ensure,
        // that the same attributes are kept as is from CMS. For example, the
        // dir-attribute, which is valid for `<span>` must not be removed just
        // because CKEditor is not configured to handle it.
        name: "mark",
        ...CoreMediaRichText10Dtd.attrs,
      }
    ],
  },
}).then(newEditor => {
  CKEditorInspector.attach({
    'main-editor': newEditor,
  }, {
    isCollapsed: true,
  });
  initExamples(newEditor);
  initDragExamples();
  editor = newEditor;
  window['editor'] = newEditor;
  console.log("Exposed editor instance as `editor`.");

  let undoCommand = newEditor.commands.get("undo");
  if (!!undoCommand) {
    newEditor['resetUndo'] = () => undoCommand.clearStack();
    console.log("Registered `editor.resetUndo()` to clear undo history.");
  }
}).catch(error => {
  console.error(error);
});

function saveData(source, data) {
  console.log("Saving data triggered by " + source, {data: data});
  updatePreview(data)
}
