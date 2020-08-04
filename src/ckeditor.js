/**
 * @license Copyright (c) 2014-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import Autosave from '@ckeditor/ckeditor5-autosave/src/autosave.js';
import Base64UploadAdapter from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Image from '@ckeditor/ckeditor5-image/src/image.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import SpecialCharacters from '@ckeditor/ckeditor5-special-characters/src/specialcharacters.js';
import SpecialCharactersArrows from '@ckeditor/ckeditor5-special-characters/src/specialcharactersarrows.js';
import SpecialCharactersCurrency from '@ckeditor/ckeditor5-special-characters/src/specialcharacterscurrency.js';
import SpecialCharactersEssentials from '@ckeditor/ckeditor5-special-characters/src/specialcharactersessentials.js';
import SpecialCharactersText from '@ckeditor/ckeditor5-special-characters/src/specialcharacterstext.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

class CoreMediaRichTextDataProcessor extends HtmlDataProcessor {
  toData(viewFragment) {
    console.log("CoreMediaRichTextDataProcessor.toData called: ", {viewFragment:viewFragment});
    return super.toData(viewFragment);
  }
  toView(data) {
    console.log("CoreMediaRichTextDataProcessor.toView called: ", {data:data});
    return super.toView(data);
  }
}

function CoreMediaRichText(editor) {
  editor.data.processor = new CoreMediaRichTextDataProcessor(editor.editing.view.document);
}

class Editor extends ClassicEditor {
}

// Plugins to include in the build.
Editor.builtinPlugins = [
  Alignment,
  Autosave,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  CKFinder,
  CKFinderUploadAdapter,
  CoreMediaRichText,
  Essentials,
  Heading,
  Image,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableToolbar,
  Underline
];

Editor.defaultConfig = {
  placeholder: 'Type your text here...',
  toolbar: {
    items: [
      'undo',
      'redo',
      '|',
      'heading',
      '|',
      'bold',
      'italic',
      'blockQuote',
      'underline',
      'strikethrough',
      'superscript',
      'subscript',
      'removeFormat',
      '|',
      'link',
      'CKFinder',
      'imageUpload',
      '|',
      'alignment',
      '|',
      'insertTable',
      '|',
      'numberedList',
      'bulletedList',
      '|',
      'indent',
      'outdent',
      '|',
      'specialCharacters'
    ]
  },
  language: 'en',
  table: {
    contentToolbar: [
      'tableColumn',
      'tableRow',
      'mergeTableCells'
    ]
  },
  licenseKey: '',
  autosave: {
    waitingTime: 5000, // in ms
    save(editor) {
      return saveData("autosave", editor.getData());
    }
  },
  // see https://github.com/ckeditor/ckeditor5/issues/4829
  // https://ckeditor.com/docs/ckeditor5/latest/features/link.html#adding-attributes-to-links-using-the-ui-manual-decorators
  link: {
    decorators: {
      // Adds toggle button, if a click triggers a download or opens a page.
      toggleDownloadable: {
        mode: 'manual',
        label: 'Downloadable',
        attributes: {
          download: 'file'
        }
      },
      // Automatically adds class-attribute "link--external" for any external URL.
      isExternal: {
        mode: 'automatic',
        callback: url => /^(https?:)?\/\//.test( url ),
        attributes: {
          class: 'link--external'
        }
      },
      // Automatically adds class-attribute "link--internal" for any internal URL.
      isInternal: {
        mode: 'automatic',
        callback: url => /^(coremedia:)?\/\//.test( url ),
        attributes: {
          class: 'link--internal'
        }
      },
      // Adds toggle button, if click is opened in a new tab or not.
      openInNewTab: {
        mode: 'manual',
        label: 'Open in a new tab',
        defaultValue: true,
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }
    }
  }
};

export default Editor;

function saveData(source, data) {
  console.log("Saving data triggered by " + source, {data: data});
}
