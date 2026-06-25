/**
 * Fixtures for the prepared `Tests/Differencing` stories
 * (`tests/storybook/stories/tests/Differencing.stories.ts`) and
 * `tests/playwright/test/Differencing.test.ts`.
 *
 * Server-side differencing augments the data with `<xdiff:span>` elements whose
 * `xdiff:id`/`xdiff:next`/`xdiff:previous` references are produced by a stateful
 * id generator (`Differencing`). The test asserts on the exact augmented markup,
 * so the story's baked `data` and the test's expected strings must be byte-for-byte
 * identical. To guarantee that — and avoid the previous hand-mirrored duplication —
 * the deterministic diff data is generated here once (each builder uses a fresh
 * `Differencing` instance, so the ids are stable) and consumed by both packages.
 *
 * This is the single shared fixture that intentionally depends on the
 * example-data package: the augmented markup _is_ the value under test, and it
 * can only be produced via the `Differencing` builder.
 *
 * Each case `id` is the kebab-cased Storybook story id suffix; the matching
 * story export name (PascalCase) resolves to `tests-differencing--<id>`.
 */

import {
  Differencing,
  EOD,
  blobReference,
  p,
  richtext,
  strong,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";

/**
 * `Differencing` method used to wrap a difference of a given type.
 */
type DiffMethod = "add" | "del" | "change" | "conflict";

/**
 * A single text-difference case (Addition/Removal/Change/Conflict).
 */
export interface DifferencingTextCase {
  /**
   * Kebab-cased story id suffix.
   */
  id: string;
  /**
   * Human-readable difference type, used in the test title.
   */
  type: string;
  /**
   * Baked richtext data the story loads.
   */
  data: string;
  /**
   * Augmented text expected in the processed data view and editing view.
   */
  text: string;
}

const buildTextCase = (id: string, type: string, method: DiffMethod): DifferencingTextCase => {
  const xdiff = new Differencing();
  const difference = xdiff[method](type, EOD);
  const text = `Lorem${difference}Ipsum`;
  return { id, type, data: richtext(p(text)), text };
};

const conflictChangesText = "Some conflicting changes";

const buildAllAttributes = () => {
  const xdiff = new Differencing();
  const changes = [
    xdiff.add("Add"),
    xdiff.del("Del"),
    xdiff.conflict("Conflict", { changes: conflictChangesText }),
    xdiff.change("Change", EOD),
  ];
  const difference = changes.join("");
  const text = `Lorem${difference}Ipsum`;
  return {
    id: "all-attributes",
    data: richtext(p(text)),
    text,
    conflictChangesText,
    changeCount: changes.length,
  };
};

const buildFalsePositiveNewline = () => {
  const xdiff = new Differencing();

  // EOD: We mark all diffs as EOD for simpler matching, as we don't struggle
  // with attribute order then.
  const difference = `${xdiff.change("bold ", EOD)}${xdiff.add(" ", EOD)}`;
  // CKEditor's behavior is to change whitespaces to `&nbsp;` in here. And: As
  // `bold` is a text attribute, it gets split up in this scenario, so that the
  // text as well as the space are wrapped in `<strong>` element.
  const expectedDifferenceInEditingView = `${xdiff.change(`<strong>bold&nbsp;</strong>`, EOD)}${xdiff.add(
    `<strong>&nbsp;</strong>`,
    EOD,
  )}`;

  const innerHtml = `This ${strong(difference)}text.`;
  const text = `${p(innerHtml)}`;

  return {
    id: "false-positive-newline",
    data: richtext(text),
    text,
    expectedDifferenceInEditingView,
  };
};

const buildAddedNewline = () => {
  const xdiff = new Differencing();
  const difference = xdiff.add("", EOD);
  // This is, how added newlines are typically represented by server side
  // differencing. Here: Added newline after `Lorem`.
  const text = `${p(`Lorem${difference}`)}${p(`Ipsum`)}`;

  // To differentiate from 'added whitespace' characters, the xdiff:span is
  // replaced by an artificial xdiff:br on data-processing level.
  const dataProcessedDifference = difference.replaceAll("xdiff:span", "xdiff:br");
  const dataProcessedText = `${p(`Lorem${dataProcessedDifference}`)}${p(`Ipsum`)}`;

  return {
    id: "added-newline",
    data: richtext(text),
    dataProcessedText,
    dataProcessedDifference,
  };
};

const imageTestName = "img Element Augmentation by xdiff:changetype should be passed to editing view";

const buildImage = () => {
  const contentId = 42;
  const blobRef = blobReference(contentId);
  const changes = `<ul class='changelist'><li>Changed from an <b>image</b> with alt Some Image, class float--left, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${blobRef}.</li><li>Changed to an <b>image</b> with alt Some Image, class float--right, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${blobRef}.</li></ul>`;

  const xdiff = new Differencing();
  const data = richtext(
    p(
      xdiff.img(
        { type: "changed", changes, ...EOD },
        {
          "alt": imageTestName,
          "xlink:href": blobRef,
          "class": "float--right",
        },
      ),
    ),
  );

  return {
    id: "image-changetype",
    contentId,
    name: imageTestName,
    contentName: `Blue Image for test ${imageTestName}`,
    blobRef,
    changes,
    data,
  };
};

/**
 * Fully prepared differencing fixtures: one entry per prepared story, each
 * carrying the baked `data` plus the augmented strings the test asserts on.
 */
export const differencingScenario = {
  textCases: [
    buildTextCase("addition", "Addition", "add"),
    buildTextCase("removal", "Removal", "del"),
    buildTextCase("change", "Change", "change"),
    buildTextCase("conflict", "Conflict", "conflict"),
  ],
  allAttributes: buildAllAttributes(),
  falsePositiveNewline: buildFalsePositiveNewline(),
  addedNewline: buildAddedNewline(),
  image: buildImage(),
} as const;
