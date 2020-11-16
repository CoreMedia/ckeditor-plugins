import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import PasteFromOffice, {PasteFromOfficeClipboardEventData} from "@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice";
import Clipboard from "@ckeditor/ckeditor5-clipboard/src/clipboard";
/*import coremedia from "@coremedia/coremedia-utils";*/

export default class SymbolOnPasteMapper extends Plugin {
  static readonly pluginName: "SymbolFontMapper";
  // TODO[cke] Copied from PasteFromOffice... should be some set of constants
  //   which tell, if there is any font to consider for replacement.
  static readonly msWordMatch = /<meta\s*name="?generator"?\s*content="?microsoft\s*word\s*\d+"?\/?>/i;
  // TODO[cke] Would be great adding context information (editor/sourceElement-id or similar)
  //    to get the actual editor we write log entries for.
  /*private readonly logger:coremedia.Logger = coremedia.getLogger(SymbolOnPasteMapper.pluginName);*/

  constructor(ed: Editor) {
    super(ed);
  }

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
        (evt: any, data: PasteFromOfficeClipboardEventData) => {
          if (!data.isTransformedWithPasteFromOffice) {
            // this.logger.debug("Nothing to do.")
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
      // this.logger.error("Unexpected Clipboard plugin.");
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
