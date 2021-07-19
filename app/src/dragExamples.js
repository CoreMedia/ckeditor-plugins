let newWin = null;
let serviceAgent = null;

const renderDragExamplesButton = () => {
  const dragDropExamples = document.querySelector("#dragExamplesButton");
  dragDropExamples.addEventListener("click", () => {
    newWin = window.open("about:blank", "drag-examples", "width=400,height=200");
    newWin.document.writeln("<div id='drag-examples'>");
    newWin.document.writeln(" <div class='drag-example' data-cmuripath='content/12345' draggable='true'>Valid Content id: content/12345</div>");
    newWin.document.writeln("</div>");

    let dragExamples = newWin.document.getElementsByClassName("drag-example");
    for (const dragExample of dragExamples) {
      dragExample.addEventListener('dragstart', setDragData);
    }
  });
}

/**
 * Set the drag data stored in the attribute data-cmuripath to the dragEvent.dataTransfer and to the dragDropService in studio.
 *
 * @param dragEvent
 */
function setDragData(dragEvent) {
  let contentId = dragEvent.target.getAttribute("data-cmuripath");
  serviceAgent.fetchService('dragDropService').then((dragDropService) => {
    dragDropService.dragData = "{\"contents\": [{\"$Ref\": \""+contentId+"\"}]}";
  });
  dragEvent.dataTransfer.setData('cm/uri-list', "[{\"$Ref\": \""+contentId+"\"}]");
}

renderDragExamplesButton();

const initDDExamples = (serviceAgentTry) => {
  serviceAgent = serviceAgentTry;
}

export {initDDExamples};
