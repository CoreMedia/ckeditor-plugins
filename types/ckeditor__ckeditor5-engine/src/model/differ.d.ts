import Range from "./range";
import Operation from "./operation/operation";
import Position from "./position";
import MarkerCollection from "./markercollection";

/**
 * Calculates the difference between two model states.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_differ-Differ.html">Class Differ (engine/model/differ~Differ) - CKEditor 5 API docs</a>
 */
export default class Differ {
  constructor(markerCollection: MarkerCollection);

  get isEmpty(): boolean;

  bufferMarkerChange(markerName: string, oldRange: Range | null, newRange: Range | null, affectsData: boolean): void;

  bufferOperation(operation: Operation): void;

  getChangedMarkers(): { name: string; data: { oldRange: Range; newRange: Range; }; }[];

  getChanges(options?: { includeChangesInGraveyard: boolean; }): DiffItem[];

  getMarkersToAdd(): { name: string; range: Range; }[];

  getMarkersToRemove(): { name: string; range: Range; }[];

  hasDataChanges(): boolean;

  reset(): void;
}

export interface DiffItem {
  type: "insert" | "remove" | "attribute";
}

export class DiffItemInsert implements DiffItem {
  get length(): number;

  get name(): string;

  get position(): Position;

  get type(): "insert";
}

export class DiffItemRemove implements DiffItem {
  get length(): number;

  get name(): string;

  get position(): Position;

  get type(): "remove";
}

export class DiffItemAttribute implements DiffItem {
  get attributeKey(): string;

  get attributeNewValue(): string;

  get attributeOldValue(): string;

  get range(): Range;

  get type(): "attribute";
}
