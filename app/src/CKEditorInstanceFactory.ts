import { ClassicEditor } from "ckeditor5";
import { ApplicationState } from "./ApplicationState";

export type CKEditorInstanceFactory = (sourceElement: HTMLElement, state: ApplicationState) => Promise<ClassicEditor>;
