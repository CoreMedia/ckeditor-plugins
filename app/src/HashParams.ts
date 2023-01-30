/**
 * Regular expression to split up hash parameters similar to query parameters,
 * thus, having a name and a value.
 */
export const hashParamRegExp = /([^=]*)=(.*)/;

/**
 * Get hash parameter value from `window.location`.
 *
 * @param key - hash parameter key
 */
export const getHashParam = (key: string | undefined): string | boolean => {
  // Check for `window`: Required when used from within Jest tests, where
  // 'jsdom' is not available.
  if (key === undefined || typeof window === "undefined") {
    return false;
  }
  if (window.location?.hash) {
    // substring: Remove hash
    const hash: string = window.location.hash.substring(1);
    const hashParams: string[] = hash.split(/&/);
    for (const hashParam of hashParams) {
      if (key === hashParam) {
        return true;
      }
      const paramMatch: RegExpExecArray | null = hashParamRegExp.exec(hashParam);
      if (paramMatch) {
        if (paramMatch[1] === key) {
          // Map empty String to truthy value.
          return paramMatch[2] || true;
        }
      }
    }
  }
  return false;
};
