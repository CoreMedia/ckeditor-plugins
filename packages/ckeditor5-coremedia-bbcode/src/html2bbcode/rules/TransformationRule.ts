import { TaggedElement } from "./TaggedElement";

export type TransformationRule = (element: TaggedElement, content: string) => string;
