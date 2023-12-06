import { ApplicationState } from "./ApplicationState";
import { ClassicEditor } from "@ckeditor/ckeditor5-editor-classic";

export type CKEditorInstanceFactory = (sourceElement: HTMLElement, state: ApplicationState) => Promise<ClassicEditor>;
