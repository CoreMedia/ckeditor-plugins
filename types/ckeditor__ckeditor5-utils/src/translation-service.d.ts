/**
 * The internationalization message interface. A message that implements this interface can be passed to the t() function to be translated to the target UI language.
 */
export interface Message {
  id?: string;
  plural?: string;
  string: string;
}
