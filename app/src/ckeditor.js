/**
 * @license Copyright (c) 2014-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import SymbolOnPasteMapper from '@coremedia/ckeditor5-symbol-on-paste-mapper/dist/SymbolOnPasteMapper.js';

class Editor extends ClassicEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
  Essentials,
  Paragraph,
  SymbolOnPasteMapper
];

export default Editor;
