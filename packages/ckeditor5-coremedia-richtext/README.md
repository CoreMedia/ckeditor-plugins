# CKEditor 5 Plugin: CoreMedia Richtext 1.0 DataProcessor

This plugin is required to edit
[CoreMedia Richtext 1.0](coremedia-richtext-1.0.dtd),
an XML format, which provides a subset of XHTML features.

It grants conversion of CoreMedia RichText 1.0 to the CKEditor data model
as well as conversion from CKEditor data model to CoreMedia RichText.

To perform this transformation, this plugin provides a
[CKEditor 5 DataProcessor](https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_dataprocessor-DataProcessor.html).

## Reserved Classes

Due to limitations of CoreMedia RichText 1.0 (see below) some elements from
CKEditor view need to be transformed to a more generic element. For example,
heading `<h1>` will be transformed to a normal paragraph `<p>`.

To be able to restore these elements, a typical approach is storing these
identities as `class` attribute of the transformed element. For our example
`<h1>` this means, that it is transformed to `<p class="p--heading-1">`. This
will be restored to `<h1>` when read from CMS into CKEditor again.

Having this, some _reserved_ classes exist, which must not be used in other
contexts. And, these _reserved_ classes should be respected, when transforming
these RichText contents for delivery to browsers if used within webpages.

This plugin introduced the following reserved class attribute values:

| Class          | Applicable To | Representing | Comment                                           |
|----------------|---------------|--------------|---------------------------------------------------|
| `code`         | `<span>`      | `<code>`     |                                                   |
| `p--heading-1` | `<p>`         | `<h1>`       |                                                   |
| `p--heading-2` | `<p>`         | `<h2>`       |                                                   |
| `p--heading-3` | `<p>`         | `<h3>`       |                                                   |
| `p--heading-4` | `<p>`         | `<h4>`       |                                                   |
| `p--heading-5` | `<p>`         | `<h5>`       |                                                   |
| `p--heading-6` | `<p>`         | `<h6>`       |                                                   |
| `strike`       | `<span>`      | `<s>`        |                                                   |
| `td--header`   | `<td>`        | `<th>`       |                                                   |
| `tr--header`   | `<tr>`        | `<tr>`       | Moved to `<thead>`. See [below](#table_sections). |
| `tr--footer`   | `<tr>`        | `<tr>`       | Moved to `<tfoot>`. See [below](#table_sections). |
| `underline`    | `<span>`      | `<u>`        |                                                   |

### Table Sections
<a id="table_sections"></a>

CoreMedia RichText 1.0 does not know about table sections. Instead, these
table sections are represented by _reserved_ classes as well. Thus, a given
class attribute value has no direct impact on the element itself, but it
will be wrapped into another element. The following CoreMedia RichText 1.0
table:

```html
<table>
  <tbody>
    <tr class="tr--header"><td class="td--header">Head</td></tr>
    <tr><td>Body</td></tr>
    <tr class="tr--footer"><td>Foot</td></tr>
  </tbody>
</table>
```

will be transformed to:

```html
<table>
  <thead>
    <tr class="tr--header"><td class="td--header">Head</td></tr>
  </thead>
  <tbody>
    <tr><td>Body</td></tr>
  </tbody>
  <tfoot>
    <tr class="tr--footer"><td>Foot</td></tr>
  </tfoot>
</table>
```

Note: As of CKEditor 5, 24.0.0, `<tfoot>` is not supported and will be moved
to `<tbody>` instead.

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

Another example, if using the
[Table Caption plugin](https://ckeditor.com/docs/ckeditor5/latest/api/module_table_tablecaption-TableCaption.html), you
will note, that, as the name suggests, it creates an extra element `<caption>`.
As this is not supported by CoreMedia RichText 1.0 you have to think of
alternatives.

*Store in `summary` attribute?* You may think about storing the value of
`<caption>` in encoded form into the `summary` attribute (deprecated HTML
attribute, but best-fit alternative in CoreMedia RichText). Note, though, that
this comes with limitations. As the `<caption>` requires to be stored as plain
text then in `summary`, you have to encode it. Encoding it, you will especially
lose the ability to track possible internal links encoded into the summary
attribute.

Thus, such a mapping has to be carefully designed and its side effects have to
be evaluated and rated if they apply to you or not.

## See Also

* [ckeditor5/gfmdataprocessor.js at master · ckeditor/ckeditor5](https://github.com/ckeditor/ckeditor5/blob/master/packages/ckeditor5-markdown-gfm/src/gfmdataprocessor.js)
