import RichtextConfigurationService from "@coremedia/coremedia-studio-integration/src/content/RichtextConfigurationService";
import { Observable } from "rxjs";

class MockRichtextConfigurationService implements RichtextConfigurationService {
  /**
   * A content id is linkable if
   * <ul>
   * <li>it is not a folder (even number)</li>
   * <li>it is not dividable by 4. This represents any content which is not linkable.</li>
   * </ul>
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
        //folder
        resolve(false);
      }
    });
  }

  isEmbeddableType(uripath: string): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      resolve(true);
    });
  }

  getName(): string {
    return "mockRichtextConfigurationService";
  }
}
export default MockRichtextConfigurationService;
