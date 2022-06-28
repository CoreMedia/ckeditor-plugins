import { Normalizer } from "./DataDiffer";

/**
 * Transforms the given string into a hash.
 *
 * @param value - value to calculate hash for
 * @see [Generate a Hash from string in JavaScript – Mr Nhat's Blog](https://blog.trannhat.xyz/generate-a-hash-from-string-in-javascript/)
 */
export const normalizeToHash: Normalizer = (value: string): string => {
  const hash = value.split("").reduce((a, b): number => {
    const h = (a << 5) - a + b.charCodeAt(0);
    return h & h;
  }, 0);
  return `${hash}`;
};
