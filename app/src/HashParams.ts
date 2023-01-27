export const hashParamRegExp = /([^=]*)=(.*)/;

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
