/**
 * The representation of an item returned of the ClipboardService.
 */
export default interface ClipboardItemRepresentation {
  data: Record<string, Blob>;
  options: unknown;
}
