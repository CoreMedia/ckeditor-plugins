import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
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
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import Highlight from '@ckeditor/ckeditor5-highlight/src/highlight';

import CoreMediaSymbolOnPasteMapper from '@coremedia/ckeditor5-symbol-on-paste-mapper/SymbolOnPasteMapper';
import CoreMediaRichText from '@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichText';
import {COREMEDIA_RICHTEXT_CONFIG_KEY} from '@coremedia/ckeditor5-coremedia-richtext/CoreMediaRichTextConfig';
import {Strictness} from "@coremedia/ckeditor5-coremedia-richtext/RichTextSchema";
import LinkTarget from "@coremedia/ckeditor5-link/LinkTarget";

import {setupPreview, updatePreview} from './preview'
import {initExamples} from './example-data'
import {initDDExamples} from "./dragExamples";
import MockStudioIntegration from "../../packages/coremedia-studio-integration-mock/dist/MockStudioIntegration";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const inspectorFlag = 'inspector';
const wantsInspector = urlParams.has(inspectorFlag) ? 'false' !== urlParams.get(inspectorFlag) : false;
const inspectorToggle = document.getElementById(inspectorFlag);

setupPreview();
initDDExamples(MockStudioIntegration.getServiceAgent());

if (wantsInspector) {
  inspectorToggle.setAttribute('href', '?inspector=false');
  inspectorToggle.textContent = 'Close Inspector';
}

let editor;

ClassicEditor.create(document.querySelector('.editor'), {
  licenseKey: '',
  placeholder: 'Type your text here...',
  plugins: [
    Alignment,
    Autosave,
    BlockQuote,
    Bold,
    Essentials,
    Heading,
    Highlight,
    Indent,
    Italic,
    AutoLink,
    Link,
    LinkTarget,
    List,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TableToolbar,
    Underline,
    CoreMediaSymbolOnPasteMapper,
    CoreMediaRichText,
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
      'blockQuote',
      'alignment',
      '|',
      'insertTable',
    ]
  },
  heading: {
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
  language: 'en',
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
        mark: {
          toData: (params) => {
            params.parentRule(params);

            const originalClass = params.node.attributes["class"];
            params.node.attributes["class"] = `mark--${originalClass}`;
            params.node.name = "span";
          },
          toView: {
            span: (params) => {
              params.parentRule(params);

              const originalClass = params.node.attributes["class"] || "";
              // TODO[cke] Would be really nice having "class list" access instead here, so that an element
              //    can be italics, but also marked.
              const pattern = /^mark--(\S*)$/;
              const match = pattern.exec(originalClass);
              if (match) {
                params.node.name = "mark";
                params.node.attributes["class"] = match[1];
              }
            },
          },
        },
      },
    },
  },
}).then(newEditor => {
  if (wantsInspector) {
    CKEditorInspector.attach(newEditor);
  }
  initExamples(newEditor);
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
