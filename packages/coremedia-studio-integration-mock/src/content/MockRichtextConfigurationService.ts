import RichtextConfigurationService
  from "@coremedia/coremedia-studio-integration/src/content/RichtextConfigurationService";

class MockRichtextConfigurationService implements RichtextConfigurationService {
  /**
   * A content id is linkable if
   * * it is not a folder (even number)
   * * it is not dividable by 4. This represents any content which is not linkable.
   *
   * @param uripath an uripath in the format 'content/content-id'
   */
  hasLinkableType(uripath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (!uripath.startsWith("content/")) {
        resolve(false);
        return;
      }
      const contentIdString: string = uripath.replace("content/", "");
      const contentId: number = parseInt(contentIdString);
      if (contentId % 4 === 0) {
        //not linkable content
        resolve(false);
        return;
      }

      if (contentId % 2 === 0) {
        //linkable content
        resolve(true);
      } else {
        // Folder
        // For testing reasons, we want to allow the root folder to be dropped.
        resolve(contentId === 1);
      }
    });
  }

  isEmbeddableType(uripath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(true);
    });
  }

  getName(): string {
    return "richtextConfigurationService";
  }
}

/**
 * Configuration for ID generation.
 */
interface DroppableConfig {
  /**
   * `true` signals, that the content may not be dropped. `false` signals,
   * that the content may not be dropped.
   *
   * Ignored for folders, which are all assumed to be undroppable (despite
   * the root-folder for testing reasons).
   *
   * Defaults to `false`.
   */
  undroppable?: boolean;
}

/**
 * Modifies the given contentId, so that it signals droppable or undroppable
 * state. contentIds for folders are not modified.
 *
 * @param contentId content ID to possibly adapt
 * @param undroppable if to provide an undroppable (= `true`) or droppable ID (= `false`)
 */
const applyDroppable = (contentId: number, undroppable: boolean): number => {
  if (contentId % 2 === 1) {
    // We don't mangle with folders, they are all (but one) assumed to be
    // non-droppable.
    return contentId;
  }
  const initialUndroppableState = contentId % 4 === 0;
  if (initialUndroppableState === undroppable) {
    // We don't need to change anything.
    return contentId;
  }
  const lastDigit = contentId % 10;
  return contentId - lastDigit + (undroppable ? 4 : 2);
};

export default MockRichtextConfigurationService;
export { applyDroppable, DroppableConfig };
