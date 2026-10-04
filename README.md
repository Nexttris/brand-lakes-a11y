# Brand Lakes Accessibility Preferences Widget

A small, self-hosted display-preferences panel for Brand Lakes client websites. No subscription, no third-party tracking, one file for every site.

It gives visitors control over how a page is displayed:

- Text size (100 / 112 / 125 / 150%)
- High contrast
- Highlight links
- Readable font
- Text spacing
- Hide images
- Pause animations
- Big cursor

Choices are saved in the visitor's browser and come back on their next visit. The panel itself is keyboard-operable (Tab, Escape), labeled for screen readers, and traps focus while open.

**What it is not.** This is a personalization layer. It does not inject ARIA, "auto-fix" markup, or make a site conform to WCAG or the ADA. Real accessibility comes from how the site is built; the widget is a convenience on top of that.

## Install

Webflow → Site settings → Custom code → **Footer code**:

```html
<script src="https://cdn.jsdelivr.net/gh/Nexttris/brand-lakes-a11y@1/dist/bl-a11y.min.js"
        data-color="#1f6feb" data-position="right" defer></script>
```

| Attribute | Default | What it does |
|---|---|---|
| `data-color` | `#1f6feb` | Accent color for the button and active toggles |
| `data-position` | `right` | `right` or `left` |
| `data-offset` | `20` | Distance from the screen edge, in px |
| `data-features` | all | Comma list to limit features: `textSize,contrast,links,font,spacing,images,motion,cursor` |
| `data-statement` | — | URL of the site's accessibility statement (adds a link in the panel) |
| `data-branding` | `true` | `false` hides the Brand Lakes link |

## Versioning

- `@1` on the jsDelivr URL = latest 1.x release (bug fixes roll out to every site automatically).
- Pin to an exact tag (`@1.0.0`) on any site that should not change.
- jsDelivr caches tags permanently; a new release needs a new tag.

## Develop

```
src/bl-a11y.js      readable source
dist/bl-a11y.min.js what sites load
demo/index.html     local test page
demo/test.py        Playwright smoke test
```

Build: `npx terser src/bl-a11y.js --compress --mangle --comments '/^!/' -o dist/bl-a11y.min.js`
