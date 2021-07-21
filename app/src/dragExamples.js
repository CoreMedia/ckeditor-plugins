let newWin = null;
let serviceAgent = null;

const renderDragExamplesButton = () => {
  const dragDropExamples = document.querySelector("#dragExamplesButton");
  dragDropExamples.addEventListener("click", () => {
    newWin = window.open("about:blank", "drag-examples", "width=400,height=200");
    newWin.document.writeln("<div id='drag-examples'>");
    newWin.document.writeln(" <div class='drag-example' data-cmuripath='content/2' draggable='true'>Linkable Content id: content/2</div>");
    newWin.document.writeln(" <div class='drag-example' data-cmuripath='content/4' draggable='true'>Not linkable Content id: content/4</div>");
    newWin.document.writeln(" <div class='drag-example' data-cmuripath='content/1' draggable='true'>Folder Content id: content/1</div>");
    newWin.document.writeln(" <div class='drag-example' draggable='true'>https://www.any-plain-text-url.com</div>");
    newWin.document.writeln("</div>");

    let dragExamples = newWin.document.getElementsByClassName("drag-example");
    for (const dragExample of dragExamples) {
      dragExample.addEventListener('dragstart', setDragData);
      dragExample.addEventListener('dragend', removeDropData);
    }
  });
}

/**
 * Set the drag data stored in the attribute data-cmuripath to the dragEvent.dataTransfer and to the dragDropService in studio.
 *
 * @param dragEvent the drag event
 */
function setDragData(dragEvent) {
  let contentId = dragEvent.target.getAttribute("data-cmuripath");
  if (contentId) {
    serviceAgent.fetchService('dragDropService').then((dragDropService) => {
      dragDropService.dragData = "{\"contents\": [{\"$Ref\": \""+contentId+"\"}]}";
    });
    dragEvent.dataTransfer.setData('cm/uri-list', "[{\"$Ref\": \""+contentId+"\"}]");
    return;
  }
  dragEvent.dataTransfer.setData('text/plain', dragEvent.target.childNodes[0].textContent)
}

/**
 * We have to clear the dragData in dragDropService otherwise the data stay available and next checks might be affected.
 * Studio has the same behaviour. This is the reason why dragDropService.dragData is empty on drop. dragEnd is executed before drop.
 *
 * @param dragEvent the drag event
 */
function removeDropData(dragEvent) {
  serviceAgent.fetchService('dragDropService').then((dragDropService) => {
    dragDropService.dragData = null;
  });
}

renderDragExamplesButton();

const initDDExamples = (serviceAgentTry) => {
  serviceAgent = serviceAgentTry;
}

export {initDDExamples};
