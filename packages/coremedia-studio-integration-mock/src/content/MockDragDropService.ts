import DragDropService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/DragDropService";

class MockDragDropService implements DragDropService {
  getName(): string {
    return "dragDropService";
  }

  dragData!: string;
  dragGroups!: string;
}

export default MockDragDropService;
