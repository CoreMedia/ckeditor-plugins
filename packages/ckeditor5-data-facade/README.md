# Data Facade

[![API Documentation][docs:api:badge]][docs:api]

[docs:api]: <https://coremedia.github.io/ckeditor-plugins/docs/api/modules/ckeditor5_data_facade.html> "@coremedia/ckeditor5-data-facade"
[docs:api:badge]: <https://img.shields.io/badge/docs-%F0%9F%93%83%20API-informational?style=for-the-badge>

**Module:** `@coremedia/ckeditor5-data-facade`

This module provides a way to prevent possibly unintended _normalization_ of
data during a set/get data flow.

In short, it ensures the following behavior, illustrated in pseudocode:

```text
newData = "<p>Hello Data Facade!</p>"

setData(newData)
currentData = getData()

assert newData === currentData
```

To achieve this, all data communication from and to the outside must be
tunneled through the data facade. Thus, to achieve strict equivalence of set
and immediately retrieved data, the pseudocode above changes to:

```text

newData = "<p>Hello Data Facade!</p>"

dataFacade.setData(newData)
currentData = dataFacade.getData()

assert newData === currentData
```

## What is Normalization?

Normalization starts, when, for example, providing options when getting data
to trim these data.

But also, CKEditor 5 does some normalization either implicitly or explicitly.

### Explicit Normalization

Unless you are making use of the _General HTML Support_ (GHS) feature,
CKEditor 5 will strip any contents within the data, that cannot be controlled
or created by corresponding commands.

As an example, assume, you have not enabled the bold style. You will
experience this behavior (pseudocode, without data facade in place):

```text
newData = "<p>Hello <strong>World</strong>!</p>"

setData(newData)
currentData = getData()

assert currentData === "<p>Hello World!</p>"
```

### Implicit Normalization

There is also some normalization that is related to the representation of data
within the CKEditor model layer. This layer provides no means, for example,
to guarantee a given order of attributes.

This behavior is perfectly fine for HTML representation, as there are various
semantically equivalent ways to represent the data. For example, all the
following are semantically equal, and it depends on the internal processing
of CKEditor, which one is preferred.

```text
inputData = `<p class="C1 C2" lang="en">Hello!</p>`

setData(inputData)
currentData = getData()

assert currentData in [
  inputData,
  `<p class="C2 C1" lang="en">Hello!</p>`, // Changed Class Order
  `<p lang="en" class="C1 C2">Hello!</p>`, // Changed Attribute Order
  `<p lang="en" class="C2 C1">Hello!</p>`, // Changed Class And Attribute Order
]
```

Thus, CKEditor may reorder attributes as well as attribute values, where
applicable.

## When to Use

You should use this data facade when your external data storage, such as a
CMS, does not expect a change of data in the scenario sketched above. More
complex systems may trigger subsequent actions, that may be expensive, such as
triggering a translation agency to translate the new data. In the context of
CoreMedia CMS, such a change may trigger a so-called auto-checkout of a
document, blocking any other editors from working on that document, although the
current editor did not intend to apply any changes.

## When Not to Use

If it is intended, that CKEditor 5 performs normalization of data, and you want
to store these normalized data immediately, you should stick to the standard
patterns, such as using the `Autosave` plugin and directly getting and setting
data at CKEditor.

## Caveat

Despite not normalizing just set data, the data facade and its underlying
controller also ignore options on get (such as trimming). Only an optional
set `rootName` is respected and is meant to provide the same behavior as for
a multi-root editor.

## Lazy CKEditor Initialization Support

The data facade feature also comes with support for lazy CKEditor 5
initialization, as it is typically used in CoreMedia Studio. 

## Usage Options

### Standalone Mode

The standalone mode moves the data-control completely outside CKEditor 5. In
this case, you will not add any related plugin (despite `Autosave` possibly).

A typical setup may look as follows:

```typescript
import { DataFacadeController } from "@coremedia/ckeditor5-data-facade";

const standaloneController = new DataFacadeController();

// You may set (and get) data already now.
standaloneController.setData("<p>Hello Standalone!</p>");

await ClassicEditor
  .create( document.querySelector( '#editor' ), {
    plugins: [
      Autosave,
    ],
    autosave: {
      save() {
        return saveData(standaloneController.getData());
      },
      waitingTime: 5000, 
    },
  })
  .then( (editor) => {
    // Inform controller, that editor is now available.
    standaloneController.init(editor);
  })
  .catch( (error) => {
    console.error( error );
  } );

// Will now either provide cached data or data directly provided by
// CKEditor instance.
standaloneController.getData();
```

