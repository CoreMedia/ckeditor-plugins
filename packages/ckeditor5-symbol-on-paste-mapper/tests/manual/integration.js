/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import PasteFromOffice from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";

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
      Clipboard,
      Essentials,
      PasteFromOffice,
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
