import { escapeFontFamily } from "../src/FontReplacer";

it.each([
  [",Symbol", "Symbol"],
  ["Symbol", "Symbol"],
  ["Georgia, serif", "Georgia"],
  ['"Gill Sans Extrabold", sans-serif', "Gill Sans Extrabold"],
  ["sans-serif", "sans-serif"],
  [" cursive", "cursive"],
  ["system-ui ,serif", "system-ui"],
])(
  "Should '%s' parse to the first font-family '%s' without leading and trailing special characters.",
  (input: string, expected: string) => {
    const actual = escapeFontFamily(input);
    expect(actual).toBe(expected);
  }
);
