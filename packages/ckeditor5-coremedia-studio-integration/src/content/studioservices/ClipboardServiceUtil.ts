import ClipboardItemRepresentation from "./ClipboardItemRepresentation";
import { parseBeanReferences } from "../BeanReference";

/**
 * Extracts content uris from the given ClipboardItemRepresentations.
 * This implementation depend on the implementation in Studio.
 *
 * @param items - The items to convert to content uris.
 * @returns the content uris.
 */
export async function toContentUris(items: ClipboardItemRepresentation[]): Promise<string[]> {
  const beanReferencesAsStrings: string[] = await Promise.all(
    items.map((item) => item.data["cm/uri-list"]).map(async (blob) => blob.text())
  );
  return beanReferencesAsStrings
    .map((references) => {
      const parsedReferences = parseBeanReferences(references);
      return parsedReferences ? parsedReferences.filter((reference) => !!reference) : [];
    })
    .flat()
    .map((reference) => reference.$Ref);
}
