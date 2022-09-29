import DragDropService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/DragDropService";

/**
 * MockDragDropService for the example app.
 *
 * The original DragDropService only provides two properties which are written on drag and drop.
 * To simulate the behavior without a dependency this service provides the same attributes.
 */
class MockDragDropService implements DragDropService {
  getName(): string {
    return "dragDropService";
  }

  dragData!: string;
  dragGroups!: string;
}

export default MockDragDropService;
