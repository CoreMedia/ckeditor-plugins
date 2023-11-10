# CoreMedia BBCode 2.0 Specification

This document summarizes the "CoreMedia BBCode 2.0", i.e., how we interpret
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

## BBCode Tag Overview

### \[b\] – Bold

| Tag   | data view                           |
|-------|-------------------------------------|
| `[b]` | `<span style="font-weight: bold;">` |

### \[code\] – Code Block

| Tag           | data view                                |
|---------------|------------------------------------------|
| `[code]`      | `<pre><code class="language-plaintext">` |
| `[code=html]` | `<pre><code class="language-html">`      |

### \[color\] – Font Color

| Tag                 | data view                          |
|---------------------|------------------------------------|
| `[color=#ff0000]`   | `<span style="color: #ff0000;">`   |
| `[color=#ff0000a0]` | `<span style="color: #ff0000a0;">` |
| `[color=red]`       | `<span style="color: red;">`       |

### \[h1\] to \[h6\] – Headings

| Tag    | data view |
|--------|-----------|
| `[h1]` | `<h1>`    |
| `[h2]` | `<h2>`    |
| `[h3]` | `<h3>`    |
| `[h4]` | `<h4>`    |
| `[h5]` | `<h5>`    |
| `[h6]` | `<h6>`    |

### \[i\] – Italic

| Tag   | data view                            |
|-------|--------------------------------------|
| `[i]` | `<span style="font-style: italic;">` |

### \[img\] – Image

| Tag                                | data view                           |
|------------------------------------|-------------------------------------|
| `[img]https://...[/img]`           | `<img src="https://...">`           |
| `[img alt="ALT"]https://...[/img]` | `<img alt="ALT" src="https://...">` |

### \[list\] – Ordered and Unordered Lists

| Tag        | data view       |
|------------|-----------------|
| `[list]`   | `<ul>`          |
| `[list=1]` | `<ol>`          |
| `[list=a]` | `<ol type="a">` |
| `[*]`      | `<li>`          |


### \[quote\] – Block Quote

| Tag              | data view         |
|------------------|-------------------|
| `[quote]`        | `<blockquote><p>` |
| `[quote=author]` | `<blockquote><p>` |

Author information is stripped as unsupported in HTML. Subsequently, author
information is stripped when written back to data.

### \[s\] – Strikethrough

| Tag   | data view                                       |
|-------|-------------------------------------------------|
| `[s]` | `<span style="text-decoration: line-through;">` |

### \[size=number\] – Font Size

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

```wiki
[size=70]g[/size][size=85]r[/size][size=140]o[/size][size=180]w[/size]
```

### \[u\] – Underline

| Tag   | data view                                    |
|-------|----------------------------------------------|
| `[u]` | `<span style="text-decoration: underline;">` |

### \[url\] – Link

| Tag                      | data view                |
|--------------------------|--------------------------|
| `[url=https://...]`      | `<a href="https://...">` |
| `[url]https://...[/url]` | `<a href="https://...">` |
