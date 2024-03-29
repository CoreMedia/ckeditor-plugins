# CoreMedia BBCode Plugin

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_bbcode.html> "@coremedia/ckeditor5-bbcode"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-bbcode`

This module provides a data-processor for BBCode, thus, applies a mapping
from the CKEditor 5 data view (HTML) to BBCode data and vice versa.

For the `toView` (_to Data View_) mapping, processing is based on [BBob][]
with some recommended configuration options applied.

The `toData` mapping is a proprietary implementation, which provides a slightly
richer configuration API.

For a quick overview of supported BBCode, take a look at the
[CoreMedia BBCode Specification](#coremedia-bbcode-20-specification).

## Limitations

This plugin does not expose the configuration API of [BBob][] and as such,
adaptations to the configuration are rather limited.

For example, it is impossible to adapt the code block language mapping in
`toView` processing. Instead, the given configuration assumes the default
behavior of the CKEditor 5 Code Block plugin, which is, that all languages
chosen are denoted by a class pattern `language-<code block language>`.

For security reasons, [BBob][] is configured with a strict allowlist regarding
supported BBCode tags. This allowlist is autogenerated via the (configurable)
`toData` mapping rules. Any other tags will be escaped in `toView` processing:

```text
[unknown]Text[/unknown]
```

will become

```text
\[unknown\]Text\[/unknown\]
```

## Extension Points

As sketched, there is a minor extension point to add new `toData` rules. This
implicitly also has a minor impact on the `toView` processing, as it will allow
the configured `tags`. These, by default, will be forwarded as 1:1 mapping from
BBCode to HTML, thus, the example `[unknown]` above, will become `<unknown>`
in data view, if you mark it as supported. It is up to you, then, to provide
a corresponding data-upcast to the model layer if this does not already
represent a well-known HTML tag by CKEditor 5.

### `toData` Rules Implementation Notes

#### Return: Undefined Or String?

When it comes to implementing rules, a repeating question is, if to return
`undefined` or a string.

**The rule of thumb is to only return a string if a rule provides _relevant_
content.**

This is best explained by example:

The default _Bold_ processing detects the bold-state by element name or
corresponding style declarations. When it detects, that the element content
shall be rendered as bold, it will return `[b]<content>[/b]`.

But if it is not applicable, or bold state got vetoed like in
`<strong style="font-weight:normal;">`, it will return `undefined` and just
modify the processed element state to denote, that the `fontWeight` already
got processed.

## CKEditor 5 Integration of Supported BBCode

The BBCode to HTML processing is essentially based on [BBob][] and a slightly
customized HTML5 Preset. The allowed tags are limited be the assigned
`toData` processing rules (`tags` configuration).

In the following, you will find the supported BBCode tags and how they best
integrate with CKEditor 5.

For a quick overview of supported BBCode itself, we summarized this BBCode
in a dedicated
[CoreMedia BBCode Specification](#coremedia-bbcode-20-specification) without
further reference to CKEditor 5 integration.

### Paragraphs

Paragraphs are implicitly given by an additional newline.

```text
Paragraph 1.

