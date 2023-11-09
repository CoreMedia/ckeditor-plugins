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

### \[size=number\]

The number denotes a percentage-level, that is normalized to an enumeration:

|  Input Range  | `toView` Class | Suggested `em` mapping | `toData` Normalization |
|:-------------:|----------------|-----------------------:|-----------------------:|
|  0 ≤ N < 78   | `text-tiny`    |                `0.7em` |                     70 |
|  78 ≤ N < 93  | `text-small`   |               `0.85em` |                     85 |
| 93 ≤ N < 120  | _none_         |                  `1em` |                    100 |
| 120 ≤ N < 160 | `text-big`     |                `1.4em` |                    140 |
|    160 ≤ N    | `text-huge`    |                `1.8em` |                    180 |

TODO: To be continued
