import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold.js';
import CKEditorInspector from '@ckeditor/ckeditor5-inspector';
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

import CoreMediaSymbolOnPasteMapper from '@coremedia/ckeditor5-symbol-on-paste-mapper/dist/SymbolOnPasteMapper.js';

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const inspectorFlag = 'inspector';
const wantsInspector = urlParams.has(inspectorFlag) ? 'false' !== urlParams.get(inspectorFlag) : false;
const inspectorToggle = document.getElementById(inspectorFlag);

if (wantsInspector) {
  inspectorToggle.setAttribute('href', '?inspector=false');
  inspectorToggle.textContent = 'Close Inspector';
}

ClassicEditor.create(document.querySelector( '.editor' ), {
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
    CoreMediaSymbolOnPasteMapper
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
}).then(editor => {
  if (wantsInspector) {
    CKEditorInspector.attach( editor );
  }
}).catch( error => {
  console.error( error );
});
