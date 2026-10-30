import { Buffer } from "node:buffer";
import { transform } from "lightningcss";

/**
 * Webpack loader transforming CSS with Lightning CSS (e.g., flattening CSS
 * nesting and minifying). Replaces the loader formerly provided by
 * `@ckeditor/ckeditor5-dev-utils`.
 *
 * @this {import("webpack").LoaderContext<{ lightningCssOptions?: object }>}
 */
export default function lightningCssLoader(source, map) {
  try {
    const { lightningCssOptions = {} } = this.getOptions();
    const inputSourceMap = typeof map === "string" ? map : map ? JSON.stringify(map) : undefined;
    const result = transform({
      ...lightningCssOptions,
      filename: this.resourcePath,
      code: Buffer.from(source),
      inputSourceMap,
    });
    const sourceMap = result.map ? JSON.parse(Buffer.from(result.map).toString()) : undefined;
    this.callback(null, Buffer.from(result.code).toString(), sourceMap);
  } catch (error) {
    this.callback(error instanceof Error ? error : new Error(String(error)));
  }
}
