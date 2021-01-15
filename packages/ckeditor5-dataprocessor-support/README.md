# CKEditor 5 Plugin: CoreMedia Richtext 1.0 DataProcessor

This plugin is required to edit
[CoreMedia Richtext 1.0](coremedia-richtext-1.0.dtd),
an XML format, which provides a subset of XHTML features.

It grants conversion of CoreMedia RichText 1.0 to the CKEditor data model
as well as conversion from CKEditor data model to CoreMedia RichText.

To perform this transformation, this plugin provides a
[CKEditor 5 DataProcessor](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_dataprocessor-DataProcessor.html).

## Limitations

As CoreMedia RichText 1.0 only provides a subset of HTML elements and attributes
available in HTML 5.0 for example, you have to find a representation of these
HTML elements within CoreMedia RichText 1.0.

If using the
[Font plugin](https://ckeditor.com/docs/ckeditor5/latest/features/font.html)
for example, it will add chosen colors as `style` attribute to a given element.
As the `style` attribute is unsupported by CoreMedia RichText 1.0, you may
decide to represent it as class when transforming it:

* **CKEditor HTML:**

    ```xml
    <span style="color:#00FF00">Green</span>
    ```
  
* **RichText as `class` attribute:**

    ```xml
    <span class="color--00FF00">Green</span>
    ```

Note, that for any transformation, you have to adapt the CoreMedia delivery as
well, so that when delivering CoreMedia RichText 1.0 within your webpage, the
color attribute is either re-transformed to a style attribute, or, possibly
better for a consistent site appearance, added as CSS style class.

## See Also

* [ckeditor5/gfmdataprocessor.js at master · ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-markdown-gfm/src/gfmdataprocessor.js)
