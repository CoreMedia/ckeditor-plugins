# BBCode Tests

While some of the tests in here seem to "repeat the same thing", they are meant
to provide feedback on different integration levels.

The most important one is:

## BBobIntegration.test.ts

* \[[BBobIntegration.test.ts](./BBobIntegration.test.ts)\]

Its main part is meant to guarantee, that a complete `toView` → `toData` cycle
works as expected. It could be summarized as:

* Guarantee, that we understand our own data-processed results.
* Guarantee, to have some invariance on repetitive data-process cycles.

## bbcode2html and html2bbcode

* \[[bbcode2html.test.ts](./bbcode2html.test.ts)\]
* \[[html2bbcode.test.ts](./html2bbcode.test.ts)\]

The next integration test layer, which validates the entry points for
data-processing (`toView` regarding `bbcode2html`; `toData` for `html2bbcode`,
respectively).

## bbob/ckeditor5Preset.test.ts

* \[[ckeditor5Preset.test.ts](./bbob/ckeditor5Preset.test.ts)\]

This is almost a unit-test, but also tests integration with BBob. The test
may fail, for example, when BBob changes the HTML5 Preset base, we are
using here. We expect more changes to applied here on BBob upgrade than
for other tests in here.

## BBCode*test.ts

These are unit tests dedicated to each single `toData` rule. They are assumed
to be (more) stable over time.
