# CoreMedia BBCode Plugin

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_coremedia_bbcode.html> "@coremedia/ckeditor5-coremedia-bbcode"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-coremedia-bbcode`

TODO: Rename to ckeditor5-bbcode... there is nothing CoreMedia specific inside here.

TODO: Documentation

## Supported BBCode

The BBCode to HTML processing is based on
[JiLiZART/BBob](https://github.com/JiLiZART/BBob/tree/master) and its
HTML5 Preset.

As such, the following tags are supported:

| Tag       | as HTML                                         |
|-----------|-------------------------------------------------|
| `[h1]`    | `<h1>`                                          |
| `[h2]`    | `<h2>`                                          |
| `[h3]`    | `<h3>`                                          |
| `[h4]`    | `<h4>`                                          |
| `[h5]`    | `<h5>`                                          |
| `[h6]`    | `<h6>`                                          |
| `[b]`     | `<span style="font-weight: bold;">`             |
| `[i]`     | `<span style="font-style: italic;">`            |
| `[u]`     | `<span style="text-decoration: underline;">`    |
| `[s]`     | `<span style="text-decoration: line-through;">` |
| `[url]`   | `<a href="...">`                                |
| `[img]`   | `<img src="...">`                               |
| `[quote]` | `<blockquote><p>`                               |
| `[code]`  | `<pre>`                                         |
| `[style]` | `<span style="...">`                            |
| `[list]`  | `<ol>` or `<ul>`                                |
| `[color]` | `<span style="color:...">`                      |

If you experience resulting markup from being stripped within CKEditor 5,
check your `plugins` configuration or configuration of the General HTML Support
feature (GHS).

## Security Considerations

### Escaping

The BBCode plugin uses escaping via backslash character for parsing as well as
processing HTML to BBCode (`toData` transformation).

Thus, expect any stored BBCode to escape square brackets in text with
backslash characters:

```text
[b]This is bold![/b]
\[b\]This is not bold!\[/b\]
```
