import type { ServiceObject } from "@coremedia/service-agent";

/**
 * TODO: interface is copied from Studio and means we have a circular dependency as ckeditor provides interfaces but also now studio provides interfaces for ckeditor. We have to take a decision how to resolve this.
 *
 *
 * Provides the {@link DragDropService.dragData} and {@link DragDropService.dragGroups} of the current
 * drag operation.
 *
 * The service is only meant to be registered if a drag operation is performed.
 * After finishing or aborting the drag operation the service must be unregistered.
 */
interface DragDropService extends ServiceObject {
  dragGroups: string;

  dragData: string;
}

interface CMDragData {
  contents: Array<CMBeanReference>;
  content: Array<CMBeanReference>;
}

interface CMBeanReference {
  $Ref: string;
}
export default DragDropService;
export { CMDragData, CMBeanReference };
