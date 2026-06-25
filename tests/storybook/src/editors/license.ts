/**
 * License key for the CKEditor 5 instances used in stories. The value is
 * injected at build time via the Storybook webpack `DefinePlugin`
 * (see `.storybook/main.ts`), mirroring the former application build
 * (`app/webpack.config.js`). Use `GPL` (or a valid commercial key) through the
 * `CKEDITOR_LICENSE_KEY` environment variable / repository `.env` file.
 */
declare const CKEDITOR_LICENSE_KEY: string | undefined;

export const licenseKeyErrorMessage =
  "Please provide a valid license key for your CKEditor5 instance. Please create a .env file in the workspace root and make your license as CKEDITOR_LICENSE_KEY variable. Please use 'GPL' if you want to use the GNU General Public License.";

/**
 * Resolved CKEditor 5 license key, replaced during the Storybook build.
 */
export const licenseKey: string | undefined =
  typeof CKEDITOR_LICENSE_KEY === "undefined" ? undefined : CKEDITOR_LICENSE_KEY;
