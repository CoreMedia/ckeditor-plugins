/**
 * Blob and content-name fixtures now live in the shared constants package
 * (`@coremedia/ckeditor5-itest-constants`) so the Storybook stories and these
 * Playwright tests reference the same literals. Re-exported here to keep the
 * existing `./MockFixtures` import paths working.
 */
export {
  PNG_RED_10x10,
  PNG_RED_240x135,
  PNG_GREEN_10x10,
  PNG_GREEN_240x135,
  PNG_BLUE_10x10,
  PNG_BLUE_240x135,
  PNG_GRAY_10x10,
  PNG_LOCK_24x24,
  PNG_EMPTY_24x24,
  CONTENT_NAME_CHALLENGE_ENTITIES,
  CONTENT_NAME_CHALLENGE_CHARSETS,
  CONTENT_NAME_CHALLENGE_RTL,
  CONTENT_NAME_CHALLENGE_XSS,
  CONTENT_NAME_CHALLENGE_LENGTH,
} from "@coremedia/ckeditor5-itest-constants";