### Embedded Mode

If you do not require lazy initialization of CKEditor 5 instances, you can
also use the embedded mode via data facade plugin.

A typical setup may look as follows:

```typescript
import { DataFacade } from "@coremedia/ckeditor5-data-facade";

ClassicEditor
  .create( document.querySelector( '#editor' ), {
    plugins: [
      // Transitive Dependency on Autosave.
      DataFacade,
    ],
    autosave: {
      // no save needed
       waitingTime: 5000, // in ms
    },
    dataFacade: {
      save(controller) {
        // saveData providing a promise to store data
        // in an external data storage.
        return saveData( controller.getData() );
      },
    }
  })
  .then( (editor) => {
    editor.plugins.get(DataFacade).setData("<p>Hello Embedded!</p>");
  })
  .catch( (error) => {
    console.error( error );
  } );
```

### Mixed Mode aka Delegating Mode

In mixed mode, you can combine lazy initialization and embedded mode. You
just need to ensure to switch to delegating mode for the previous standalone
controller during the initialization phase of the CKEditor instance.

> **When to choose mixed mode?** There may no explicit recommendation, when you
> have to decide between standalone and mixed mode. The differences are minimal.
>
> The mixed mode mainly exists, so that you will not have different "ideas" of
> the current data. Having the mixed mode, you may have several standalone
> controllers bound to one CKEditor 5 instance. Note though, that there is no
> specified contract for the order of "first-time binding" and possibly already
> set data within the yet unbound standalone controllers.
>
> Another possible benefit of the mixed mode: Plugins that require it, may
> depend on and use the `DataFacade` for their own purpose.

A typical setup of the mixed mode may look as follows:

```typescript
import { DataFacade, DataFacadeController } from "@coremedia/ckeditor5-data-facade";

const standaloneController = new DataFacadeController();

// You may set (and get) data already now.
standaloneController.setData("<p>Hello Standalone!</p>");

ClassicEditor
  .create( document.querySelector( '#editor' ), {
    plugins: [
      // Transitive Dependency on Autosave.
      DataFacade,
    ],
    autosave: {
      // no save needed
       waitingTime: 5000, // in ms
    },
    dataFacade: {
      save(controller) {
        // saveData providing a promise to store data
        // in an external data storage.
        return saveData( controller.getData() );
      }
    }
  })
  .then( (editor) => {
    // Will turn the controller into delegating mode.
    standaloneController.init(editor);
  })
  .catch( (error) => {
    console.error( error );
  } );

// Now the standalone controller delegates to the
// embedded controller.
standaloneController.setData("<p>Hello Delegating!</p>");
```

### Contextual Awareness Feature

If you want to reduce the number of CKEditor 5 instances, as used, for example,
in CoreMedia Studio Document Forms, you may reuse a given CKEditor 5 instance.
We describe this as using the CKEditor 5 instance within a new context.

To illustrate it even more, think of the CKEditor 5 previously bound to the
text property of `document/1`. Now we switch to editing `document/2` and reuse
the CKEditor 5 instance for the text property of that document. Due to
asynchronous behavior, you may experience a data flow like this:

```text
const editor = CKEditor@42AC

thread1: editor.setData(document1.text)
thread2: editor.setData(document2.text)
thread1: editor.getData()
```

Without further adaptations, `thread1` will now read the data of `document/2`
and will not even be aware of it, possibly writing these data back to
`document/1`.

To provide some contextual awareness, you may provide context information that
will signal any mismatched behavior. This context information is provided as
an option to the corresponding methods. In pseudocode, it roughly looks like
this, given the example above:

```text
const editor = CKEditor@42AC

thread1: editor.setData(document1.text, { context: "document/1" })
thread2: editor.setData(document2.text, { context: "document/2" })
thread1: editor.getData({ context: "document/1" })
```

In this case, `getData` will throw a `ContextMismatchError`, which you may
use to apply corresponding countermeasures, that at least should prevent the
data of `document/2` to be written to `document/1`.
