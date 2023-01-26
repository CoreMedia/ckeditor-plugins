/**
 * Provides the {@link DragDropService.dragData} and {@link DragDropService.dragGroups} of the current
 * drag operation.
 *
 * The service is only meant to be registered if a drag operation is performed.
 * After finishing or aborting the drag operation the service must be unregistered.
 */
interface DragDropService {
  dragGroups: string;

  dragData: string;

  dataTransferItems: string | undefined;
}

export default DragDropService;
