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

  dataTransfer: DataTransfer | null;
}

interface CMDragData {
  contents: CMBeanReference[];
  content: CMBeanReference[];
}

interface CMBeanReference {
  $Ref: string;
}

export default DragDropService;
export { CMDragData, CMBeanReference };
