// Make sure that the global object is defined. If not, define it.
window.CKEDITOR_TRANSLATIONS = window.CKEDITOR_TRANSLATIONS || {};

// Make sure that the dictionary for Polish translations exist.
window.CKEDITOR_TRANSLATIONS[ 'es' ] = window.CKEDITOR_TRANSLATIONS[ 'es' ] || {};
window.CKEDITOR_TRANSLATIONS[ 'es' ].dictionary =  window.CKEDITOR_TRANSLATIONS[ 'es' ].dictionary || {};

// Extend the dictionary for Polish translations with your translations:
Object.assign( window.CKEDITOR_TRANSLATIONS[ 'es' ].dictionary, {
  'Enter url or drag and drop content onto this area.': 'Introduzca la url o arrastre y suelte el contenido en esta área.'
} );
