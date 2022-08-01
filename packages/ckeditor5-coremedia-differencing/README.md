CoreMedia Differencing Plugin
================================================================================

Other than possibly suggested by the plugin-name, this plugin does not take
care of calculating differences by itself. It is meant to be ensure, that
differencing data as generated in CoreMedia Studio are forwarded to editing
view, so that CSS rules can be applied to it, to highlight changes, additions
and deletions.

CoreMedia Server-Side Differencing
--------------------------------------------------------------------------------

In CoreMedia Studio, differences of CoreMedia RichText are evaluated on the
server. The corresponding reponse is similar to this:

```xml
<div xmlns="http://www.coremedia.com/2003/richtext-1.0"
     xmlns:xdiff="http://www.coremedia.com/2015/xdiff">
  <p>
    Lorem ipsum dolor sit amet,
    <strong class="color--red background-color--purple">
      <xdiff:span
              xdiff:class="diff-html-changed"
              xdiff:changes="&lt;b&gt;Strong&lt;/b&gt; style added with class color--red background-color--purple."
              xdiff:id="changed-diff-0">
        consectetuer
      </xdiff:span>
    </strong> adipiscing elit.</p>
</div>
```

The (yet) only relevant attribute for CoreMedia Differencing Plugin is
`xdiff:class`, which is one of these:

* **`diff-html-added`**

  Some elements (including text nodes) have been added.

* **`diff-html-changed`**

  Elements, text or element attributes have been changed.

* **`diff-html-removed`**

  Elements, text or element attributes have been removed.

* **`diff-html-conflict`**

  Difference could not be evaluated due to a conflicting change.

`xdiff:id` could be used to jump between differences. It is unused yet.

`xdiff:changes` show a verbose (English only) description of the applied
changes. As we do not (yet) show these in UI, these are ignored.

Assumptions
--------------------------------------------------------------------------------

* A CKEditor showing differences is always in read-only mode.

* Any other attribute than `xdiff:class` are irrelevant. For a set of all
  allowed attributes, see [xdiff.xsd][].

Requirements
--------------------------------------------------------------------------------

* Differences must never be written back to server.

* Copying from differencing data to a standard CKEditor must strip the
  `xdiff:span` elements. This is most likely triggered by CKEditor itself,
  as for standard editors, the element `xdiff:span` should be unknown.

[xdiff.xsd]: <./xdiff.xsd> "XDiff Schema"
