import View from "@ckeditor/ckeditor5-ui/src/view";
import { Observable } from "@ckeditor/ckeditor5-utils/src/observablemixin";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { Emitter } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import TemplateIfBinding from "@ckeditor/ckeditor5-ui/src/template/templateifbinding";

/**
 * Adds a CSS class, or an array of CSS classes to a view template.
 * Only works if done prior to rendering the view.
 *
 * @param view - the view with the element the class should be added to
 * @param classNames - a classname or an array of classname strings
 */
export const addClassToTemplate = (view: View, classNames: string[] | string): void => {
  const classes: Array<string | TemplateIfBinding> = view.template.attributes.class;
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
  const classes: Array<string | TemplateIfBinding> = view.template.attributes.class;
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

export const createDecoratorHook = (
  methodParentCmp: Observable,
  methodName: string,
  callback: () => void,
  listenerCmp: Emitter,
  options?: { priority?: number | PriorityString }
): void => {
  if (
    !(methodParentCmp as DecorableCmp)["_events"] ||
    !(methodParentCmp as DecorableCmp)["_events"].hasOwnProperty(methodName)
  ) {
    methodParentCmp.decorate(methodName);
  }

  listenerCmp.listenTo(methodParentCmp, methodName, callback, options);
};

interface DecorableCmp extends Observable {
  _events: Array<unknown>;
}
