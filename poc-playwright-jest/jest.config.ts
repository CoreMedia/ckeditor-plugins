import type {Config} from '@jest/types';

export default async (): Promise<Config.InitialOptions> => {
  return {
    verbose: true,
    preset: 'jest-playwright-preset',
    moduleFileExtensions: ["ts", "tsx", "d.ts", "js", "jsx"],
  };
};
