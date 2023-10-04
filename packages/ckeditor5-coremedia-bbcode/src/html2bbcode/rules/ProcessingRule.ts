import { TaggedElement } from "./TaggedElement";

export type ProcessingRule = (element: TaggedElement) => void;
