# Studies / QA Hero

Domain language for the Vue 3 study-guide SPA. Defines what we call the units of content, the metadata that describes them, and the runtime structures the application reads.

## Language

**Knowledge module**:
A self-contained unit of study content (e.g. CTAL-AT, Quality Metrics, CTAL-TAE). Co-located with its source XML in `knowledge/xml/<id>.xml`. The unit a learner navigates to; the unit the application routes to.
_Avoid_: chapter, syllabus, content

**Knowledge manifest**:
The structured metadata describing a knowledge module's routing, presentation, and storage contract. Lives in a `<manifest>` element at the top of each knowledge XML. Strict, fully explicit — the convert script fails loudly if any field is missing. Twelve fields: `id`, `path`, `name`, `navLabel`, `title`, `subtitle`, `tocTitle`, `homeDescription`, `homeOrder`, `highlightKey`, `footerAttribution`.
_Avoid_: meta, config, settings

**Knowledge catalog**:
The runtime map of all known knowledge modules, keyed by `id`. Generated from all `<manifest>` elements into `data/manifest.js`. Single source the router, nav, and home page read from.
_Avoid_: registry, index, table

**Footer attribution**:
The licensing / authorship block shown at the bottom of a content page. One of a fixed enum: `istqb`, `crispin-gregory`, `none`. Drives the AppFooter rendering.
_Avoid_: footer type, attribution mode
