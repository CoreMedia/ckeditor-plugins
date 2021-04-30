import LiveRange from "./liverange";
import Position from "./position";
import Range from "./range";

/**
 * The collection of all {@link module:engine/model/markercollection~Marker markers} attached to the document.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_markercollection-MarkerCollection.html">Class MarkerCollection (engine/model/markercollection~MarkerCollection) - CKEditor 5 API docs</a>
 */
export default class MarkerCollection {
  constructor();

  [Symbol.iterator](): Iterable<Marker>;

  destroy(): void;

  get(markerName: string): Marker | null;

  getMarkersAtPosition(position: Position): Iterable<Marker>;

  getMarkersGroup(prefix: string): Iterable<Marker>;

  getMarkersIntersectingRange(range: Range): Iterable<Marker>;

  has(markerName: string): any;
}

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_markercollection-Marker.html">Class Marker (engine/model/markercollection~Marker) - CKEditor 5 API docs</a>
 */
export class Marker {

  get affectsData(): boolean;

  get managedUsingOperations(): boolean;

  get name(): string;

  constructor(name: string, liveRange: LiveRange, managedUsingOperations: boolean, affectsData: boolean);

  getEnd(): Position;

  getRange(): Range;

  getStart(): Position;

  is(type: string): boolean;
}
