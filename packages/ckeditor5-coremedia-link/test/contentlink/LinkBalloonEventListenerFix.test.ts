import { afterEach, beforeEach, describe, it } from "node:test";
import { expect } from "expect";
import type { LinkUI } from "ckeditor5";
import { addMouseEventListenerToHideDialog } from "../../src/contentlink/LinkBalloonEventListenerFix";

type DomListener = (evt: unknown, domEvt: Event) => void;

/**
 * Stand-in for the `LinkUI` internals the click-outside handler relies on.
 * `formView` only has to provide `listenTo` for DOM events.
 */
interface LinkUIStub {
  formView: { listenTo: (target: EventTarget, eventName: string, callback: DomListener) => void };
  _balloon: { view: { element: HTMLElement } };
  _hideUI: () => void;
  _isUIInPanel: boolean;
}

interface Fixture {
  linkUI: LinkUIStub;
  balloon: HTMLElement;
  hideUICalls: () => number;
  dispose: () => void;
}

const createFixture = (): Fixture => {
  const removers: (() => void)[] = [];
  let hideUICalls = 0;
  const balloon = document.createElement("div");
  document.body.appendChild(balloon);
  const linkUI: LinkUIStub = {
    formView: {
      listenTo: (target, eventName, callback) => {
        const listener = (domEvt: Event): void => callback({}, domEvt);
        target.addEventListener(eventName, listener);
        removers.push(() => target.removeEventListener(eventName, listener));
      },
    },
    _balloon: { view: { element: balloon } },
    _hideUI: () => {
      hideUICalls++;
    },
    _isUIInPanel: true,
  };
  addMouseEventListenerToHideDialog(linkUI as unknown as LinkUI);
  return {
    linkUI,
    balloon,
    hideUICalls: () => hideUICalls,
    dispose: () => removers.forEach((remove) => remove()),
  };
};

/**
 * Creates an editor element with a child element to click on, either in the
 * light DOM or inside an open shadow root.
 */
const createEditorChild = ({ inShadowRoot }: { inShadowRoot: boolean }): HTMLElement => {
  const editor = document.createElement("div");
  editor.classList.add("ck-editor");
  const child = document.createElement("span");
  editor.appendChild(child);
  if (inShadowRoot) {
    const shadowHost = document.createElement("div");
    shadowHost.attachShadow({ mode: "open" }).appendChild(editor);
    document.body.appendChild(shadowHost);
  } else {
    document.body.appendChild(editor);
  }
  return child;
};

const createElement = ({ draggable = false }: { draggable?: boolean } = {}): HTMLElement => {
  const element = document.createElement("div");
  element.draggable = draggable;
  document.body.appendChild(element);
  return element;
};

const dispatch = (target: Element, type: "mousedown" | "click"): void => {
  target.dispatchEvent(new MouseEvent(type, { bubbles: true, composed: true }));
};

void describe("LinkBalloonEventListenerFix", () => {
  void describe("addMouseEventListenerToHideDialog", () => {
    let fixture: Fixture;

    beforeEach(() => {
      fixture = createFixture();
    });

    afterEach(() => {
      fixture.dispose();
      document.body.replaceChildren();
    });

    void describe("mousedown", () => {
      void it("should hide the balloon on mousedown outside of the balloon", () => {
        dispatch(createElement(), "mousedown");

        expect(fixture.hideUICalls()).toBe(1);
      });

      void it("should keep the balloon open on mousedown inside the balloon", () => {
        const child = document.createElement("span");
        fixture.balloon.appendChild(child);

        dispatch(child, "mousedown");

        expect(fixture.hideUICalls()).toBe(0);
      });

      void it("should keep the balloon open on mousedown on a draggable outside any editor", () => {
        dispatch(createElement({ draggable: true }), "mousedown");

        expect(fixture.hideUICalls()).toBe(0);
      });

      void it("should hide the balloon on mousedown on a draggable inside an editor", () => {
        const draggable = createEditorChild({ inShadowRoot: false });
        draggable.draggable = true;

        dispatch(draggable, "mousedown");

        expect(fixture.hideUICalls()).toBe(1);
      });

      void it("should ignore mousedown while the balloon is not shown", () => {
        fixture.linkUI._isUIInPanel = false;

        dispatch(createElement(), "mousedown");

        expect(fixture.hideUICalls()).toBe(0);
      });
    });

    void describe("click", () => {
      void it("should hide the balloon on click outside of the balloon and any editor", () => {
        dispatch(createElement(), "click");

        expect(fixture.hideUICalls()).toBe(1);
      });

      void it("should keep the balloon open on click inside the balloon", () => {
        const child = document.createElement("span");
        fixture.balloon.appendChild(child);

        dispatch(child, "click");

        expect(fixture.hideUICalls()).toBe(0);
      });

      void it("should keep the balloon open on click into an editor", () => {
        dispatch(createEditorChild({ inShadowRoot: false }), "click");

        expect(fixture.hideUICalls()).toBe(0);
      });

      void it("should keep the balloon open on click into an editor in a shadow root", () => {
        dispatch(createEditorChild({ inShadowRoot: true }), "click");

        expect(fixture.hideUICalls()).toBe(0);
      });

      void it("should ignore click while the balloon is not shown", () => {
        fixture.linkUI._isUIInPanel = false;

        dispatch(createElement(), "click");

        expect(fixture.hideUICalls()).toBe(0);
      });
    });
  });
});
