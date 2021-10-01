import Emitter from "../../ckeditor__ckeditor5-utils/src/emittermixin";
import Observable from "../../ckeditor__ckeditor5-utils/src/observablemixin";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

export default class Widget extends Plugin implements Emitter, Observable {
}
