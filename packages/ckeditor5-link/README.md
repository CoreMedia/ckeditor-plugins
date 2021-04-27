CoreMedia CKEditor 5 Link Plugin
================================================================================

This plugin extends the [CKEditor 5 Link Plugin][cke5:docs:link:feature] in several
ways:

* It adds a configuration option for the `target` behavior.
* It adds support for internal links within CoreMedia CMS.

User Interface
--------------------------------------------------------------------------------

The standard link interface (without manual decorators) looks as follows
(scribbles):

* First time creation:

    ```text
    +--------------------------------------------------------------------------+
    | Link URL                                                                 |
    | _____________________________________                      (Ok) (Cancel) |
    +--------------------------------------------------------------------------+
    ```

* Balloon dialog on focus:

    ```text
    +--------------------------------------------------------------------------+
    | https://example.org/                                      (Pen) (Unlink) |
    +--------------------------------------------------------------------------+
    ```

* Edit dialog:

    ```text
    +--------------------------------------------------------------------------+
    | Link URL                                                                 |
    | https://example.org/                                       (Ok) (Cancel) |
    +--------------------------------------------------------------------------+
    ```

    Thus, the very same as on creation, just the Link URL is filled already.

Having manual decorators, the UI changes a little. The manual decorators are
rendered as switches (state April 14th, 2021):

* Creation and Editing:

    ```text
    +---------------------+
    | Link URL            |
    | ___________________ |
    |                     |
    | Switch On      [ o] |
    | Switch Off     [o ] |
    | ------------------- |
    |   (Ok) | (Cancel)   |
    +---------------------+
    ```

### Design Considerations

* We want to re-use as much of the original Link-UI as possible, so that
    additional plugins extending the Link plugin can easily be added.

* We want to provide the same/similar UI for internal and external links.
    This is different to CKEditor 4 solution, where one toolbar action existed
    for each of them. The CKEditor 4 solution not only struggles regarding
    user experience, it also challenges the disabled/enabled behavior within
    CKEditor 5, as two states exclude each other.

    In addition to that, if we make it _one balloon to rule them all_, editors
    could easily change an external link to an internal link without having to
    jump between toolbar actions (first remove the old link, then add the
    new one).

* We must (at best) be able to represent any state, that can be created within
    CoreMedia RichText.

#### Edit Balloon Sketch

The following is a rough sketch, of how the UI may look like, not yet
considering, what we may achieve with the existing CKEditor 5 components.

##### Initial

```text
+------------------------------------------------------------------------------+
| Link                                                                         |
| _______________________________________________________________________ (📘) |
|                                                                              |
| Target: <Current Window (x)> (⇩)                                             |
|                                                                              |
| ---------------------------------------------------------------------------- |
|                                                                              |
|                                   (/) | (x)                                  |
+------------------------------------------------------------------------------+
```

Below "Link" you will have the option to type the URL - or start typing a
content name for auto-completion. This area also serves as drag and drop target
when dragging contents from library.

(📘) is a button, which will open the library, so that we may drag contents
from CoreMedia Studio Library into the field.

The Target field combines the previous "Link Behavior" and "Target" field. It
contains the (configurable) default value. If it is one of the enumberated
types, it is represented as pill button, having an "x" to clear the value
and for example type a completely custom target string. In addition to that,
it serves as "type-ahead" field to select one of the possible values:

* Current Window
* New Window or Tab
* Show Embedded

The previous "Open in Frame" is the custom text entered.
(⇩) can be used, to open the list of enumberated entries without typing.

**Caveats:**

* The pill button may not be easy to achieve. As first iteration, we may stick
    to the split design having a "Link Behavior" selector and a "Target" string
    input field, which is only enabled for entry "Open in Frame" (if we stick
    to that label).

* This approach will not allow having different default targets for external
    and internal links.

* Type-ahead may get complicated, as editors may just want to enter an external
    URL. In this case, a popup after, lets say, 3 letters typed: "htt" is most
    likely not helpful. Instead we may want to start type-ahead completion after
    5 characters got typed (thus, we are quite sure, if we have a protocol
    typed in here or not) or just don't auto-complete while the entered text
    may still be a protocol.

* The combined approach may clash with `defaultProtocol` which is a configuration
    option of the CKEditor 5 Link Plugin. We may assume, that any text, which
    does not match a given content, has to be considered a link and thus will
    get `https://` as prefix (this is similar to the CKEditor 4 behavior).

* If we allow "fast URL typing" such as `example.org` it may clash with a
    document named `example.org`. Possible solution options: Close the
    suggestions on ESC (but not the dialog! Is this possible?) or don't select
    one of the suggestion by default (which would be accepted on enter).

##### With Dragged Content

