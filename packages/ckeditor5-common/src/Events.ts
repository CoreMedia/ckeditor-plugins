import EventInfo from "@ckeditor/ckeditor5-utils/src/eventinfo";

/**
 * Disables the event by making sure no other listeners are executed
 * and setting the return value to false
 *
 * @param evt - event information
 */
export const forceDisable = (evt: EventInfo): void => {
  evt.return = false;
  evt.stop();
};
