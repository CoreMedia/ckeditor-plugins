import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

/**
 * Prefix for issues triggered by Data Processor.
 */
export const DATA_PROCESSOR_ISSUE_PREFIX = "DP";

/**
 * Used for general issues in data-processing.
 */
export const DP_GENERAL = `${DATA_PROCESSOR_ISSUE_PREFIX}#0001`;

/**
 * Used for detected ambiguous states regarding element mapping.
 */
export const DP_AMBIGUOUS_ELEMENT_STATE = `${DATA_PROCESSOR_ISSUE_PREFIX}#0002`;

/**
 * Used for detected ambiguous states regarding attribute mapping.
 */
export const DP_AMBIGUOUS_ATTRIBUTE_STATE = `${DATA_PROCESSOR_ISSUE_PREFIX}#0003`;

const RULES_LOGGER_NAME = "Rules";

/**
 * Logger for rules.
 */
export const rulesLogger: Logger = LoggerProvider.getLogger(RULES_LOGGER_NAME);

/**
 * Triggers a warning on an ambiguous element state.
 *
 * @param msg - details on ambiguous state
 * @param data - more data to apply
 */
export const warnOnAmbiguousElementState = (msg: string, ...data: unknown[]) => {
  rulesLogger.warn(`${DP_AMBIGUOUS_ELEMENT_STATE} - Ambiguous Element State: ${msg}`, ...data);
};

/**
 * Triggers a warning on an ambiguous attribute state.
 *
 * @param msg - details on ambiguous state
 * @param data - more data to apply
 */
export const warnOnAmbiguousAttributeState = (msg: string, ...data: unknown[]) => {
  rulesLogger.warn(`${DP_AMBIGUOUS_ATTRIBUTE_STATE} - Ambiguous Attribute State: ${msg}`, ...data);
};
