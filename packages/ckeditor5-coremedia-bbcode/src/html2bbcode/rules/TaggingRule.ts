import { TaggedElement } from "./TaggedElement";

export type TaggingRule = (element: TaggedElement) => void;
