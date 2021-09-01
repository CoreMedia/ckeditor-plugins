# Content-Link Feature

CoreMedia CMS manages its resources in so-called _Contents_, where each Content
may either be a Document or a Folder.

The Content-Link Feature adds transparent support to
[CKEditor's Link Feature][cke5:docs:link:feature] by especially extending
`LinkFormView` to be able to hold references to Contents.

* [Integration][]
* [CoreMedia RichText 1.0 Integration][]

## Integration

[Integration]: <#integration>

[[Top][]|[Integration][]|[Design][]|[RichText][]]

```typescript
import LinkTarget from "@coremedia/ckeditor5-link/contentlink/ContentLinks";

ClassicEditor
  .create(document.querySelector("#editor"), {
    plugins: {
      // ...
      ContentLinks,
    },
    // ...
  })
  .then(...)
  .catch(...);
```

**Essentials Plugin:** This Plugin is part of CoreMedia Essentials Plugin.

## Design

[Design]: <#design>

[[Top][]|[Integration][]|[Design][]|[RichText][]]

### Representation for Root-Folder

While in general it is expected, that folders are not allowed to be referenced
within standard RichText properties, clients like Studio-Client can be
configured, to allow links to folders — including the root folder.

The root-folder, though, is the only content, which has/may have an empty name,
which again provides a challenge when a name is required for editing purpose.

In context of the Content-Links feature, we decided:

* To use an artificial name/placeholder `<root>` when a name has to be written
  to the text (on drag and drop or for creating links for a collapsed selection)
  .
* To display an empty name in preview scenarios (`LinkActionsView`,
  `LinkFormView`).

If we experience the need to officially support links to root-folder these
decisions are subject to change.

## CoreMedia RichText 1.0 Integration

[CoreMedia RichText 1.0 Integration]: <#coremedia-richtext-10-integration>

[RichText]: <#coremedia-richtext-10-integration>

[[Top][]|[Integration][]|[Design][]|[RichText][]]

For easier integration with [CKEditor's Link Feature][cke5:docs:link:feature] it
is required, that content-links are represented in `href` attribute with
`content:` scheme syntax:

```xml

<a href="content:42">Some Content</a>
```

This requires:

* Mapping `xlink:href` to `href` during `toView` transformation in
  data-processing.

* Transforming `xlink:href` attributes referring to contents to
  `content:<numeric ID>`.

In context of CoreMedia Studio, you may expect, that the REST backend already
transformed more verbose content URIs from `coremedia:///cap/content/42` to a
shorter form: `content/42`. Thus, data-processing just needs to replace the
slash by a colon.

<!-- ======================================================== [ References ] -->

[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"

[Top]: <#top> "Jump to top of document"
