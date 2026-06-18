import {
  richtext,
  p,
  strong,
  Differencing,
  EOD,
  blobReference,
} from "@coremedia-internal/ckeditor5-coremedia-example-data";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { openStory } from "./storybook/mountStory";
import { addMockContents, setEditorData, setEditorDataAndGetDataView } from "./storybook/testApi";
import { PNG_BLUE_240x135 } from "./MockFixtures";

const xdiff = new Differencing();

/**
 * Tests the server-side differencing feature, thus, that augmented
 * data from CoreMedia Studio Server pass to Editing View, which is
 * important for later applied CSS styling (not tested here).
 *
 * The test assumes, that differencing plugin is installed. Different to
 * in-production use, where differencing is only active in read-only view, the
 * scenario uses differencing in R/W view. Testing editing in these cases is not
 * required and not done within this test.
 *
 * If any of these tests fail, and the behavior has to be accepted, it
 * is most likely, that CSS rules for difference highlighting have
 * to be adapted.
 *
 * Migrated to run against the Storybook story `tests-differencing--default`
 * (see `tests/storybook/stories/tests/Differencing.stories.ts`) instead of the
 * former example application.
 */
const storyId = "tests-differencing--default";

test.describe("Differencing Feature", () => {
  test.beforeEach(async ({ page }) => {
    await openStory(page, storyId);
  });

  test.afterEach(() => {
    // Just in case, we missed to specify some EOD flag.
    xdiff.resetIds();
  });

  test.describe("Text Differencing", () => {
    // Test relies on attribute order for simpler assertions. Thus,
    // the test is especially not suitable for more complex attribute
    // sets.
    const cases = [
      { type: "Addition", difference: xdiff.add("Addition", EOD) },
      { type: "Removal", difference: xdiff.del("Removal", EOD) },
      { type: "Change", difference: xdiff.change("Change", EOD) },
      { type: "Conflict", difference: xdiff.conflict("Conflict", EOD) },
    ];

    for (const { type, difference } of cases) {
      test(`XDiff Augmentation should be available in editing view: ${type}`, async ({ page }) => {
        const editable = editor(page);

        const text = `Lorem${difference}Ipsum`;
        const diffData = richtext(p(text));
        const dataView = await setEditorDataAndGetDataView(page, diffData);

        // Validate Data-Processing
        expect(dataView).toContain(text);

        // Validate Editing Downcast
        // If this fails due to order of attributes, expectations have to be
        // refactored, e.g., using a structural match.
        await expect.poll(() => editable.innerHTML()).toContain(text);
      });
    }

    test("All xdiff:span Attributes should be forwarded from data to editing view", async ({ page }) => {
      const editable = editor(page);

      const conflictChangesText = "Some conflicting changes";
      const changes = [
        xdiff.add("Add"),
        xdiff.del("Del"),
        xdiff.conflict("Conflict", { changes: conflictChangesText }),
        xdiff.change("Change", EOD),
      ];
      const difference = changes.join("");

      const text = `Lorem${difference}Ipsum`;
      const diffData = richtext(p(text));
      const dataView = await setEditorDataAndGetDataView(page, diffData);

      // Validate Data-Processing
      expect(dataView).toContain(text);

      // Validate Editing Downcast
      const xdiffSpans = editable.locator("xdiff\\:span");
      await expect(xdiffSpans).toHaveCount(changes.length);

      const shouldBeAddition = xdiffSpans.nth(0);
      const shouldBeDeletion = xdiffSpans.nth(1);
      const shouldBeConflict = xdiffSpans.nth(2);
      const shouldBeChange = xdiffSpans.nth(3);

      await expect(shouldBeAddition).toHaveAttribute("xdiff:class", "diff-html-added");
      await expect(shouldBeAddition).toHaveAttribute("xdiff:id", /-0$/);
      await expect(shouldBeAddition).toHaveAttribute("xdiff:next", /-1$/);

      await expect(shouldBeDeletion).toHaveAttribute("xdiff:class", "diff-html-removed");
      await expect(shouldBeDeletion).toHaveAttribute("xdiff:id", /-1$/);
      await expect(shouldBeDeletion).toHaveAttribute("xdiff:previous", /-0$/);
      await expect(shouldBeDeletion).toHaveAttribute("xdiff:next", /-2$/);

      await expect(shouldBeConflict).toHaveAttribute("xdiff:class", "diff-html-conflict");
      await expect(shouldBeConflict).toHaveAttribute("xdiff:id", /-2$/);
      await expect(shouldBeConflict).toHaveAttribute("xdiff:previous", /-1$/);
      await expect(shouldBeConflict).toHaveAttribute("xdiff:next", /-3$/);
      await expect(shouldBeConflict).toHaveAttribute("xdiff:changes", conflictChangesText);

      await expect(shouldBeChange).toHaveAttribute("xdiff:class", "diff-html-changed");
      await expect(shouldBeChange).toHaveAttribute("xdiff:id", /-3$/);
      await expect(shouldBeChange).toHaveAttribute("xdiff:previous", /-2$/);
    });

    /**
     * If you double-click a word, most browsers will also select the following
     * space of a word. Applying inline styles such as setting the word (and
     * the following space) to bold, results in server-side differencing in
     * augmented data such as (simplified):
     *
     * ```xml
     * <xdiff:span xdiff:class="changed">ipsum </xdiff:span><xdiff:span xdiff:class="added"> </xdiff:span>
     * ```
     *
     * CKEditor default behavior would be to remove the extraneous space within
     * the last diff and possibly add some filler element or marker. In context
     * of differencing, meant for read-only view, this should be prevented. We
     * do so, by declaring `<xdiff:span>` as pre-formatted element.
     *
     * This test shall ensure, that this approach still works for CKEditor.
     *
     * This is related to: ckeditor/ckeditor5#12324
     */
    test("False-Positive Newline should be prevented.", async ({ page }) => {
      const editable = editor(page);

      // Temporarily fix this test
      await setEditorData(page, "");

      // EOD: We mark all diffs as EOD for simpler matching, as we don't struggle
      // with attribute order then.
      const difference = `${xdiff.change("bold ", EOD)}${xdiff.add(" ", EOD)}`;
      // CKEditor's behavior is to change whitespaces to `&nbsp;` in here.
      // And: As `bold` is a text attribute, it gets split up in this scenario,
      // so that the text as well as the space are wrapped in `<strong>`
      // element.
      const expectedDifferenceInEditingView = `${xdiff.change(`<strong>bold&nbsp;</strong>`, EOD)}${xdiff.add(
        `<strong>&nbsp;</strong>`,
        EOD,
      )}`;

      const innerHtml = `This ${strong(difference)}text.`;
      const text = `${p(innerHtml)}`;

      const diffData = richtext(text);
      const dataView = await setEditorDataAndGetDataView(page, diffData);

      expect(dataView).toContain(text);

      // The difference and especially the whitespace within the last
      // xdiff:span should be kept as is.
      await expect.poll(() => editable.innerHTML()).toContain(expectedDifferenceInEditingView);
    });

    // This behavior is required to ease CSS styling of added/removed/... newlines.
    test("Added newline should pass to editing view as empty element", async ({ page }) => {
      const editable = editor(page);

      const difference = xdiff.add("", EOD);
      // This is, how added newlines are typically represented by
      // server side differencing. Here: Added newline after `Lorem`.
      const text = `${p(`Lorem${difference}`)}${p(`Ipsum`)}`;
      const diffData = richtext(text);
      const dataView = await setEditorDataAndGetDataView(page, diffData);

      // To differentiate from 'added whitespace' characters, we need
      // to replace this xdiff:span from data by some other artificial element.
      // We decided for xdiff:br applies on data-processing level, thus, the
      // element is visible in data view as well as later in editing view.
      const dataProcessedDifference = difference.replaceAll("xdiff:span", "xdiff:br");
      const dataProcessedText = `${p(`Lorem${dataProcessedDifference}`)}${p(`Ipsum`)}`;
      // Validate Data-Processing
      expect(dataView).toContain(dataProcessedText);

      // Feature: For better control on CSS styling, we replace the `xdiff:span`
      // Validate Editing Downcast
      // Here, it is important, that no filler element got added to the xdiff:span.
      await expect.poll(() => editable.innerHTML()).toContain(dataProcessedDifference);
    });
  });

  test.describe("Image Differencing", () => {
    test("img Element Augmentation by xdiff:changetype should be passed to editing view", async ({
      page,
    }, testInfo) => {
      const name = testInfo.title;
      const editable = editor(page);

      const id = 42;
      await addMockContents(page, {
        id,
        blob: PNG_BLUE_240x135,
        name: `Blue Image for test ${name}`,
      });

      const blobRef = blobReference(id);
      const changes = `<ul class='changelist'><li>Changed from an <b>image</b> with alt Some Image, class float--left, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${blobRef}.</li><li>Changed to an <b>image</b> with alt Some Image, class float--right, xlink:actuate onLoad, xlink:show embed, xlink:type simple and xlink:href ${blobRef}.</li></ul>`;

      const data = richtext(
        p(
          xdiff.img(
            { type: "changed", changes, ...EOD },
            {
              "alt": name,
              "xlink:href": blobRef,
              "class": "float--right",
            },
          ),
        ),
      );

      await setEditorDataAndGetDataView(page, data);

      const xdiffSpan = editable.locator("xdiff\\:span");
      await expect(xdiffSpan).toBeAttached();

      // CKEditor Behavior: Images (at least inline-images, as we use them)
      // are wrapped by an additional span. It is also this span, which
      // receives the `xdiff:changetype` attribute in editing view, which
      // (in data) was set at the image.
      const inlineImageSpan = xdiffSpan.locator("span.image-inline");
      await expect(inlineImageSpan).toBeAttached();

      // Image should exist
      await expect(inlineImageSpan.locator("img")).toBeAttached();

      await expect(xdiffSpan).toHaveAttribute("xdiff:class", "diff-html-changed");
      await expect(xdiffSpan).toHaveAttribute("xdiff:changes", changes);
      await expect(inlineImageSpan).toHaveAttribute("xdiff:changetype", "diff-changed-image");
    });
  });
});
