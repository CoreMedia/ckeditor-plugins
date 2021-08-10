const addDnDListeners = () => {
  let dragExamples = document.getElementsByClassName("drag-example");
  for (const dragExample of dragExamples) {
    dragExample.addEventListener('dragstart', setDragData);
    dragExample.addEventListener('dragend', removeDropData);
  }
};

const contentList = (...ids) => {
  return ids.map((id) => {
    return {
      $Ref: id,
    }
  });
};

const contentDragData = (...ids) => {
  return {
    contents: contentList(...ids),
  };
};

/**
 * Set the drag data stored in the attribute data-cmuripath to the dragEvent.dataTransfer and to the dragDropService in studio.
 *
 * @param dragEvent the drag event
 */
function setDragData(dragEvent) {
  const contentId = dragEvent.target.getAttribute("data-cmuripath");
  const idsArray = contentId.split(',');
  if (contentId) {
    parent.serviceAgent.fetchService('dragDropService').then((dragDropService) => {
      dragDropService.dragData = JSON.stringify(contentDragData(...idsArray));
    });
    dragEvent.dataTransfer.setData('cm/uri-list', JSON.stringify(contentList(...idsArray)));
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
  parent.serviceAgent.fetchService('dragDropService').then((dragDropService) => {
    dragDropService.dragData = null;
  });
}

addDnDListeners();
