CoreMedia CKEditor 5 Images
================================================================================

#### Data (tag: img):

Relevant attributes:

| Data            | View                 | Model           | Plugin  | Data Example                              |
|-----------------|----------------------|-----------------|---------|-------------------------------------------|
| `alt`           | `alt`                | `alt`           | default | `alt="Some Alternative"`                  |
| `dir`           | `dir`                | `dir`           |         | `dir="ltr"`                               |
| `xlink:actuate` | `data-xlink-actuate` | `xlink-actuate` |         | `xlink:actuate="onLoad"`                  |
| `xlink:href `   | `data-xlink-href`    | `xlink-href`    | default | `xlink:href="content/42#properties.data"` | 
| `xlink:role`    | `data-xlink-role`    | `xlink-role`    |         | `xlink:role="https://example.org/"`       | 
| `xlink:show`    | `data-xlink-show`    | `xlink-show`    |         | `xlink:show="embed"`                      |
| `xlink:title`   | `title`              | `title`         |         | `xlink:title="All Attributes"`            | 
| `xlink:type`    | `data-xlink-type`    | `xlink-type`    |         | `xlink:type="simple"`                     |

Not that relevant attributes:

| Data       | View     | Model                   | Plugin            | Data Example        |
|------------|----------|-------------------------|-------------------|---------------------|
| `class`    | `class`  | `class`                 |                   | `class="grs xmp"`   | 
| `xml:lang` | `lang`   | `lang`                  |                   | `xml:lang="en"`     |
| `height`   | `height` | ``                      |                   | `height="48"`       |
| `width`    | `width`  | `width` (inline, block) | ImageResizePlugin | `width="48"`        |
