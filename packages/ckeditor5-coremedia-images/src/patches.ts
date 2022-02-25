import { getImgViewElementMatcher } from "@ckeditor/ckeditor5-image/src/image/utils";
import ViewElement from "@ckeditor/ckeditor5-engine/src/view/element";
import { UpcastConversionApi } from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

//CKEditor Issue: 11327 (https://github.com/ckeditor/ckeditor5/issues/11327), remove when fixed.
// https://github.com/ckeditor/ckeditor5/blob/fa6eed5585c89a7950a911431dde9c05e13fc950/packages/ckeditor5-image/src/image/imageinlineediting.js#L121
// The original conversion does not check if the src attribute has been consumed.
// This is an override for the ckeditor conversion and prevents the linked conversion to be executed (due to priority "high").
// As soon as we have a fix for issue 11327 we can remove this part while the upcast of src attribute must still be prevented.
export const imageInlineElementToElementConversionPatch = (editor: Editor): void => {
  editor.conversion.for("upcast").elementToElement({
    view: getImgViewElementMatcher(editor, "imageInline"),
    model: (viewImage: ViewElement, conversionApi: UpcastConversionApi) => {
      return conversionApi.writer.createElement("imageInline");
    },
    converterPriority: "high",
  });
};
