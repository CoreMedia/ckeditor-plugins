/**
 * This module declaration is needed in order to import svg files into typeScript modules.
 */
declare module "*.svg" {
  const content: string;
  export default content;
}
