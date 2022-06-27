# CKEditor Plugin: Font Mapper

The Font Mapper plugin extends the
[CKEditor 5 Clipboard Feature][cke5:docs:clipboard:feature].

When pasting rich text from external sources into the editor, some characters
of the pasted text might originate from an unsupported font. This plugin maps
such characters to their named entities or Unicode equivalents using a
mapping table.

By default, this plugin already contains a mapping table for the Word 
`Symbol` font, and automatically converts input content (for instance while
pasting from Microsoft Word) accordingly. This mapping table can be replaced
or extended.

## Clipboard Pipeline Integration

The Font Mapper plugin listens to the ClipboardPipeline's
`inputTransformation` event with `normal` priority. This way, it works fine
in combination with CKEditor's `PasteFromOffice` plugin, which also listens
to the same event, but has a higher priority.

Both plugins manipulate the event's `data.content` object. This is why it
is important to register the event listener with lower priority. Otherwise
the `PasteFromOffice` plugin would just override the data changed in this
plugin.

## Example: Copy & Paste from Microsoft Word

This plugin was originally created to prevent broken characters to appear
when pasting content from an office application document. In this case,
characters written in the `Symbol` font would not be converted correctly
during the transfer.

The Font Mapper plugin solves this issue by searching for certain fonts in
font-family style properties and replacing them with a Unicode equivalent,
which can be displayed in the editor. During this process, the mentioned
characters are changed as defined and the font-family style properties are
removed.

During the insertion process, the pasted content is converted into a
DocumentFragment. The `style` attribute on this fragment determines the
font-family that is taken into account. The font-name will be a full match
(i.e. not partial), ignoring the case.

To reduce additional configuration effort, this plugin already comes with a
mapping for the `Symbol` font and therefore supports pasting content from
office application documents out of the box.

## Plugin Configuration

If the predefined mapping for the `Symbol` font is insufficient for your
use case, you can change the plugin configuration to meet your needs. 

### 1. Change the `Symbol` font mapping

The following example demonstrates how to add additional mappings for the
`Symbol` font. The map consists of key-value pairs where the keys are the
unicode code points to replace and the values are their HTML replacement, which
is most likely an entity but you may also specify any HTML code.
By default, the existing `Symbol` font mapping will remain, only the
characters in the `map` configuration will be overridden.

```javascript
ClassicEditor.create(document.querySelector('.editor'), {
  plugins: [
    ContentClipboard,
    FontMapper,
    // ...
  ],
  "coremedia:fontMapper": [
    {
      font: "Symbol",
      map: {
        38: "&amp;",
        39: "&#x22d;"
        // ...
      },
    },
    // ...
  ],
});
```

If you want to replace the mapping for all characters in the `Symbol` font map,
you can use the `mode` property and set it to `"replace"`. The mode is either
`"append"` or `"replace"`, where `"append"` is the default and fallback for
unknown modes. You can even omit the `mode` option.

In the following example, the existing default character mappings will be
removed and only the mapping for character code 38 will be added:

```javascript
"coremedia:fontMapper": [
    {
        font: "Symbol",
        mode: "replace",
        map: {
            38: "&amp;"
        },
    },
    // ...
],
```

### 2. Add additional font mappings

The `"coremedia:fontMapper"` configuration is declared as an array, that
can hold multiple configuration objects for different fonts. You can therefore
add additional mappings for other fonts by simply adding more entries. 

Please note that the `font` property must hold the name of the font in oder
to work properly. You don't need to set a `mode` for new mappings.

## Migration from CoreMedia's CKEditor 4 `cmsymbolfontmapper` plugin

This plugin is the CKEditor 5 replacement of CoreMedia's CKEditor 4
`cmsymbolfontmapper` plugin, which shipped with CoreMedia Studio.
If you already have a custom configuration for the old plugin,
converting it to a configuration for this Font Mapper plugin
is straightforward.

The following example shows a configuration for the `cmsymbolfontmapper` plugin:

```javascript
<ui:RichTextArea>
    <ui:plugins exml:mode="append">
        <ui:CustomizeCKEditorPlugin>
            <ui:ckConfig>
                <fx:Object symbolCharacterReplacementMap="{{
                    mode: 'add',
                    37:'&amp;permil;',
                    64:'&amp;#x1F4E7;'
                }}"/>
            </ui:ckConfig>
        </ui:CustomizeCKEditorPlugin>
    </ui:plugins>
</ui:RichTextArea>
```

To add your custom configuration, you will have to add
the `"coremedia:fontMapper"` key with a custom configuration object like shown
in the examples above. You will have to explicitly set the `font` to `"Symbol"`
and can keep the `mode` as it was (or even remove it). You can then just copy
the character mappings from your `symbolCharacterReplacementMap` into the `map`
property. The migrated configuration would look like this:

```javascript
"coremedia:fontMapper": [
    {
        font: "Symbol",
        map: {
            37:'&amp;permil;',
            64:'&amp;#x1F4E7;'
        },
    },
    // ...
],
```

If you did not use a custom configuration for the 
`cmsymbolfontmapper` plugin, adding this plugin to your editor
will be sufficient. Both plugins work the same in their default
configuration.

As you may have observed, the `font` parameter is new. Thus,
in contrast to `cmsymbolfontmapper` you can now refer to any
font referenced in `font-family` `style` attributes.

## See Also

* [CKEditor 5 Paste from Office feature - CKEditor 5 API docs](https://ckeditor.com/docs/ckeditor5/latest/api/paste-from-office.html)

 [cke5:docs:clipboard:feature]: <https://ckeditor.com/docs/ckeditor5/latest/framework/guides/deep-dive/clipboard.html> "Clipboard - CKEditor 5 Documentation"
