import { normalizeToHash } from "../src/Normalizers";

describe("Normalizers", () => {
  describe("normalizeToHash()", () => {
    const processed: string[] = [];
    // see https://mathiasbynens.be/notes/javascript-unicode
    // see https://dmitripavlutin.com/what-every-javascript-developer-should-know-about-unicode/
    test.each`
      value
      ${""}
      ${"Lorem"}
      ${"lorem"}
      ${"ipsum"}
      ${"I \u{2661} Hashes!"}
      ${"I \u{1F4A9} Hashes!"}
      ${"Unicode Plane 0: \u{0000} to \u{FFFF}"}
      ${"Unicode Plane 1: \u{10000} to \u{1FFFF}"}
      ${"Unicode Plane 2: \u{20000} to \u{2FFFF}"}
      ${"Unicode Plane 3: \u{30000} to \u{3FFFF}"}
      ${"Unicode Plane 4: \u{40000} to \u{4FFFF}"}
      ${"Unicode Plane 5: \u{50000} to \u{5FFFF}"}
      ${"Unicode Plane 6: \u{60000} to \u{6FFFF}"}
      ${"Unicode Plane 7: \u{70000} to \u{7FFFF}"}
      ${"Unicode Plane 8: \u{80000} to \u{8FFFF}"}
      ${"Unicode Plane 9: \u{90000} to \u{9FFFF}"}
      ${"Unicode Plane 10: \u{A0000} to \u{AFFFF}"}
      ${"Unicode Plane 11: \u{B0000} to \u{BFFFF}"}
      ${"Unicode Plane 12: \u{C0000} to \u{CFFFF}"}
      ${"Unicode Plane 13: \u{D0000} to \u{DFFFF}"}
      ${"Unicode Plane 14: \u{E0000} to \u{EFFFF}"}
      ${"Unicode Plane 15: \u{F0000} to \u{FFFFF}"}
      ${"Unicode Plane 16: \u{100000} to \u{10FFFF}"}
    `("[$#] Value '$value' should only have hash equal to itself.", ({ value }) => {
      const normalized = normalizeToHash(value);
      expect(normalized).toStrictEqual(normalizeToHash(value));
      processed.forEach((p) => expect(normalized).not.toEqual(normalizeToHash(p)));
      processed.push(value);
    });
  });
});
