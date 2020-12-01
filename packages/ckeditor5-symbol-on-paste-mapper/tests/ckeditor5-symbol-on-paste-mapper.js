import SymbolOnPasteMapper from '../dist/SymbolOnPasteMapper';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

describe( 'SymbolOnPasteMapper Plugin', () => {
  it( 'requires Clipboard from @ckeditor', () => {
    expect( SymbolOnPasteMapper.requires ).to.deep.equal( [ Clipboard ] );
  } );
} );
