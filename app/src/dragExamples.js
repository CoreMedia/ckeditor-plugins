const getShowDragDropExamplesButton = () => {
  return document.getElementById("dragExamplesButton");
}

const getDragDropExamplesContainer = () => {
  return document.getElementById("drag-examples");
}

const renderDragExamplesButton = () => {
  const dragDropExamples = document.querySelector("#dragExamplesButton");
  dragDropExamples.addEventListener("click", () => {
    const dragDropExamplesContainer = getDragDropExamplesContainer();
    dragDropExamplesContainer.hidden = !dragDropExamplesContainer.hidden;
    if (dragDropExamplesContainer.hidden) {
      // remove preview-mode
      dragDropExamples.textContent = "Show drag & drop examples";
      dragDropExamplesContainer.classList.add("hidden");

    } else {
      // set preview-mode
      dragDropExamples.textContent = "Hide drag & drop examples";
      dragDropExamplesContainer.classList.remove("hidden");
    }
  });
}

renderDragExamplesButton();

const fetchDragExamples = () => {

}

const initDDExamples = () => {
  const dragExamples = fetchDragExamples();
  //addDragDropListener(dragExamples);
}

export {initDDExamples};
