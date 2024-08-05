import { ApplicationState } from "./ApplicationState";
import { ClassicEditor } from "ckeditor5";
export type CKEditorInstanceFactory = (sourceElement: HTMLElement, state: ApplicationState) => Promise<ClassicEditor>;
