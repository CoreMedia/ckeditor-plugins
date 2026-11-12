import type { Observable } from "rxjs";
import type ClipboardItemRepresentation from "./ClipboardItemRepresentation";

/**
 * Service for base Studio Clipboard functionality to be registered with the
 * `serviceAgent`.
 *
 * Studio does not use the system clipboard but an own implementation of a Clipboard.
 * This Clipboard can be accessed by using this service.
 *
 * @see serviceAgent
 */
abstract class ClipboardService {
  /**
   * Write items to the Clipboard
   *
   * @param items
   * @param timestamp
   */
  abstract setItems(items: ClipboardItemRepresentation[], timestamp: number): Promise<void>;

  /**
   * Returns the items currently in the Clipboard or an empty array if nothing is copied yet.
   *
   * @returns Array<ClipboardItemRepresentation>
   */
  abstract getItems(): Promise<ClipboardItemRepresentation[]>;

  /**
   * Observe the Clipboard
   */
  abstract observe_items(): Observable<ClipboardItemRepresentation[]>;
}

export default ClipboardService;
