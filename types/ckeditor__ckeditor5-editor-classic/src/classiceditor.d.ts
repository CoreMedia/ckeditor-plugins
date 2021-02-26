import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

export default class ClassicEditor extends Editor {

  static create (sourceElementOrData:any, config:object):Promise<Editor>;
}
