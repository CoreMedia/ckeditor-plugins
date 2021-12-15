/**
 * While `MatcherPattern` allows for example defining a regular expression for
 * matching classes, we are only interested in allowing or disallowing classes
 * in general in the context of General RichText Support (GRS).
 */
type ClassesType = boolean;

/**
 * While `MatcherPattern` has a rich set of possible types for the
 * `arguments` entry, we are especially interested in allowing or disallowing
 * an attribute and to possibly restrict its value to a set of values
 * defined by the DTD. Such as the `dir` attribute may only hold values
 * `ltr` and `rtl`.
 */
type AttributesType = Record<string, string | RegExp | boolean | number>;

/**
 * While the `MatcherPattern` is rather complex, we only want to support a
 * subset in this configuration, which eases merging patterns a lot.
 */
type ReducedMatcherPattern = {
  classes?: ClassesType;
  attributes?: AttributesType;
};

/**
 * Merges MatcherPatterns (of specific object type).
 *
 * @param sources sources to merge
 * @throws Error when sources define the same attribute with different supported values
 */
const mergePatterns = (...sources: ReducedMatcherPattern[]): ReducedMatcherPattern => {
  const result: ReducedMatcherPattern = {};
  const supportsClasses = sources.find((s) => s.classes === true);
  if (supportsClasses) {
    result.classes = true;
  }
  sources.forEach((s) => {
    if (s.attributes) {
      result.attributes = result.attributes || {};
      for (const key in s.attributes) {
        if (result.attributes?.hasOwnProperty(key) && result.attributes[key] !== s.attributes[key]) {
          throw new Error("Failed to merge, because sources collide in attributes.");
        }
        result.attributes[key] = s.attributes[key];
      }
    }
  });
  return result;
};

export default ReducedMatcherPattern;
export { mergePatterns };
