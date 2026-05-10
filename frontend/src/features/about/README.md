# TideMate About page split

This folder splits the old large `AboutProjectPage.jsx` into smaller files.

Suggested placement:

```text
src/features/about/
  AboutProjectPage.jsx
  components/
  data/
  sections/
```

Then import/use `AboutProjectPage` from the new location in your router.

The main page file is now small and only controls the layout, tabs, and active tab rendering.
The tab content is split into separate section files:

- `sections/OverviewTab.jsx`
- `sections/ArchitectureTab.jsx`
- `sections/SecurityTab.jsx`
- `sections/ApiTab.jsx`

Shared UI lives in `components/`, and API/tab data lives in `data/`.
