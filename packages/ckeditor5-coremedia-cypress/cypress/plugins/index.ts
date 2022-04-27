/// <reference types="cypress" />

import PluginConfig = Cypress.PluginConfig;
import PluginEvents = Cypress.PluginEvents;
import PluginConfigOptions = Cypress.PluginConfigOptions;
// @ts-ignore: Typings not available
import { initPlugin } from "cypress-plugin-snapshots/plugin";

const myConfig: PluginConfig = (on: PluginEvents, config: PluginConfigOptions): PluginConfigOptions => {
  initPlugin(on, config);
  return config;
};

export default myConfig;
