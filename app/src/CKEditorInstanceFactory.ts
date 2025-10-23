import type { ClassicEditor } from "ckeditor5";
import type { ApplicationState } from "./ApplicationState";

export type CKEditorInstanceFactory = (sourceElement: HTMLElement, state: ApplicationState) => Promise<ClassicEditor>;
