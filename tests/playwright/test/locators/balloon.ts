import type { Page } from "playwright-core";
import { BalloonPanelViewWrapper } from "../wrappers/BalloonPanelViewWrapper";
import { fromLocator, type Locatable } from "./Locatable";

/**
 * Locator-based entry to CKEditor's body collection (panels, balloons, icons),
 * which CKEditor renders detached from the editor element under
 * `.ck-body-wrapper`.
 *
 * This replaces the former handle-based `BodyCollectionWrapper` as the root of
 * the pure locator-based view-wrapper chain, so balloon/link/blocklist view
 * wrappers can be used without any `JSHandle`.
 *
 * @param page - Playwright page
 */
export const bodyCollection = (page: Page): Locatable => fromLocator(page.locator(".ck-body-wrapper"));

/**
 * Locator-based access to the balloon panel view and its nested views
 * (link toolbar/form, content link, blocklist actions).
 *
 * @param page - Playwright page
 */
export const balloonPanel = (page: Page): BalloonPanelViewWrapper =>
  BalloonPanelViewWrapper.fromParent(bodyCollection(page));
