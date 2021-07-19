import DragDropService from "@coremedia/coremedia-studio-integration/dist/content/studioservices/DragDropService";

class MockDragDropService implements DragDropService {
  getName(): string {
    return "dragDropService";
  }

  dragData!: string;
  dragGroups!: string;
}

export default MockDragDropService;
