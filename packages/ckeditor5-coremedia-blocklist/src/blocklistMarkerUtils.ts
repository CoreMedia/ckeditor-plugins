import { uid } from "ckeditor5";
export interface MarkerDetails {
  id: string;
  blockedWord: string | undefined;
}

/**
 * Maps from marker id to the blocked word.
 */
const markerIdToBlockedWordMap = new Map<string, string>();

/**
 * Creates a marker name in the format `blockedWord:${markerId}` and stores
 * the blocked word in a map where the key is the marker id.
 * The marker id is generated using {@link uid}.
 *
 * @param blockedWord - the blocked word to store in for the generated id.
 */
export const createMarkerNameAndStoreWord = (blockedWord: string): string => {
  const markerId = uid();
  markerIdToBlockedWordMap.set(markerId, blockedWord);
  return `blockedWord:${markerId}`;
};

/**
 * Returns the blocked word for a given marker name.
 * The marker name must be in the format `blockedWord:${markerId}`.
 *
 * @param markerName - the marker name in the format `blockedWord:${markerId}`
 */
export const getMarkerDetails = (markerName: string): MarkerDetails => {
  const id = getMarkerId(markerName);
  const blockedWord = markerIdToBlockedWordMap.get(id);
  return {
    id,
    blockedWord,
  };
};

/**
 * Removes the blocked word for a given marker name from the map.
 * The marker name must be in the format `blockedWord:${markerId}`.
 *
 * @param markerName - the marker name in the format `blockedWord:${markerId}`
 */
export const removeMarkerDetails = (markerName: string): void => {
  const id = getMarkerId(markerName);
  markerIdToBlockedWordMap.delete(id);
};

/**
 * Extracts the id from the given marker name.
 *
 * @param markerName - the marker name
 * @private
 */
const getMarkerId = (markerName: string): string => {
  const [, id] = markerName.split(":");
  return id;
};
