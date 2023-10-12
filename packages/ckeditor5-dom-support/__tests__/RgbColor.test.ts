import { RgbColor, rgb } from "../src/RgbColor";

describe("RgbColor", () => {
  describe("RgbColor.tryParse", () => {
    it.each`
      rgb                     | expected              | comment
      ${""}                   | ${undefined}          | ${"empty string not considered valid"}
      ${"rgb(1,2,3)"}         | ${rgb(1, 2, 3)}       | ${"rgb without spacing"}
      ${"rgb( 1 , 2 , 3 )"}   | ${rgb(1, 2, 3)}       | ${"rgb with spacing"}
      ${"rgb(0, 0, 0)"}       | ${rgb(0, 0, 0)}       | ${"rgb all lower bound"}
      ${"rgb(255, 255, 255)"} | ${rgb(255, 255, 255)} | ${"rgb all upper bound"}
      ${"rgb(-1, 0, 0)"}      | ${undefined}          | ${"red below lower bound"}
      ${"rgb(256, 0, 0)"}     | ${undefined}          | ${"red exceeds upper bound"}
      ${"rgb(0.2, 0, 0)"}     | ${undefined}          | ${"red must not be floating"}
      ${"rgb(0, -1, 0)"}      | ${undefined}          | ${"green below lower bound"}
      ${"rgb(0, 256, 0)"}     | ${undefined}          | ${"green exceeds upper bound"}
      ${"rgb(0, 0.2, 0)"}     | ${undefined}          | ${"green must not be floating"}
      ${"rgb(0, 0, -1)"}      | ${undefined}          | ${"blue below lower bound"}
      ${"rgb(0, 0, 256)"}     | ${undefined}          | ${"blue exceeds upper bound"}
      ${"rgb(0, 0, 0.2)"}     | ${undefined}          | ${"blue must not be floating"}
      ${"rgb(1,2,3,0,-0.1)"}  | ${undefined}          | ${"alpha below lower bound"}
      ${"rgb(1,2,3,0)"}       | ${rgb(1, 2, 3, 0)}    | ${"alpha lower bound"}
      ${"rgb(1,2,3,1)"}       | ${rgb(1, 2, 3, 1)}    | ${"alpha upper bound"}
      ${"rgb(1,2,3,1.1)"}     | ${undefined}          | ${"alpha above upper bound"}
    `(
      "[$#] Should parse '$rgb' to $expected ($comment)",
      ({ rgb: rgbString, expected }: { rgb: string; expected: RgbColor | undefined }) => {
        const actual = RgbColor.tryParseRgb(rgbString);
        if (!expected) {
          expect(actual).toBeUndefined();
        } else {
          expect(actual).toMatchObject(expected);
        }
      },
    );
  });

  describe("Hexadecimal Representation", () => {
    describe("RgbColor.hex", () => {
      it.each`
        rgb                          | expected     | comment
        ${rgb(1, 2, 3)}              | ${"#010203"} | ${""}
        ${rgb(0, 0, 0)}              | ${"#000000"} | ${""}
        ${rgb(255, 255, 255)}        | ${"#ffffff"} | ${""}
        ${rgb(127, 127, 127)}        | ${"#7f7f7f"} | ${""}
        ${rgb(128, 128, 128)}        | ${"#808080"} | ${""}
        ${rgb(128, 128, 128, 0)}     | ${"#808080"} | ${"should ignore alpha"}
        ${rgb(128, 128, 128, 1)}     | ${"#808080"} | ${"should ignore alpha"}
        ${rgb(128, 128, 128, 0.255)} | ${"#808080"} | ${"should ignore alpha"}
      `(
        "[$#] Should represent $rgb as hex: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.hex).toStrictEqual(expected);
        },
      );
    });

    describe("RgbColor.hexa", () => {
      it.each`
        rgb                          | expected       | comment
        ${rgb(1, 2, 3)}              | ${"#010203ff"} | ${"should default to alpha = 1.0 (=#255 = #xFF)"}
        ${rgb(0, 0, 0)}              | ${"#000000ff"} | ${"should default to alpha = 1.0 (=#255 = #xFF)"}
        ${rgb(255, 255, 255)}        | ${"#ffffffff"} | ${"should default to alpha = 1.0 (=#255 = #xFF)"}
        ${rgb(127, 127, 127)}        | ${"#7f7f7fff"} | ${"should default to alpha = 1.0 (=#255 = #xFF)"}
        ${rgb(128, 128, 128)}        | ${"#808080ff"} | ${"should default to alpha = 1.0 (=#255 = #xFF)"}
        ${rgb(128, 128, 128, 0)}     | ${"#80808000"} | ${""}
        ${rgb(128, 128, 128, 1)}     | ${"#808080ff"} | ${""}
        ${rgb(128, 128, 128, 0.255)} | ${"#80808041"} | ${""}
      `(
        "[$#] Should represent $rgb as hex: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.hexa).toStrictEqual(expected);
        },
      );
    });

    describe("RgbColor.toHex", () => {
      it.each`
        rgb                          | expected       | comment
        ${rgb(1, 2, 3)}              | ${"#010203"}   | ${""}
        ${rgb(0, 0, 0)}              | ${"#000000"}   | ${""}
        ${rgb(255, 255, 255)}        | ${"#ffffff"}   | ${""}
        ${rgb(127, 127, 127)}        | ${"#7f7f7f"}   | ${""}
        ${rgb(128, 128, 128)}        | ${"#808080"}   | ${""}
        ${rgb(128, 128, 128, 0)}     | ${"#80808000"} | ${"transparently add alpha (here: 0.0 = 00)"}
        ${rgb(128, 128, 128, 1)}     | ${"#808080ff"} | ${"transparently add alpha (here: 1.0 = 255)"}
        ${rgb(128, 128, 128, 0.255)} | ${"#80808041"} | ${"transparently add alpha (here: 1.0 = 255)"}
      `("[$#] Should represent $rgb as hex: $expected", ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
        expect(rgb.toHex()).toStrictEqual(expected);
      });
    });
  });

  describe("RGB Representation", () => {
    describe("RgbColor.rgb", () => {
      it.each`
        rgb                        | expected              | comment
        ${rgb(1, 2, 3)}            | ${"rgb(1,2,3)"}       | ${""}
        ${rgb(0, 0, 0)}            | ${"rgb(0,0,0)"}       | ${""}
        ${rgb(255, 255, 255)}      | ${"rgb(255,255,255)"} | ${""}
        ${rgb(127, 127, 127)}      | ${"rgb(127,127,127)"} | ${""}
        ${rgb(128, 128, 128)}      | ${"rgb(128,128,128)"} | ${""}
        ${rgb(128, 128, 128, 0)}   | ${"rgb(128,128,128)"} | ${"should ignore alpha"}
        ${rgb(128, 128, 128, 1)}   | ${"rgb(128,128,128)"} | ${"should ignore alpha"}
        ${rgb(128, 128, 128, 0.5)} | ${"rgb(128,128,128)"} | ${"should ignore alpha"}
      `(
        "[$#] Should represent $rgb as RGB: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.rgb).toStrictEqual(expected);
        },
      );
    });

    describe("RgbColor.rgba", () => {
      it.each`
        rgb                        | expected                   | comment
        ${rgb(1, 2, 3)}            | ${"rgba(1,2,3,1)"}         | ${"should add default alpha 1.0"}
        ${rgb(0, 0, 0)}            | ${"rgba(0,0,0,1)"}         | ${"should add default alpha 1.0"}
        ${rgb(255, 255, 255)}      | ${"rgba(255,255,255,1)"}   | ${"should add default alpha 1.0"}
        ${rgb(127, 127, 127)}      | ${"rgba(127,127,127,1)"}   | ${"should add default alpha 1.0"}
        ${rgb(128, 128, 128)}      | ${"rgba(128,128,128,1)"}   | ${"should add default alpha 1.0"}
        ${rgb(128, 128, 128, 0)}   | ${"rgba(128,128,128,0)"}   | ${""}
        ${rgb(128, 128, 128, 1)}   | ${"rgba(128,128,128,1)"}   | ${""}
        ${rgb(128, 128, 128, 0.5)} | ${"rgba(128,128,128,0.5)"} | ${""}
      `(
        "[$#] Should represent $rgb as RGB: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.rgba).toStrictEqual(expected);
        },
      );
    });

    describe("RgbColor.toRgb", () => {
      it.each`
        rgb                        | expected                   | comment
        ${rgb(1, 2, 3)}            | ${"rgb(1,2,3)"}            | ${""}
        ${rgb(0, 0, 0)}            | ${"rgb(0,0,0)"}            | ${""}
        ${rgb(255, 255, 255)}      | ${"rgb(255,255,255)"}      | ${""}
        ${rgb(127, 127, 127)}      | ${"rgb(127,127,127)"}      | ${""}
        ${rgb(128, 128, 128)}      | ${"rgb(128,128,128)"}      | ${""}
        ${rgb(128, 128, 128, 0)}   | ${"rgba(128,128,128,0)"}   | ${"transparently add alpha"}
        ${rgb(128, 128, 128, 1)}   | ${"rgba(128,128,128,1)"}   | ${"transparently add alpha"}
        ${rgb(128, 128, 128, 0.5)} | ${"rgba(128,128,128,0.5)"} | ${"transparently add alpha"}
      `(
        "[$#] Should represent $rgb as RGB: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.toRgb()).toStrictEqual(expected);
        },
      );
    });
  });

  describe("Color Name Representation", () => {
    describe("RgbColor.colorName", () => {
      it.each`
        rgb                          | expected     | comment
        ${rgb(1, 2, 3)}              | ${undefined} | ${"no pre-defined W3C color"}
        ${rgb(0, 0, 0)}              | ${"black"}   | ${""}
        ${rgb(255, 255, 255)}        | ${"white"}   | ${""}
        ${rgb(128, 128, 128)}        | ${"gray"}    | ${""}
        ${rgb(128, 128, 128, 0)}     | ${undefined} | ${"no name if alpha is set"}
        ${rgb(128, 128, 128, 1)}     | ${"gray"}    | ${"ignore alpha, if opaque"}
        ${rgb(128, 128, 128, 0.255)} | ${undefined} | ${"no name if alpha is set"}
      `(
        "[$#] Should represent $rgb as color name: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.colorName).toStrictEqual(expected);
        },
      );
    });

    describe("RgbColor.toColorNameOrHex", () => {
      it.each`
        rgb                          | expected       | comment
        ${rgb(1, 2, 3)}              | ${"#010203"}   | ${"fall-back to hex for unknown name"}
        ${rgb(0, 0, 0)}              | ${"black"}     | ${""}
        ${rgb(255, 255, 255)}        | ${"white"}     | ${""}
        ${rgb(128, 128, 128)}        | ${"gray"}      | ${""}
        ${rgb(128, 128, 128, 0)}     | ${"#80808000"} | ${"no name if alpha is set"}
        ${rgb(128, 128, 128, 1)}     | ${"gray"}      | ${"ignore alpha, if opaque"}
        ${rgb(128, 128, 128, 0.255)} | ${"#80808041"} | ${"no name if alpha is set"}
      `(
        "[$#] Should represent $rgb as preferred color name: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: string }) => {
          expect(rgb.toColorNameOrHex()).toStrictEqual(expected);
        },
      );
    });
  });

  describe("Alpha Handling", () => {
    describe("hasAlpha", () => {
      it.each`
        rgb                  | expected
        ${rgb(1, 2, 3)}      | ${false}
        ${rgb(1, 2, 3, 0)}   | ${true}
        ${rgb(1, 2, 3, 0.5)} | ${true}
        ${rgb(1, 2, 3, 1)}   | ${true}
      `(
        "[$#] Should signal for $rgb if alpha is set: $expected",
        ({ rgb, expected }: { rgb: RgbColor; expected: boolean }) => {
          expect(rgb.hasAlpha).toStrictEqual(expected);
        },
      );
    });

    describe("alpha", () => {
      it.each`
        rgb                     | expected     | comment
        ${rgb(1, 2, 3)}         | ${undefined} | ${""}
        ${rgb(1, 2, 3, 0)}      | ${0}         | ${""}
        ${rgb(1, 2, 3, 0.5)}    | ${0.5}       | ${""}
        ${rgb(1, 2, 3, 1)}      | ${1}         | ${""}
        ${rgb(1, 2, 3, 0.123)}  | ${0.123}     | ${""}
        ${rgb(1, 2, 3, 0.1234)} | ${0.123}     | ${"should limit to 3 digits after dot (similar precision as in browsers)"}
        ${rgb(1, 2, 3, 0.1236)} | ${0.123}     | ${"should limit to 3 digits after dot (floor)"}
      `(
        "[$#] Should expose alpha for $rgb as: $expected ($comment)",
        ({ rgb, expected }: { rgb: RgbColor; expected: number }) => {
          expect(rgb.alpha).toStrictEqual(expected);
        },
      );
    });
  });
});
