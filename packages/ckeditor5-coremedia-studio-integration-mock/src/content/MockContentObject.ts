/**
 * Represents an object having an ID.
 */
import { isObject } from "./MockContentUtils";

export default interface MockContentObject {
  /**
   * Numeric ID of the content.
   */
  id: number;
}

/**
 * Type-Guard for `MockContentObject`.
 */
export const isMockContentObject = (instance: unknown): instance is MockContentObject =>
  isObject(instance) && instance.hasOwnProperty("id") && typeof instance.id === "number";