Paragraph 2.
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Paragraph Feature](https://ckeditor.com/docs/ckeditor5/latest/api/paragraph.html)
to be enabled.

### Headings

Heading levels one to six are supported by BBCode tags.

```text
[h1]Heading 1[/h1]
[h2]Heading 2[/h2]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Headings Feature](https://ckeditor.com/docs/ckeditor5/latest/features/headings.html)
to be enabled.

Note that by default the Headings feature does not allow selecting heading
level 1. Processing assumes, that you enabled `<h1>` as valid, supported
element.

### Basic Text Style: Bold

Text may be marked as bold.

```text
[b]Bold[/b]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Bold Feature](https://ckeditor.com/docs/ckeditor5/latest/api/module_basic-styles_bold-Bold.html)
to be enabled.

### Basic Text Style: Italic

Text may be marked as italic.

```text
[i]Italic[/i]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Italic Feature](https://ckeditor.com/docs/ckeditor5/latest/api/module_basic-styles_italic-Italic.html)
to be enabled.

### Basic Text Style: Underline

Text may be marked as underlined.

```text
[u]Underlined[/u]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Underline Feature](https://ckeditor.com/docs/ckeditor5/latest/api/module_basic-styles_underline-Underline.html)
to be enabled.

### Basic Text Style: Strikethrough

Text may be marked as strikethrough.

```text
[s]Strikethrough[/s]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Strikethrough Feature](https://ckeditor.com/docs/ckeditor5/latest/api/module_basic-styles_strikethrough-Strikethrough.html)
to be enabled.

### Font Color

Text may be marked as having a text color.

```text
[color=#ff0000]Red[/color]
[color=red]Red[/color]
[color=#ff0000a0]Transparent Red[/color]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 FontColor Feature](https://ckeditor.com/docs/ckeditor5/latest/api/module_font_fontcolor-FontColor.html)
to be enabled.

A possible recommended configuration for the CKEditor 5 font-color feature to
support this, is:

```text
fontColor: {
  colors: [
    {
      color: "#000000",
      label: "Black",
    },
    {
      color: "red",
      label: "Red",
    },
    {
      color: "rgba(0, 0, 255, 1.0)",
      label: "Blue",
    },
  ],
  colorPicker: {
    format: "hex",
  },
},
```

Formats such as HSL, RGB are supported in `toData` mapping. They will be
transparently transformed to the corresponding hex/hex-alpha codes suitable
for the `[color]` tag.

### Font Size

Similar to the CKEditor 4 BBCode plugin, the CKEditor 5 BBCode Plugin supports
the `[size]` tag.

```text
[size=70]Tiny[/size]
[size=85]Small[/size]
[size=140]Big[/size]
[size=180]Huge[/size]
```

Numbers between are mapped to some reasonable closest matching number of
the enumeration above, including 100, which denotes a _normal_ font size.

#### CKEditor 5 Integration

Requires the
[CKEditor 5 FontSize Feature](https://ckeditor.com/docs/ckeditor5/latest/api/module_font_fontsize-FontSize.html)
to be enabled.

The default configuration is best taken as is, as the mapping to
`text-tiny` up to `text-huge` is already enabled by default in CKEditor 5
FontSize Feature.

### Links

You may denote links in BBCode.

```text
[url="https://example.org/"]Example[/url]
[url]https://example.org/[/url]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Link Feature](https://ckeditor.com/docs/ckeditor5/latest/api/link.html)
to be enabled.

#### Remark on Relative URLs

Relative URLs are passed as is to the data view without any further
intervention, assuming, that they should stay relative also during editorial
actions.

Nevertheless, consider that relative links edited in a different context they
were written for or written at, may contain invalid links when clicked.
This is true for the CKEditor 5 Contextual Link Balloon, as well as for a
read-only view.

### Images

You may reference images along with setting some alternative text.

```text
[img]https://...[/img]
[img alt="ALT"]https://...[/img]
```

#### CKEditor 5 Integration

Requires the following
[CKEditor 5 Image Feature](https://ckeditor.com/docs/ckeditor5/latest/api/image.html)
to be enabled.

Due to several setup options, the following setup has proven to align best
with BBCode support:

* **Recommended Plugins:**

  * [ImageInline](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imageinline-ImageInline.html)

    In general, BBCode parsers expect `[img]` to be represented as inline
    object. The glue plugin also automatically includes `alt` attribute
    support.

  * [ImageToolbar](https://ckeditor.com/docs/ckeditor5/latest/api/module_image_imagetoolbar-ImageToolbar.html)

    Required to be able to edit the `alt` attribute. Ensure to enable
    `imageTextAlternative` as `image.toolbar` option.

  * [LinkImage](https://ckeditor.com/docs/ckeditor5/latest/api/module_link_linkimage-LinkImage.html)

    Requires `ImageBlockEditing` to be installed.

### Code Blocks

You may add code blocks, as well as selecting some language.

```text
[code]
console.log("Hello World!");
[/code]

[code=bbcode]
\[b\]Hello World!\[/b\]
[/code]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Code Blocks Feature](https://ckeditor.com/docs/ckeditor5/latest/features/code-blocks.html)
to be enabled.

##### Language Support

The adapted mapping ensures that it integrates effortless with CKEditor 5
Code Block editing feature.

Also, the optional language information is transformed expecting the default
behavior of the Code Block editing feature adding a `class` entry prefixed
with `language-` to the nested `<code>` element.

### Blockquotes

Block quotes are supported in BBCode.

```text
[quote]
Carpe diem!
[/quote]
```

Note that there is no mapping for the optional author-argument that may be
set in BBCode. Thus, any applied author information will be lost.

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Block Quote Feature](https://ckeditor.com/docs/ckeditor5/latest/features/block-quote.html)
to be enabled.

### Document Lists

Lists are supported as either bullet lists or ordered lists. The latter ones
are specified by a type-selector.

```text
[list]
[*] Bullet 1
[/list]

[list=1]
[*] First Ordered Entry
[/list]
```

#### CKEditor 5 Integration

Requires the
[CKEditor 5 Document Lists Feature](https://ckeditor.com/docs/ckeditor5/latest/features/lists/document-lists.html)
to be enabled.

For the best support, you should configure the Document List Feature of
CKEditor 5 as follows:

```text
list: {
  properties: {
    startIndex: false,
    styles: {
      useAttribute: true,
    },
    reversed: false,
  },
},
```

The `useAttribute` flag will signal, that the `<ol>` `type` attribute is used.

**CSS Limitation:** Unless browsers support the CSS Working Group Draft
[2101](https://github.com/w3c/csswg-drafts/issues/2101) with case-sensitive
selectors, you cannot distinguish in styling between `i` and `I` or `a`
and `A`. The rendered BBCode, though, will respect the different cases.

### Data Facade

If you want to prevent unchanged data (thus, without editorial actions applied)
to be written back to some backend that stores BBCode, you may want to use the
CKEditor 5 Data Facade plugin. This will, for example, prevent re-ordering of
inline style tags:

```text
[b][i]bold, italic[/i][/b]
```

may as well be rendered in `toData` processing as:

```text
[i][b]bold, italic[/b][/i]
```

Similarly, the data facade will prevent accidentally applied escaping to
unknown tags to be written back to server. Without data facade, assume the
following BBCode with some vendor-specific tag:

```text
[spoiler]Don't tell![/spoiler]
```

This will be written back as:

```text
\[spoiler\]Don't tell!\[/spoiler\]
```

With the Data Facade plugin enabled will only be written on editorial actions.

## Security Considerations

When it comes to parsing and transforming BBCode to HTML, you have to expect,
that BBCode comes from _untrusted_ sources, such as comments on a web page.

The BBCode plugin takes care of possible attack vectors regarding proper
escaping on `toView` (BBCode to HTML) as well as in `toData` (HTML to BBCode)
processing. This is ensured, for example, by using DOM API to set attributes
in HTML rather than naive string concatenation.

**But:** The BBCode does not filter any possibly malicious data on other layers.

Some example scenarios:

* An attacker creates BBCode such as `[h1 onclick='...']`.

  The BBCode plugin, powered by BBob, will transform this into
  `<h1 onclick="...">` without further checks. It is up to the editing layer,
  to deal with this possibly malicious code.

  CKEditor 5 ships with "default security enabled" feature, which is, that
  any unknown attributes are just stripped and never make it to the editors'
  view.

  Care must be taken, not to enable these attributes/states by accident, either
  by allowing `on*` handlers by a corresponding plugin or by improper
  configuration of the General HTML Support (GHS) plugin, e.g., by using the
  wildcard configuration: _any HTML is considered valid_.

* An attacker tricks editors by malicious URLs in `[url=...]`.

  Again, the BBCode plugin will not apply any filter here and trusts the
  editing layer to handle possibly dangerous links with care. This is known
  to work for current CKEditor 5 versions in that way, that any protocols
  not on the allow-list (as of now, https, http, ftp, ftps and mailto) will
  create links in the CKEditor 5 editing UI, that are sanitized (but can
  still be edited).

  Nevertheless, there is no additional filter on data-processing layer, that,
  for example, removes URLs to malicious websites, as modifying data should be
  a clear conscious editorial action. 

## CoreMedia BBCode 2.0 Specification

This section summarizes the "CoreMedia BBCode 2.0", i.e., how we interpret
BBCode. It is "Version 2.0", as previous to that, no clear definition existed.
But as BBCode is mostly vendor specific, a clear definition is required for
consistent mapping to other formats such as HTML.

The following specification adheres the conventions of the CKEditor 4
BBCode Plugin with adaptions required for CKEditor 5.

**Adaptation Example:** While in CKEditor 4 `[size=100]` got interpreted as
percentage value (thus, `font-size: 100%` in HTML), CKEditor 5 Font Size
Plugin only supports pixels (given as numeric values) or class based styling
options with default to classes `text-tiny`, `text-small`, `text-big` and
`text-huge` (and of course unset, thus normal font-size). Thus, we had to
identify a best-effort solution that combines both worlds.

### General Formatting

#### Attributes

All attributes to BBCode tags are best handled, if they are placed in double
quotes. This is the default behavior for the `toData` transformation.

#### Paragraphs

Paragraphs are created by an extra newline. Example mapping:

```text
Paragraph 1

Paragraph 2
```

And the representation in data view:

```html
<p>Paragraph 1</p>
<p>Paragraph 2</p>
```

#### Escaping

For escaping you may use the backslash character:

```text
\[b\]Not bold, because escaped.\[b\]
```

### BBCode Tag Overview

#### \[b\] – Bold

| Tag   | data view                           |
|-------|-------------------------------------|
| `[b]` | `<span style="font-weight: bold;">` |

#### \[code\] – Code Block

| Tag           | data view                                |
|---------------|------------------------------------------|
| `[code]`      | `<pre><code class="language-plaintext">` |
| `[code=html]` | `<pre><code class="language-html">`      |

#### \[color\] – Font Color

| Tag                 | data view                          |
|---------------------|------------------------------------|
| `[color=#ff0000]`   | `<span style="color: #ff0000;">`   |
| `[color=#ff0000a0]` | `<span style="color: #ff0000a0;">` |
| `[color=red]`       | `<span style="color: red;">`       |

#### \[h1\] to \[h6\] – Headings

| Tag    | data view |
|--------|-----------|
| `[h1]` | `<h1>`    |
| `[h2]` | `<h2>`    |
| `[h3]` | `<h3>`    |
| `[h4]` | `<h4>`    |
| `[h5]` | `<h5>`    |
| `[h6]` | `<h6>`    |

#### \[i\] – Italic

| Tag   | data view                            |
|-------|--------------------------------------|
| `[i]` | `<span style="font-style: italic;">` |

#### \[img\] – Image

| Tag                                | data view                           |
|------------------------------------|-------------------------------------|
| `[img]https://...[/img]`           | `<img src="https://...">`           |
| `[img alt="ALT"]https://...[/img]` | `<img alt="ALT" src="https://...">` |

#### \[list\] – Ordered and Unordered Lists

| Tag        | data view       |
|------------|-----------------|
| `[list]`   | `<ul>`          |
| `[list=1]` | `<ol>`          |
| `[list=a]` | `<ol type="a">` |
| `[*]`      | `<li>`          |


#### \[quote\] – Block Quote

| Tag              | data view         |
|------------------|-------------------|
| `[quote]`        | `<blockquote><p>` |
| `[quote=author]` | `<blockquote><p>` |

Author information is stripped as unsupported in HTML. Subsequently, author
information is stripped when written back to data.

#### \[s\] – Strikethrough

| Tag   | data view                                       |
|-------|-------------------------------------------------|
| `[s]` | `<span style="text-decoration: line-through;">` |

#### \[size=number\] – Font Size

| Tag         | data view                   |
|-------------|-----------------------------|
| `[size=85]` | `<span class="text-small">` |

The number denotes a percentage-level, that is normalized to an enumeration:

|  Input Range  | `toView` Class | Suggested `em` mapping | `toData` Normalization |
|:-------------:|----------------|-----------------------:|-----------------------:|
|  0 ≤ N < 78   | `text-tiny`    |                `0.7em` |                     70 |
|  78 ≤ N < 93  | `text-small`   |               `0.85em` |                     85 |
| 93 ≤ N < 120  | _none_         |                  `1em` |                    100 |
| 120 ≤ N < 160 | `text-big`     |                `1.4em` |                    140 |
|    160 ≤ N    | `text-huge`    |                `1.8em` |                    180 |

Sizes normalized to 100 will neither be represented in data view nor later
transformed back to data.

**Example:**

```text
[size=70]g[/size][size=85]r[/size][size=140]o[/size][size=180]w[/size]
```

#### \[u\] – Underline

| Tag   | data view                                    |
|-------|----------------------------------------------|
| `[u]` | `<span style="text-decoration: underline;">` |

#### \[url\] – Link

| Tag                      | data view                |
|--------------------------|--------------------------|
| `[url=https://...]`      | `<a href="https://...">` |
| `[url]https://...[/url]` | `<a href="https://...">` |

## See Also

* [BBCode - Wikipedia](https://en.wikipedia.org/wiki/BBCode)
* [BBCode.org, BBCode users guide and tricks on web2 and web3](https://www.bbcode.org/)
* [JiLiZART/BBob][BBob]

[BBob]: <https://github.com/JiLiZART/BBob> "JiLiZART/BBob"
