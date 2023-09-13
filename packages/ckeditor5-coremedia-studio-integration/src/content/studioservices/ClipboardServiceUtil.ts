import ClipboardItemRepresentation from "./ClipboardItemRepresentation";

/**
 * Extracts content uris from the given ClipboardItemRepresentations.
 * This implementation depend on the implementation in Studio.
 *
 * @param items - The items to convert to content uris.
 * @returns the content uris.
 */
export async function toContentUris(items: ClipboardItemRepresentation[]): Promise<string[]> {
  // blob.text() returns an Array of a json. The JSON is an Array of uris.
  // We have to parse the arrays and put them in one flat array.
  const jsonUriArrays: string[] = await Promise.all(
    items.map((item) => item.data["cm-studio-rest/uri-list"]).map(async (blob) => blob.text()),
  );
  const arrayOfUriArrays = jsonUriArrays.map((value): string[] => JSON.parse(value) as string[]);
  return arrayOfUriArrays.flat();
}
