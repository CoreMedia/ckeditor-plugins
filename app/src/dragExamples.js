const addDnDListeners = () => {
  let dragExamples = document.getElementsByClassName("drag-example");
  for (const dragExample of dragExamples) {
    dragExample.addEventListener('dragstart', setDragData);
    dragExample.addEventListener('dragend', removeDropData);
  }
};

const contentList = (contentId, ...otherIds) => {
  const ids = [contentId, ...otherIds];
  return ids.map((id) => {
    return {
      $Ref: id,
    }
  });
};

const contentDragData = (contentId, ...otherIds) => {
  return {
    contents: contentList(contentId, ...otherIds),
  };
};

/**
 * Set the drag data stored in the attribute data-cmuripath to the dragEvent.dataTransfer and to the dragDropService in studio.
 *
 * @param dragEvent the drag event
 */
function setDragData(dragEvent) {
  const contentId = dragEvent.target.getAttribute("data-cmuripath");
  if (contentId) {
    parent.serviceAgent.fetchService('dragDropService').then((dragDropService) => {
      dragDropService.dragData = JSON.stringify(contentDragData(contentId));
    });
    dragEvent.dataTransfer.setData('cm/uri-list', JSON.stringify(contentList(contentId)));
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
