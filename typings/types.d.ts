declare module "*.svg";

declare module "*.css";

/**
 * Style sheet imported as source text (webpack `asset/source`), for example to
 * adopt it into a shadow root as a constructed style sheet.
 */
declare module "*.css?raw" {
  const content: string;
  export default content;
}
