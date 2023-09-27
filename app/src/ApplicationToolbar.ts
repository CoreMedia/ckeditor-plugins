export const defaultApplicationToolbarId = "applicationToolbar";

export interface ApplicationToolbarConfig {
  /**
   * ID of toolbar button to add the preview button to.
   * Defaults to: `applicationToolbar`.
   */
  toolbarId?: string;
}

export const requireApplicationToolbar = (config?: ApplicationToolbarConfig): HTMLElement => {
  const { toolbarId = defaultApplicationToolbarId} = config ?? {};
  const toolbar = document.getElementById(toolbarId);

  if (!toolbar) {
    throw new Error(`Cannot find toolbar element having ID  "${toolbarId}".`);
  }

  return toolbar;
};