```text
+------------------------------------------------------------------------------+
| Link                                                                         |
| < My Dragged Content Item (x)>                                          (📘) |
|                                                                              |
| Target: <Current Window (x)> (⇩)                                             |
|                                                                              |
| ---------------------------------------------------------------------------- |
|                                                                              |
|                                   (/) | (x)                                  |
+------------------------------------------------------------------------------+
```

A content is represented as pill button (we cannot "edit" its name here). To
remove it, you will press (x) button within the pill. Drag and drop from library
will replace the pill.

To switch to external URL, you would press (x) and start typing.

#### Focus Balloon

The focus balloon allows to open links, either the corresonding content or the
external URL. And, as it is the default, provide a button to switch to edit
mode or just to remove the link.

For content, the content name will be displayed (or a placeholder for
unreadable content) and URLs will be displayed as normal text (default
CKEditor 5 behavior).

Target Behavior
--------------------------------------------------------------------------------

The following `target` behaviors can be selected:

* **replace (default regarding `xlink:show`):** This value specifies that the
    referenced resource is opened in the same window or tab. This is represented
    as `target="_top"`.

    Note, that `target="_self"` (if copied and pasted from outside) will
    be represented as `xlink:show="other" xlink:role="_self"` later in
    data processing.
* **new:** This value specifies that the referenced resource is opened in
    a new window or tab. This is similar to the effect achieved by an HTML
    `<a>` element with target set to `_blank`.
* **embed:** This value specifies that instead of linking to the resource
    it will be loaded and shown within the document. This is similar to the
    effect achieved by an HTML `<img>` element.
* **other:** This value indicates that other markup present in the link
    determines its behavior. Within CoreMedia context this is typically
    stored in `xlink:role` attribute, although the
    [original specification][w3.xlink] states to store
    [Legacy extended IRIs][w3:IRI] in `xlink:role`, the common pattern
    within CoreMedia RichText is to store a string inside here, which
    shall be used as `target` attribute.
    Note, that for example the following are handled different by this
    plugin, while CoreMedia RichText transformed to HTML may provide the
    same result:
    ```xml
    <a xlink:show="new"/>
    ```
    ```xml
    <a xlink:show="other" xlink:role="_blank"/>
    ```
* **none:** This value specifies that there is no indication for how to
    refer to the linked resource.

### Data Processing

These are guidelines for the data processing regarding CoreMedia RichText 1.0.
The data processing is not part of this plugin but requires
`@coremedia/ckeditor5-coremedia-richtext` plugin.

#### toData

For CoreMedia RichText it is expected, that the `target` property is mapped
in the following way:

* **_unset_:** Neither `xlink:show` nor `xlink:role` will be added.

* **`_top`:** Represented as `xlink:show="replace"`.

* **`_blank`:** Represented as `xlink:show="new"`.

* **`_embed`:** Represented as `xlink:show="embed"`. Note, that `_embed` is not
    defined as standard value of `target` but is dedicated to the representation
    as `xlink:show`  within CoreMedia RichText 1.0.

* **`_none`:** Represented as `xlink:show="none"`. Just as `_embed_` this is not
    defined as standard value of `target` but is dedicated to the representation
    as `xlink:show`  within CoreMedia RichText 1.0.

* **_any other string_:** Represented as `xlink:show="other" xlink:role="<string>"`.

**Special Cases:**

* **`_role_`_any string_:** Special artificial state which is suggested to behave
    similar to _any other string_. It will be represented as
    `xlink:role=any string` without any `xlink:show` attribute. This state is
    required for data consistency, as it is completely valid according to the
    CoreMedia RichText 1.0 DTD only having an `xlink:role` attribute without
    `xlink:show`.

* **`_other`:** Special artificial state which will be stored as
   `xlink:show="other"` from CoreMedia RichText 1.0 which comes without
   corresponding `xlink:role` attribute.

* **_empty string_:** Represented as `xlink:show="other" xlink:role=""`.

#### toView

It is expected, that a bijective mapping exists for the mappings as defined for
`toData` mapping.

The _Special Cases_ for the `toData` mapping exist, because the CKEditor is not
the only client creating CoreMedia RichText. As such, any data which are valid
regarding CoreMedia RichText 1.0 DTD must be represented in some way in the
model of CKEditor.

### CKEditor 4 Behavior

Some details on the CKEditor 4 integration in CoreMedia Studio and its behavior
regarding different states of `xlink:show` and `xlink:role` are shown here.
It is important to note, that for CKEditor 4 we kept `xlink:show` and
`xlink:role` as extra _hidden_ attributes within CKEditor HTML and all actions
modifying these behaviors, knew about them.

For CKEditor 5 we decided to stick to the more generic `target` attribute as
representation within CKEditor. This makes it obsolete adding some special
paste handler transforming such target attributes.

**Note on xlink:type:** This is a `#FIXED` attribute, which can only have
the value `simple` but is optional to add. Nevertheless, for CKEditor 4
we always added `xlink:type="simple"` to the generated CoreMedia RichText 1.0
XML document.

