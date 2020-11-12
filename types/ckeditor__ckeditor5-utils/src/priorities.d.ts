
export namespace priorities {
  function get(priority: PriorityString | number): number;
}

export type PriorityString = "highest" | "high" | "normal" | "low" | "lowest";
