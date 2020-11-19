export default interface FontMapper {
  matches(fontFamilyStyle: string): boolean;
  toEscapedHtml(toMap:string): string;
}