#### Write Behavior

The following is the behavior when creating links within CoreMedia Studio with
CKEditor 4:

* **Open in New Window** (Default)

    ```xml
    <a xlink:show="new" xlink:href="https://example.org/" xlink:type="simple">
    ```

* **Open in Current Window**

    ```xml
    <a xlink:show="replace" xlink:href="https://example.org/" xlink:type="simple">
    ```

* **Show Embedded**

    ```xml
    <a xlink:show="embed" xlink:href="https://example.org/" xlink:type="simple">
    ```

* **Open in Frame, Empty Target**

    ```xml
    <a xlink:show="other" xlink:href="https://example.org/" xlink:type="simple">
    ```

    As you see, specifying an empty target, no `xlink:role` attribute will
    be added.

* **Open in Frame, Some Target**

    ```xml
    <a xlink:role="someTarget" xlink:show="other" xlink:href="https://example.org/" xlink:type="simple">
    ```

#### Read Behavior

The mappings from _Write Behavior_ are bijective, which is, when read from
server, the state does not change. But what about CoreMedia RichText 1.0
created outside of CoreMedia Studio with CKEditor 4? This is the behavior:

* **`show=`_unset_, `role=`_unset_**

    _"Open in Frame"_ is selected. (Weird, as this is not the default for the dialog.)
    At current state (reported as bug though), the *Target* field is disabled.

* **`show=other`, `role=`_unset_**

    _"Open in Frame"_ is selected. *Target* field is enabled but empty.

* **`show=new`, `role=someTarget`**

    _"Open in New Window"_ is selected. *Target* field contains `someTarget`
    but is disabled.

* **`show=new`, `role=""`**

    _"Open in New Window"_ is selected. *Target* field is empty and disabled.

* **`show=other`, `role=""`**

    _"Open in Frame"_ is selected. *Target* field is enabled but empty.

* **`show=`_unset_, `role=someTarget`**

    _"Open in Frame"_ is selected. *Target* field contains `someTarget`
    but is disabled.

While some states could be perceived as bugs, this is the current state as of
evaluation on April 14th, 2021.

Regarding `xlink:type` defined as `#FIXED "simple"` in DTD, CKEditor 4 has no
special handling for this, as the server provides the CoreMedia RichText
document **with** added `xlink:type` attribute, no matter how it got created
via Unified API.

Pitfalls
--------------------------------------------------------------------------------

This plugin relies on the `target` attribute. If you enable any feature such
as manual decorators or `addTargetToExternalLinks` in Link plugin, you may
experience the following issue:

* [Link Decorators: NoFollow not being added, creates 2 separate links · Issue #6436 · ckeditor/ckeditor5][cke5:issues:6436]

See Also
--------------------------------------------------------------------------------

* [Create a custom link button · Issue #4836 · ckeditor/ckeditor5][cke5:issues:4836]

    Contains some examples how you may customize link UI.

* [basecondition/ckeditor5-rexlink: This ckeditor5 plugin provide for redaxo internal- and media-links][rexlink]

    An example implementation customizing link UI for internal links with
    custom protocol.

* [How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow][so:cke5:target]

    A good step-by-step guide describing the model-view design for `target`
    attributes. Skips the UI-part, though.

<!-- ======================================================== [ References ] -->

[cke5:docs:link:feature]: <https://ckeditor.com/docs/ckeditor5/latest/features/link.html> "Link - CKEditor 5 Documentation"
[cke5:docs:link:api]: <https://ckeditor.com/docs/ckeditor5/latest/api/module_link_link-Link.html> "Class Link (link/link~Link) - CKEditor 5 API docs"
[cke5:issues:4836]: <https://github.com/ckeditor/ckeditor5/issues/4836> "Create a custom link button · Issue #4836 · ckeditor/ckeditor5"
[cke5:issues:6436]: <https://github.com/ckeditor/ckeditor5/issues/6436> "Link Decorators: NoFollow not being added, creates 2 separate links · Issue #6436 · ckeditor/ckeditor5"
[mdn:xlink:show]: <https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/xlink:show> "xlink:show - SVG: Scalable Vector Graphics | MDN"
[mdn:xlink]: <https://developer.mozilla.org/en-US/docs/Glossary/XLink> "XLink - MDN Web Docs Glossary: Definitions of Web-related terms | MDN"
[so:cke5:target]: <https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5> "How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow"
[rexlink]: <https://github.com/basecondition/ckeditor5-rexlink> "basecondition/ckeditor5-rexlink: This ckeditor5 plugin provide for redaxo internal- and media-links"
[w3:xlink]: <https://www.w3.org/TR/xlink/> "XML Linking Language (XLink) Version 1.1"
[w3:IRI]: <https://www.w3.org/TR/leiri/> "Legacy extended IRIs for XML resource identification"
