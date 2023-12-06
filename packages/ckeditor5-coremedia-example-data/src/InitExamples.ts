import { ExampleData } from "./ExampleData";

const createLabelFor = (inputElement: HTMLInputElement): HTMLLabelElement => {
  const { id: inputId } = inputElement;
  const element = document.createElement("label");

  if (!inputId) {
    throw new Error("Input Element must provide an ID.");
  }

  element.htmlFor = inputId;
  element.textContent = "Example:";
  return element;
};

const createInputWithDataFrom = (dataListElement: HTMLDataListElement): HTMLInputElement => {
  const { id: dataListId } = dataListElement;
  const element = document.createElement("input");

  if (!dataListId) {
    throw new Error("DataList Element must provide an ID.");
  }

  element.id = "xmp-input";
  element.placeholder = "Start typing...";
  element.autocomplete = "on";
  element.setAttribute("list", dataListId);

  // Clear input on focus (otherwise, only the matched option is shown)
  element.addEventListener("focus", () => {
    element.value = "";
  });

  return element;
};

const createDataListElement = (): HTMLDataListElement => {
  const element: HTMLDataListElement = document.createElement("datalist");
  element.id = "xmp-data";
  return element;
};

const createReloadButton = (): HTMLButtonElement => {
  const element = document.createElement("button");
  element.id = "xmp-reload";
  element.title = "Reload";
  const text = document.createTextNode("🔄");
  element.appendChild(text);
  return element;
};

const createClearButton = (): HTMLButtonElement => {
  const element = document.createElement("button");
  element.id = "xmp-clear";
  element.title = "Clear";
  const text = document.createTextNode("🚮");
  element.appendChild(text);
  return element;
};

/**
 * UI Elements relevant for example selection.
 */
interface ExamplesUiElements {
  /**
   * The input field. You may want a `change` listener, to forward
   * changes to the CKEditor instance.
   */
  input: HTMLInputElement;
  /**
   * The data list that is expected to contain the options, users may
   * select from.
   */
  dataList: HTMLDataListElement;
  /**
   * Pressed to trigger reload of the current example.
   */
  reload: HTMLButtonElement;
  /**
   * Triggered to clear the contents of the CKEditor.
   */
  clear: HTMLButtonElement;
}

const initExamplesUi = (parent: ParentNode): ExamplesUiElements => {
  const dataList = createDataListElement();
  const input = createInputWithDataFrom(dataList);
  const label = createLabelFor(input);
  const reload = createReloadButton();
  const clear = createClearButton();

  parent.append(label, input, dataList, reload, clear);

  return { input, dataList, reload, clear };
};

const addExampleOptions = (
  dataList: HTMLDataListElement,
  defaultKey: string | undefined,
  exampleKeys: string[],
): void => {
  // Now add all examples
  for (const exampleKey of exampleKeys.sort()) {
    const option = document.createElement("option");
    option.textContent = exampleKey;
    option.value = exampleKey;
    option.defaultSelected = exampleKey === defaultKey;
    dataList.appendChild(option);
  }
};

/**
 * Initializes the examples.
 *
 * @param config - configuration for examples
 */
export const initExamples = (config: ExamplesConfig): void => {
  const { id = "examples", default: defaultExampleKey, examples, onChange } = config;
  const examplesContainer = document.getElementById(id);

  if (!examplesContainer) {
    throw new Error(`Cannot locate examples container with ID "${id}".`);
  }

  const { input, dataList, reload, clear } = initExamplesUi(examplesContainer);

  // On change, set the data – or show an error if data are unknown.
  input.addEventListener("change", () => {
    const newValue = input.value;
    if (examples.hasOwnProperty(newValue)) {
      input.classList.remove("error");
      const data = examples[newValue];
      console.log("Setting example data.", { [newValue]: data });
      onChange(data);
      input.blur();
    } else {
      input.classList.add("error");
      input.select();
    }
  });

  // Init the reload-button, to also listen to the value of example input field.
  reload.addEventListener("click", () => {
    const newValue = input.value;
    if (examples.hasOwnProperty(newValue)) {
      input.classList.remove("error");
      const data = examples[newValue];
      console.log("Resetting example data.", { [newValue]: data });
      onChange(data);
      input.blur();
    }
  });

  clear.addEventListener("click", () => {
    input.blur();
    console.log("Clearing data.");
    onChange("");
  });

  addExampleOptions(dataList, defaultExampleKey, Object.keys(examples));

  if (defaultExampleKey) {
    input.value = defaultExampleKey;
    if (examples.hasOwnProperty(defaultExampleKey)) {
      input.classList.remove("error");
      const data = examples[defaultExampleKey];
      console.log("Setting default example data.", { [defaultExampleKey]: data });
      onChange(data);
    } else {
      input.classList.add("error");
      console.error(`Invalid default example key given: "${defaultExampleKey}".`);
    }
  }
};

/**
 * Examples configuration.
 */
export interface ExamplesConfig {
  /**
   * ID of the DOM element to insert the example UI to.
   * Defaults to `examples`.
   */
  id?: string;
  /**
   * If set, triggers selection of a default entry when initialized.
   */
  default?: string;
  /**
   * Set of examples to initialize. The key is the title to render within
   * the option selection; the value represents the data to set.
   */
  examples: ExampleData;
  /**
   * Listener, that will be informed on any valid selection about the data
   * to set at the editor.
   *
   * @param data - data to set at editor
   */
  onChange: (data: string) => void;
}
