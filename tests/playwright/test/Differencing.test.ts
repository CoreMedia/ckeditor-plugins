import { differencingScenario } from "@coremedia/ckeditor5-itest-constants";
import { expect, test } from "./base";
import { editor } from "./locators/editor";
import { dataView } from "./locators/outputs";
import { openStory } from "./storybook/mountStory";

const storyId = (id: string): string => `tests-differencing--${id}`;

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
 * Migrated to run against the fully prepared Storybook stories
 * `tests-differencing--*` (see
 * `tests/storybook/stories/tests/Differencing.stories.ts`): each story bakes
 * the augmented richtext data and exposes the processed `data-view` observable
 * output, so the test only opens the story and asserts through the `dataView`
 * locator and editing-view locators — no `page.evaluate`. The augmented data and
 * the expected strings are shared via `@coremedia/ckeditor5-itest-constants`
 * (`differencingScenario`).
 */
test.describe("Differencing Feature", () => {
  test.describe("Text Differencing", () => {
    // Test relies on attribute order for simpler assertions. Thus,
    // the test is especially not suitable for more complex attribute
    // sets.
    for (const { id, type, text } of differencingScenario.textCases) {
      test(`XDiff Augmentation should be available in editing view: ${type}`, async ({ page }) => {
        await openStory(page, storyId(id));
        const editable = editor(page);

        // Validate Data-Processing
        await expect.poll(() => dataView(page)).toContain(text);

        // Validate Editing Downcast
        // If this fails due to order of attributes, expectations have to be
        // refactored, e.g., using a structural match.
        await expect.poll(() => editable.innerHTML()).toContain(text);
      });
    }

    test("All xdiff:span Attributes should be forwarded from data to editing view", async ({ page }) => {
      const { id, text, conflictChangesText, changeCount } = differencingScenario.allAttributes;
      await openStory(page, storyId(id));
      const editable = editor(page);

      // Validate Data-Processing
      await expect.poll(() => dataView(page)).toContain(text);

      // Validate Editing Downcast
      const xdiffSpans = editable.locator("xdiff\\:span");
      await expect(xdiffSpans).toHaveCount(changeCount);

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
      const { id, text, expectedDifferenceInEditingView } = differencingScenario.falsePositiveNewline;
      await openStory(page, storyId(id));
      const editable = editor(page);

      await expect.poll(() => dataView(page)).toContain(text);

      // The difference and especially the whitespace within the last
      // xdiff:span should be kept as is.
      await expect.poll(() => editable.innerHTML()).toContain(expectedDifferenceInEditingView);
    });

    // This behavior is required to ease CSS styling of added/removed/... newlines.
    test("Added newline should pass to editing view as empty element", async ({ page }) => {
      const { id, dataProcessedText, dataProcessedDifference } = differencingScenario.addedNewline;
      await openStory(page, storyId(id));
      const editable = editor(page);

      // Validate Data-Processing
      // To differentiate from 'added whitespace' characters, we replace this
      // xdiff:span from data by some other artificial element (xdiff:br), which
      // is visible in data view as well as later in editing view.
      await expect.poll(() => dataView(page)).toContain(dataProcessedText);

      // Validate Editing Downcast
      // Here, it is important, that no filler element got added to the xdiff:span.
      await expect.poll(() => editable.innerHTML()).toContain(dataProcessedDifference);
    });
  });

  test.describe("Image Differencing", () => {
    test("img Element Augmentation by xdiff:changetype should be passed to editing view", async ({ page }) => {
      const { id, changes } = differencingScenario.image;
      await openStory(page, storyId(id));
      const editable = editor(page);

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
