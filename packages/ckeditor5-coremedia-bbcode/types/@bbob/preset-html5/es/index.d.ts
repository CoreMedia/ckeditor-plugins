import type { createPreset } from "@bbob/preset/es";

declare module "@bbob/preset-html5/es" {
  // eslint-disable-next-line @typescript-eslint/ban-types
  declare const html5Preset: ReturnType<typeof createPreset>;
  export default html5Preset;
}
