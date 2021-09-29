# CoreMedia General RichText Support

The General RichText Support (“GRS”) ensures that any valid CoreMedia RichText,
especially attributes, may be loaded into CKEditor 5. It does not provide any
editing features, but only registers elements, attributes and attribute-values,
which are not yet supported by corresponding editing and/or data-processing
features.

GRS is based on CKEditor 5's General HTML Support (“GHS”). GRS shares the same
state as GHS, which is, as of now, an experimental state.

**Not part of CoreMedia Essentials:** This plugin is not part of the
_CoreMedia Essentials_, as it depends on your use-case, if you prefer running
CKEditor 5 in CoreMedia CMS with or without it.

## Do I need to install GRS?

If all your RichText data are created via CKEditor 5 within CoreMedia CMS:
most likely not. If you maintain RichText on aged systems, if RichText may be
added by other sources, then you most likely want to install the GRS Plugin.

If not installing GRS, any RichText, which is loaded and edited within CKEditor
5 will get all elements and attributes removed, which cannot be created by the
installed CKEditor 5 editing features. This may be a desired behavior, though.
