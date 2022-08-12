/**
 * Simulates a blob reference to some property named `data`.
 *
 * @param id - numeric id of the document the property is contained in
 */
export const blobReference = (id: number) => `content/${id}#properties.data`;
