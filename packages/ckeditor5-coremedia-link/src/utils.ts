import { View, Observable, PriorityString, Emitter } from "ckeditor5";

/**
 * Adds a CSS class, or an array of CSS classes to a view template.
 * Only works if done prior to rendering the view.
 *
 * @param view - the view with the element the class should be added to
 * @param classNames - a classname or an array of classname strings
 */
export const addClassToTemplate = (view: View, classNames: string[] | string): void => {
  const { template } = view;
  const attributes = template?.attributes;
  // .includes below does not work with AttributeValues type. unknown[] is enough here for us.
  const classes: unknown[] = attributes?.class ?? [];
  if (!Array.isArray(classNames)) {
    classNames = [classNames];
  }
  classNames.forEach((className) => {
    if (!classes.includes(className)) {
      classes.push(className);
    }
  });
};

/**
 * Removes a CSS class, or an array of CSS classes from a view template.
 * Only works if done prior to rendering the view.
 *
 * @param view - the view with the element the class should be removed from
 * @param classNames - a classname or an array of classname strings
 */
export const removeClassFromTemplate = (view: View, classNames: string[] | string): void => {
  const { template } = view;
  const attributes = template?.attributes;
  // The array operations below do not work with AttributeValues type.
  // `unknown[]` is enough here for us.
  const classes: unknown[] = attributes?.class ?? [];
  if (!Array.isArray(classNames)) {
    classNames = [classNames];
  }
  classNames.forEach((className) => {
    const index = classes.indexOf(className);
    if (index > -1) {
      classes.splice(index, 1);
    }
  });
};

/**
 * Adds a CSS class, or an array of CSS classes to a view's element.
 * Only works if the view has already been rendered.
 *
 * @param view - the view with the element the class should be added to
 * @param classNames - a classname or an array of classname strings
 */
export const addClass = (view: View, classNames: string[] | string): void => {
  if (!view.element) {
    return;
  }
  if (!Array.isArray(classNames)) {
    classNames = [classNames];
  }
  view.element.classList.add(classNames.join());
};

/**
 * Removes a CSS class, or an array of CSS classes from a view's element.
 * Only works if the view has already been rendered.
 *
 * @param view - the view with the element the class should be removed from
 * @param classNames - a classname or an array of classname strings
 */
export const removeClass = (view: View, classNames: string[] | string): void => {
  if (!view.element) {
    return;
  }
  if (!Array.isArray(classNames)) {
    classNames = [classNames];
  }
  view.element.classList.remove(classNames.join());
};

/**
 * A utility function to transform methods of observable CKEditor components into events to listen to.
 * This way, we can hook into function calls in other plugins. This is done by using CKEditor's decorate API.
 *
 * @param methodParentCmp - the component, holding the method to be transformed
 * @param methodName - the name of the method that should be transformed
 * @param callback - a callback to be executed when the event is fired
 * @param listenerCmp - the class that should listen to the event (probably "this")
 * @param options - (optional) options object for listener priority
 */

export const createDecoratorHook = <O extends Observable>(
  methodParentCmp: O,
  methodName: keyof O & string,
  callback: () => void,
  listenerCmp: Emitter,
  options?: {
    priority?: number | PriorityString;
  },
): void => {
  if (!isDecorated(methodParentCmp, methodName)) {
    methodParentCmp.decorate(methodName);
    if (!isDecorated(methodParentCmp, methodName)) {
      console.warn(
        `createDecoratorHook: Issues while decorating ${methodName}. CKEditor may have changed its internal API around Emitter Mixin. Detection for _is decorated_ needs to be adapted.`,
      );
    }
  }
  listenerCmp.listenTo(methodParentCmp, methodName, callback, options);
};

/**
 * When decorating, the internal `_events` property gets set, that we use here.
 * See `Observable.decorate()` and `getEvents` in Emitter Mixin.
 */
interface EmitterInternal {
  _events: Record<string, unknown>;
}
const isEmitterInternal = (observable: object): observable is EmitterInternal => {
  if ("_events" in observable) {
    return typeof observable._events === "object";
  }
  return false;
};
const isDecorated = (observable: Observable, methodName: string): boolean =>
  isEmitterInternal(observable) && observable._events.hasOwnProperty(methodName);
