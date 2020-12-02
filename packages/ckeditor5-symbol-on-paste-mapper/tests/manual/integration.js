/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic.js';
import Link from '@ckeditor/ckeditor5-link/src/link.js';
import List from '@ckeditor/ckeditor5-list/src/list.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import RemoveFormat from '@ckeditor/ckeditor5-remove-format/src/removeformat.js';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough.js';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript.js';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline.js';

import SymbolOnPasteMapper from '../../dist/SymbolOnPasteMapper';

import {stringify as stringifyView} from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

const htmlDiv = document.querySelector('#html');
const textDiv = document.querySelector('#text');
const dataDiv = document.querySelector('#data');

ClassicEditor
  .create(document.querySelector('#editor'), {
    licenseKey: '',
    placeholder: 'Type your text here...',
    plugins: [
      Alignment,
      BlockQuote,
      Bold,
      Essentials,
      Heading,
      Indent,
      Italic,
      Link,
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
      SymbolOnPasteMapper
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
        'blockQuote',
        'underline',
        'strikethrough',
        'superscript',
        'subscript',
        'removeFormat',
        '|',
        'link',
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
      ]
    },
    language: 'en'
  })
  .then(editor => {
    window.editor = editor;

    const clipboard = editor.plugins.get('Clipboard');

    editor.editing.view.document.on('paste', (evt, data) => {
      console.clear();

      console.log('----- paste -----');
      console.log(data);
      console.log('text/html\n', data.dataTransfer.getData('text/html'));
      console.log('text/plain\n', data.dataTransfer.getData('text/plain'));

      htmlDiv.innerText = data.dataTransfer.getData('text/html');
      textDiv.innerText = data.dataTransfer.getData('text/plain');
    });

    clipboard.on('inputTransformation', (evt, data) => {
      console.log('----- clipboardInput -----');
      console.log('stringify( data.dataTransfer )\n', stringifyView(data.content));

      dataDiv.innerText = stringifyView(data.content);
    });
  })
  .catch(err => {
    console.error(err.stack);
  });
