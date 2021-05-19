import {setData} from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

const exampleData = {
  "Hello": `<div xmlns="http://www.coremedia.com/2003/richtext-1.0"><p>Hello World!</p></div>`,
  "Empty": `<div xmlns="http://www.coremedia.com/2003/richtext-1.0"/>`,
  "External Links": `<div xmlns="http://www.coremedia.com/2003/richtext-1.0" xmlns:xlink="http://www.w3.org/1999/xlink"><table>
              <tr>
                <td class="td--heading">show</td>
                <td class="td--heading">role</td>
                <td class="td--heading">target</td>
                <td class="td--heading">Example</td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td><a xlink:href="https://example.org/">Link</a></td>
              </tr>
              <tr>
                <td>replace</td>
                <td></td>
                <td>_top</td>
                <td><a xlink:href="https://example.org/" xlink:show="replace">Link</a></td>
              </tr>
              <tr>
                <td>new</td>
                <td></td>
                <td>_blank</td>
                <td><a xlink:href="https://example.org/" xlink:show="new">Link</a></td>
              </tr>
              <tr>
                <td>embed</td>
                <td></td>
                <td>_embed</td>
                <td><a xlink:href="https://example.org/" xlink:show="embed">Link</a></td>
              </tr>
              <tr>
                <td>none</td>
                <td></td>
                <td>_none</td>
                <td><a xlink:href="https://example.org/" xlink:show="none">Link</a></td>
              </tr>
              <tr>
                <td>other</td>
                <td>someTarget</td>
                <td>someTarget</td>
                <td><a xlink:href="https://example.org/" xlink:show="other" xlink:role="someTarget">Link</a></td>
              </tr>
            </table></div>`,
};

const setExampleData = (editor, exampleKey) => {
  editor.setData(exampleData[exampleKey]);
};

const initExamples = (editor) => {
  const examplesDiv = document.getElementById("examples");
  for (let exampleKey in exampleData) {
    const button = document.createElement("button");
    button.innerHTML = exampleKey;
    button.addEventListener("click", () => {
      setExampleData(editor, exampleKey);
    });
    examplesDiv?.appendChild(button);
  }
};

export {
  initExamples,
}
