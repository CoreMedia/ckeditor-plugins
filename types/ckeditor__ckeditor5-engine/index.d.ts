// DefinitelyTypes Reference: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ckeditor__ckeditor5-engine/index.d.ts

import * as utils from "@ckeditor/ckeditor5-utils";

export namespace controller {
  class EditingController implements  utils.Emitter, utils.Observable {
    readonly view: view.View;

    constructor(model: model.Model);

    on(event: string, callback: Function, options?: { priority: utils.PriorityString | number }): void;
  }
}

export namespace model {
  class Model implements utils.Emitter, utils.Observable {
    on(event: string, callback: Function, options?: { priority: utils.PriorityString | number }): void;
  }
}

export namespace view {
  namespace observer {
    /**
     * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_observer_domeventdata-DomEventData.html">Class DomEventData (engine/view/observer/domeventdata~DomEventData) - CKEditor 5 API docs</a>
     */
    class DomEventData {
    }
  }

  /**
   * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_document-Document.html">Class Document (engine/view/document~Document) - CKEditor 5 API docs</a>
   */
  class Document {
  }

  /**
   * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_view-View.html">Class View (engine/view/view~View) - CKEditor 5 API docs</a>
   */
  class View implements utils.Emitter, utils.Observable {
    readonly document: Document;

    on(event: string, callback: Function, options?: { priority: utils.PriorityString | number }): void;
  }
}
