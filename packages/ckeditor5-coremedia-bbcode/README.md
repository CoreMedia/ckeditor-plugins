# CoreMedia BBCode Plugin

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_coremedia_bbcode.html> "@coremedia/ckeditor5-coremedia-bbcode"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-coremedia-bbcode`

TODO: Rename to ckeditor5-bbcode... there is nothing CoreMedia specific inside here.

TODO: Documentation

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
