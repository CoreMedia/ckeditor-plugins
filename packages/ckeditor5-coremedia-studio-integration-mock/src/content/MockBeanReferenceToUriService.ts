import { BeanReferenceToUriService } from "@coremedia/ckeditor5-coremedia-studio-integration/content/BeanReferenceToUriService";
import { CMBeanReference } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/DragDropService";

export class MockBeanReferenceToUriService implements BeanReferenceToUriService {
  resolveUris(beanReferences: string): Promise<string[]> {
    const dragData: CMBeanReference[] | null = JSON.parse(beanReferences) as CMBeanReference[];
    if (!dragData) {
      return Promise.resolve([]);
    }

    return Promise.resolve(dragData.map((value) => value.$Ref));
  }
}
