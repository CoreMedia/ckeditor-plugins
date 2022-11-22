/**
 * Subsequent actions to take after processing a node.
 */
export const subsequentActions = ["default", "skipChildren"];

/**
 * Subsequent action to take.
 */
export type SubsequentAction = typeof subsequentActions[number];
