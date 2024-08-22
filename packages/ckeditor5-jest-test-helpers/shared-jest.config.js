module.exports = {
  testEnvironment: require.resolve("jest-environment-jsdom"),
  // Don't detect utility files as tests, i.e. require `test` in name.
  testMatch: ["**/?(*.)+(test).[jt]s?(x)"],
  moduleFileExtensions: ["js", "ts", "d.ts"],
  moduleNameMapper: {
    // https://www.npmjs.com/package/jest-transform-stub
    "^.+\\.(css|less|sass|scss|gif|png|jpg|ttf|eot|woff|woff2|svg)$": require.resolve("jest-transform-stub"),
    // https://stackoverflow.com/questions/76608600/jest-tests-are-failing-because-of-an-unknown-unexpected-token-export
    "^blurhash": require.resolve("blurhash"),
  },
  preset: "ts-jest/presets/default-esm",
  transform: {
    "^.+.tsx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: ["node_modules/.pnpm/(?!@bbob|lodash-es|rxjs|vanilla-colorful)"],
};
