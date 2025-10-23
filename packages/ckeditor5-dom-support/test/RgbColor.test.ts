import test, { describe } from "node:test";
import expect from "expect";
import { RgbColor, rgb } from "../src/RgbColor";

void describe("RgbColor", () => {
  void describe("RgbColor.tryParse", () => {
    const rgbTests: { rgb: string; expected: RgbColor | undefined; comment: string }[] = [
      { rgb: "", expected: undefined, comment: "empty string not considered valid" },
      { rgb: "rgb(1,2,3)", expected: rgb(1, 2, 3), comment: "rgb without spacing" },
      { rgb: "rgb( 1 , 2 , 3 )", expected: rgb(1, 2, 3), comment: "rgb with spacing" },
      { rgb: "rgb(0, 0, 0)", expected: rgb(0, 0, 0), comment: "rgb all lower bound" },
      { rgb: "rgb(255, 255, 255)", expected: rgb(255, 255, 255), comment: "rgb all upper bound" },
      { rgb: "rgb(-1, 0, 0)", expected: undefined, comment: "red below lower bound" },
      { rgb: "rgb(256, 0, 0)", expected: undefined, comment: "red exceeds upper bound" },
      { rgb: "rgb(0.2, 0, 0)", expected: undefined, comment: "red must not be floating" },
      { rgb: "rgb(0, -1, 0)", expected: undefined, comment: "green below lower bound" },
      { rgb: "rgb(0, 256, 0)", expected: undefined, comment: "green exceeds upper bound" },
      { rgb: "rgb(0, 0.2, 0)", expected: undefined, comment: "green must not be floating" },
      { rgb: "rgb(0, 0, -1)", expected: undefined, comment: "blue below lower bound" },
      { rgb: "rgb(0, 0, 256)", expected: undefined, comment: "blue exceeds upper bound" },
      { rgb: "rgb(0, 0, 0.2)", expected: undefined, comment: "blue must not be floating" },
      { rgb: "rgb(1,2,3,0,-0.1)", expected: undefined, comment: "alpha below lower bound" },
      { rgb: "rgb(1,2,3,0)", expected: rgb(1, 2, 3, 0), comment: "alpha lower bound" },
      { rgb: "rgb(1,2,3,1)", expected: rgb(1, 2, 3, 1), comment: "alpha upper bound" },
      { rgb: "rgb(1,2,3,1.1)", expected: undefined, comment: "alpha above upper bound" },
    ];

    for (const [i, { rgb: rgbString, expected, comment }] of rgbTests.entries()) {
      void test(`[${i}] Should parse '${rgbString}' to ${expected} (${comment})`, () => {
        const actual = RgbColor.tryParseRgb(rgbString);
        if (!expected) {
          expect(actual).toBeUndefined();
        } else {
          expect(actual?.toHex()).toStrictEqual(expected.toHex());
        }
      });
    }
  });

  void describe("Hexadecimal Representation", () => {
    void describe("RgbColor.hex", () => {
      const data = [
        { rgb: rgb(1, 2, 3), expected: "#010203", comment: "" },
        { rgb: rgb(0, 0, 0), expected: "#000000", comment: "" },
        { rgb: rgb(255, 255, 255), expected: "#ffffff", comment: "" },
        { rgb: rgb(127, 127, 127), expected: "#7f7f7f", comment: "" },
        { rgb: rgb(128, 128, 128), expected: "#808080", comment: "" },
        { rgb: rgb(128, 128, 128, 0), expected: "#808080", comment: "should ignore alpha" },
        { rgb: rgb(128, 128, 128, 1), expected: "#808080", comment: "should ignore alpha" },
        { rgb: rgb(128, 128, 128, 0.255), expected: "#808080", comment: "should ignore alpha" },
      ];

      for (const [i, { rgb, expected, comment }] of data.entries()) {
        void test(`[${i}] Should represent ${JSON.stringify(rgb)} as hex: ${expected} (${comment})`, () => {
          expect(rgb.hex).toStrictEqual(expected);
        });
      }
    });

    void describe("RgbColor.hexa", () => {
      const data = [
        { rgb: rgb(1, 2, 3), expected: "#010203ff", comment: "should default to alpha = 1.0 (=#255 = #xFF)" },
        { rgb: rgb(0, 0, 0), expected: "#000000ff", comment: "should default to alpha = 1.0 (=#255 = #xFF)" },
        { rgb: rgb(255, 255, 255), expected: "#ffffffff", comment: "should default to alpha = 1.0 (=#255 = #xFF)" },
        { rgb: rgb(127, 127, 127), expected: "#7f7f7fff", comment: "should default to alpha = 1.0 (=#255 = #xFF)" },
        { rgb: rgb(128, 128, 128), expected: "#808080ff", comment: "should default to alpha = 1.0 (=#255 = #xFF)" },
        { rgb: rgb(128, 128, 128, 0), expected: "#80808000", comment: "" },
        { rgb: rgb(128, 128, 128, 1), expected: "#808080ff", comment: "" },
        { rgb: rgb(128, 128, 128, 0.255), expected: "#80808041", comment: "" },
      ];

      for (const [i, { rgb, expected, comment }] of data.entries()) {
        void test(`[${i}] Should represent ${JSON.stringify(rgb)} as hex: ${expected} (${comment})`, () => {
          expect(rgb.hexa).toStrictEqual(expected);
        });
      }
    });

    void describe("RgbColor.toHex", () => {
      const testData = [
        { rgb: rgb(1, 2, 3), expected: "#010203", comment: "" },
        { rgb: rgb(0, 0, 0), expected: "#000000", comment: "" },
        { rgb: rgb(255, 255, 255), expected: "#ffffff", comment: "" },
        { rgb: rgb(127, 127, 127), expected: "#7f7f7f", comment: "" },
        { rgb: rgb(128, 128, 128), expected: "#808080", comment: "" },
        { rgb: rgb(128, 128, 128, 0), expected: "#80808000", comment: "transparently add alpha (here: 0.0 = 00)" },
        { rgb: rgb(128, 128, 128, 1), expected: "#808080ff", comment: "transparently add alpha (here: 1.0 = 255)" },
        { rgb: rgb(128, 128, 128, 0.255), expected: "#80808041", comment: "transparently add alpha (here: 1.0 = 255)" },
      ];

      for (const [i, { rgb, expected, comment }] of testData.entries()) {
        void test(`[${i}] Should represent ${rgb} as hex: ${expected} (${comment})`, () => {
          expect(rgb.toHex()).toStrictEqual(expected);
        });
      }
    });
  });

  void describe("RGB Representation", () => {
    void describe("RgbColor.rgb", () => {
      const rgbTests = [
        { rgb: rgb(1, 2, 3), expected: "rgb(1,2,3)", comment: "" },
        { rgb: rgb(0, 0, 0), expected: "rgb(0,0,0)", comment: "" },
        { rgb: rgb(255, 255, 255), expected: "rgb(255,255,255)", comment: "" },
        { rgb: rgb(127, 127, 127), expected: "rgb(127,127,127)", comment: "" },
        { rgb: rgb(128, 128, 128), expected: "rgb(128,128,128)", comment: "" },
        { rgb: rgb(128, 128, 128, 0), expected: "rgb(128,128,128)", comment: "should ignore alpha" },
        { rgb: rgb(128, 128, 128, 1), expected: "rgb(128,128,128)", comment: "should ignore alpha" },
        { rgb: rgb(128, 128, 128, 0.5), expected: "rgb(128,128,128)", comment: "should ignore alpha" },
      ];

      for (const [i, { rgb, expected, comment }] of rgbTests.entries()) {
        void test(`[${i}] Should represent ${rgb} as RGB: ${expected} (${comment})`, () => {
          expect(rgb.rgb).toStrictEqual(expected);
        });
      }
    });

    void describe("RgbColor.rgba", () => {
      const rgbaTests = [
        { rgb: rgb(1, 2, 3), expected: "rgba(1,2,3,1)", comment: "should add default alpha 1.0" },
        { rgb: rgb(0, 0, 0), expected: "rgba(0,0,0,1)", comment: "should add default alpha 1.0" },
        { rgb: rgb(255, 255, 255), expected: "rgba(255,255,255,1)", comment: "should add default alpha 1.0" },
        { rgb: rgb(127, 127, 127), expected: "rgba(127,127,127,1)", comment: "should add default alpha 1.0" },
        { rgb: rgb(128, 128, 128), expected: "rgba(128,128,128,1)", comment: "should add default alpha 1.0" },
        { rgb: rgb(128, 128, 128, 0), expected: "rgba(128,128,128,0)", comment: "" },
        { rgb: rgb(128, 128, 128, 1), expected: "rgba(128,128,128,1)", comment: "" },
        { rgb: rgb(128, 128, 128, 0.5), expected: "rgba(128,128,128,0.5)", comment: "" },
      ];

      for (const [i, { rgb, expected, comment }] of rgbaTests.entries()) {
        void test(`[${i}] Should represent ${rgb} as RGBA: ${expected} (${comment})`, () => {
          expect(rgb.rgba).toStrictEqual(expected);
        });
      }
    });

    void describe("RgbColor.toRgb", () => {
      const rgbTests = [
        { rgb: rgb(1, 2, 3), expected: "rgb(1,2,3)", comment: "" },
        { rgb: rgb(0, 0, 0), expected: "rgb(0,0,0)", comment: "" },
        { rgb: rgb(255, 255, 255), expected: "rgb(255,255,255)", comment: "" },
        { rgb: rgb(127, 127, 127), expected: "rgb(127,127,127)", comment: "" },
        { rgb: rgb(128, 128, 128), expected: "rgb(128,128,128)", comment: "" },
        { rgb: rgb(128, 128, 128, 0), expected: "rgba(128,128,128,0)", comment: "transparently add alpha" },
        { rgb: rgb(128, 128, 128, 1), expected: "rgba(128,128,128,1)", comment: "transparently add alpha" },
        { rgb: rgb(128, 128, 128, 0.5), expected: "rgba(128,128,128,0.5)", comment: "transparently add alpha" },
      ];

      for (const [i, { rgb, expected, comment }] of rgbTests.entries()) {
        void test(`[${i}] Should represent ${rgb} as RGB: ${expected} (${comment})`, () => {
          expect(rgb.toRgb()).toStrictEqual(expected);
        });
      }
    });
  });

  void describe("Color Name Representation", () => {
    void describe("RgbColor.colorName", () => {
      const colorNameTests = [
        { rgb: rgb(1, 2, 3), expected: undefined, comment: "no pre-defined W3C color" },
        { rgb: rgb(0, 0, 0), expected: "black", comment: "" },
        { rgb: rgb(255, 255, 255), expected: "white", comment: "" },
        { rgb: rgb(128, 128, 128), expected: "gray", comment: "" },
        { rgb: rgb(128, 128, 128, 0), expected: undefined, comment: "no name if alpha is set" },
        { rgb: rgb(128, 128, 128, 1), expected: "gray", comment: "ignore alpha, if opaque" },
        { rgb: rgb(128, 128, 128, 0.255), expected: undefined, comment: "no name if alpha is set" },
      ];

      for (const [i, { rgb, expected, comment }] of colorNameTests.entries()) {
        void test(`[${i}] Should represent ${rgb} as color name: ${expected} (${comment})`, () => {
          expect(rgb.colorName).toStrictEqual(expected);
        });
      }
    });

    void describe("RgbColor.toColorNameOrHex", () => {
      const preferredColorTests = [
        { rgb: rgb(1, 2, 3), expected: "#010203", comment: "fall-back to hex for unknown name" },
        { rgb: rgb(0, 0, 0), expected: "black", comment: "" },
        { rgb: rgb(255, 255, 255), expected: "white", comment: "" },
        { rgb: rgb(128, 128, 128), expected: "gray", comment: "" },
        { rgb: rgb(128, 128, 128, 0), expected: "#80808000", comment: "no name if alpha is set" },
        { rgb: rgb(128, 128, 128, 1), expected: "gray", comment: "ignore alpha, if opaque" },
        { rgb: rgb(128, 128, 128, 0.255), expected: "#80808041", comment: "no name if alpha is set" },
      ];

      for (const [i, { rgb, expected, comment }] of preferredColorTests.entries()) {
        void test(`[${i}] Should represent ${rgb} as preferred color name: ${expected} (${comment})`, () => {
          expect(rgb.toColorNameOrHex()).toStrictEqual(expected);
        });
      }
    });
  });

  void describe("Alpha Handling", () => {
    void describe("hasAlpha", () => {
      const alphaTests = [
        { rgb: rgb(1, 2, 3), expected: false },
        { rgb: rgb(1, 2, 3, 0), expected: true },
        { rgb: rgb(1, 2, 3, 0.5), expected: true },
        { rgb: rgb(1, 2, 3, 1), expected: true },
      ];

      for (const [i, { rgb, expected }] of alphaTests.entries()) {
        void test(`[${i}] Should signal for ${rgb} if alpha is set: ${expected}`, () => {
          expect(rgb.hasAlpha).toStrictEqual(expected);
        });
      }
    });

    void describe("alpha", () => {
      const alphaValueTests = [
        { rgb: rgb(1, 2, 3), expected: undefined, comment: "" },
        { rgb: rgb(1, 2, 3, 0), expected: 0, comment: "" },
        { rgb: rgb(1, 2, 3, 0.5), expected: 0.5, comment: "" },
        { rgb: rgb(1, 2, 3, 1), expected: 1, comment: "" },
        { rgb: rgb(1, 2, 3, 0.123), expected: 0.123, comment: "" },
        {
          rgb: rgb(1, 2, 3, 0.1234),
          expected: 0.123,
          comment: "should limit to 3 digits after dot (similar precision as in browsers)",
        },
        { rgb: rgb(1, 2, 3, 0.1236), expected: 0.123, comment: "should limit to 3 digits after dot (floor)" },
      ];

      for (const [i, { rgb, expected, comment }] of alphaValueTests.entries()) {
        void test(`[${i}] Should expose alpha for ${rgb} as: ${expected} (${comment})`, () => {
          expect(rgb.alpha).toStrictEqual(expected);
        });
      }
    });
  });
});
