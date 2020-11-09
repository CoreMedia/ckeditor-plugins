# CKEditor Plugin: Symbol Font Mapper

Description of `cmsymbolfontmapper`: pastefromword-extension plugin, which
replaces symbol font characters by their corresponding entities. The plugin
listens to event `afterPasteFromWord` with priority 10.

This plugin replaces the CKEditor 4 CoreMedia Plugin `cmsymbolfontmapper`.

## Research Notes

* The original `cmsymbolfontmapper` plugin listened to `afterPasteFromWord` to
    perform further updates.
* For CKEditor 5 such _normalization_ is performed in [`MSWordNormalizer`](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-paste-from-office/src/normalizers/mswordnormalizer.js).
* Unfortunately, there is no event, when normalization is done.
* Possible approach:
    * Listen to event `inputTransformation` at `Clipboard` plugin with priority
        less than _high_ and more than _low_.
    * Check, if `data.isTransformedWithPasteFromOffice` is set to `true`.
    * If yes, further transform the data.
    * It seems to be significant to prevent duplicate transformation, as this
       is, what _Paste from Office_ does.
* What is return type `null|Promise` for e.g. `init()` method?
    * The CKEditor documentation does not state anything what is expected to
        be returned.
* DefinitelyTypes or not?
    * At least for CKEditor 5 we soon get to insufficient interfaces.
    * Example: For [view.View](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-engine/src/view/view.js) the `document` property is missing.

## See Also

* [CKEditor 5 Paste from Office feature - CKEditor 5 API docs](https://ckeditor.com/docs/ckeditor5/latest/api/paste-from-office.html)
* [Class PasteFromOffice (paste-from-office/pastefromoffice~PasteFromOffice) - CKEditor 5 API docs](https://ckeditor.com/docs/ckeditor5/latest/api/module_paste-from-office_pastefromoffice-PasteFromOffice.html)
* [ckeditor5/packages/ckeditor5-paste-from-office · ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5/tree/master/packages/ckeditor5-paste-from-office)
* [cmsymbolfontmapper at master · CoreMedia/cms](https://github.com/CoreMedia/cms/blob/master/apps/studio-client/core/ui/ui-toolkit/ui-components/src/main/sencha/resources/ckeditor/plugins/cmsymbolfontmapper)
    This is the plugin to replace here.
