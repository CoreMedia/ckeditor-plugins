import { nsRichText, onDemandNamespaces, xmlDeclaration } from "./Namespaces";

export const heading = (text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1): string => `<p class="p--heading-${level}">${text}</p>`;

export const h1 = (text: string): string => heading(text, 1);
export const h2 = (text: string): string => heading(text, 1);
export const h3 = (text: string): string => heading(text, 1);
export const h4 = (text: string): string => heading(text, 1);
export const h5 = (text: string): string => heading(text, 1);
export const h6 = (text: string): string => heading(text, 1);

export const strong = (text: string): string => `<strong>${text}</strong>`;
export const em = (text: string): string => `<em>${text}</em>`;
export const p = (text: string): string => `<p>${text}</p>`;

export const sectionHeading = (text: string): string => p(strong(text));

/**
 * Wraps XML by corresponding `<div>` as used in CoreMedia RichText.
 * Required namespaces are dynamically added.
 *
 * Note, that this method is meant for test-purpose only! For adding
 * required namespaces, only a rough check is applied, not suitable for
 * production scenarios.
 *
 * @param innerXml - the XML to wrap into `<div>`.
 * @param addXmlDeclaration - if to add the XML declaration with UTF-8 encoding)
 * in front.
 */
export const wrapRichText = (innerXml: string, addXmlDeclaration = true): string => {
  let result = "";
  if (addXmlDeclaration) {
    result += xmlDeclaration;
  }
  result += `<div xmlns="${nsRichText.uri}"`;
  onDemandNamespaces.forEach((namespace) => {
    if (innerXml.includes(`${namespace.name}:`)) {
      result += ` xmlns:${namespace.name}="${namespace.uri}"`;
    }
  });
  result += `>${innerXml}</div>`;
  return result;
};
