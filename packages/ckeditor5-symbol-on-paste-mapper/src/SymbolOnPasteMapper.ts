import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import PasteFromOffice, {PasteFromOfficeClipboardEventData} from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";

class SymbolOnPasteMapper extends Plugin {
  static readonly pluginName: "SymbolFontMapper";
  static readonly msWordMatch = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;

  static get requires() {
    return [
      Clipboard,
      PasteFromOffice
    ];
  }


  init(): Promise<void> | null {
    const editor = this.editor;
    const viewDocument = editor.editing.view.document;

    let clipboard = editor.plugins.get('Clipboard');
    if (clipboard instanceof Clipboard) {
      clipboard.on(
        'inputTransformation',
        (evt:any, data:PasteFromOfficeClipboardEventData) => {
          if (!data.isTransformedWithPasteFromOffice) {
            // TODO[cke] Log, that there is nothing to do.
            return;
          }


          // We may have to do something.
        },
        {
          // Must be less than priority in PasteFromOffice.
          priority: 'normal'
        }
      )
    } else {
      // TODO[cke] How to log errors in CKEditor?
    }
    return null;
  }

  // ainit() {
  //   const editor = this.editor;
  //   const viewDocument = editor.editing.view.document;
  //   const normalizers = [];
  //
  //   normalizers.push( new MSWordNormalizer( viewDocument ) );
  //   normalizers.push( new GoogleDocsNormalizer( viewDocument ) );
  //
  //   editor.plugins.get( 'Clipboard' ).on(
  //     'inputTransformation',
  //     ( evt, data ) => {
  //       if ( data.isTransformedWithPasteFromOffice ) {
  //         return;
  //       }
  //
  //       const htmlString = data.dataTransfer.getData( 'text/html' );
  //       const activeNormalizer = normalizers.find( normalizer => normalizer.isActive( htmlString ) );
  //
  //       if ( activeNormalizer ) {
  //         activeNormalizer.execute( data );
  //
  //         data.isTransformedWithPasteFromOffice = true;
  //       }
  //     },
  //     { priority: 'high' }
  //   );
  // }
}
