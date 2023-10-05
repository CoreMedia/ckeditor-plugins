/**
 * Utility type to mark selected properties as required.
 */
export type RequireSelected<T, K extends keyof T = keyof T> = T & {
  [P in K]-?: T[P];
};
