/**
 * Defines delayed behavior.
 */
import type RequiredFrom from "./RequiredFrom";
import { withDefaults } from "./RequiredFrom";

interface Delayed {
  /**
   * Defines the initial delay to load a content or a property value.
   */
  initialDelayMs: number;
  /**
   * The delay between each change. 0 or below will do changes only once
   * and then end (with change delay of 1 ms in this case).
   */
  changeDelayMs: number;
}

/**
 * Delay behavior for configuration.
 */
type DelayedConfig = Partial<Delayed>;

/**
 * Default delay to apply, if unset.
 */
const DelayedDefaults: Delayed = {
  /**
   * Defaults to `0` (zero) for no delay but immediate behavior.
   */
  initialDelayMs: 0,
  /**
   * Defaults to `1` (one) to grant at least a minimal delay.
   */
  changeDelayMs: 1,
};

/**
 * Adds delay defaults to the given configuration, if not set yet.
 *
 * @param config - configuration to add delay defaults to.
 */
const withDelayDefaults = <T extends DelayedConfig>(config: T): RequiredFrom<T, Delayed> =>
  withDefaults(config, DelayedDefaults);

export default Delayed;
export type { DelayedConfig };
export { DelayedDefaults, withDelayDefaults };
