import { Observable } from "rxjs";
import ClipboardItemRepresentation from "./ClipboardItemRepresentation";

/**
 * Copied from CoreMedia Studio.
 */
abstract class ClipboardService {
  abstract setItems(items: ClipboardItemRepresentation[], timestamp: number): Promise<void>;

  abstract getItems(): Promise<ClipboardItemRepresentation[]>;

  abstract observe_items(): Observable<ClipboardItemRepresentation[]>;
}

export default ClipboardService;
