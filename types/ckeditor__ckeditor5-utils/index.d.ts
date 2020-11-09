// See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ckeditor__ckeditor5-utils/index.d.ts

export interface Emitter {
}

export interface Observable extends Emitter {
  on(event: string, callback: Function, options?: {priority: PriorityString | number}): void;
}

export namespace priorities {
  function get(priority: PriorityString | number): number;
}

export type PriorityString = "highest" | "high" | "normal" | "low" | "lowest";
