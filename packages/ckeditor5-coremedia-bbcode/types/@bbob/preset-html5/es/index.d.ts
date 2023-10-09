import type { createPreset } from "@bbob/preset/es";

declare module "@bbob/preset-html5/es" {
  // eslint-disable-next-line @typescript-eslint/ban-types
  export default ReturnType<typeof createPreset>;
}
