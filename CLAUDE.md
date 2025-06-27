# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a static website with no build process. Development is done by:
- Opening `index.html` directly in a browser
- Using a local web server like `python -m http.server 8000` for testing
- No linting or testing commands are configured

## Architecture Overview

This is a modular mathematics portfolio website built around a custom module management system. The architecture separates concerns into three main layers:

### Module System Architecture
The core innovation is a JavaScript-based module system (`js/modules.js`) that dynamically generates page content from configuration objects. All site content is defined in the `siteConfig` array in `index.html`, making it extremely easy to add, remove, or reorder sections.

**Key Components:**
- `ModuleManager` class handles rendering and lifecycle
- Module types: `featured`, `blog`, `projects`, `resume`, `about`, `custom`
- Automatic background alternation between chocolate brown shades
- Built-in responsive design and interactive element initialization

### CSS Architecture
**Separation of Concerns:**
- `css/base.css` - Core styles, typography, layout utilities, CSS custom properties
- `css/modules.css` - Component-specific styles for each module type
- `css/styles.css` - Legacy file (may be unused)

**Design System:**
- CSS custom properties for chocolate/brown color scheme
- Consistent spacing via `--section-padding: 2rem`
- Three container widths: `--container-max-width`, `--content-max-width`, `--narrow-max-width`
- Helvetica font stack throughout

### Interactive Visualizations
The site features GPU-accelerated mathematical visualizations:
- `js/mandelbrot-webgl.js` - WebGL-based Mandelbrot Set explorer with zoom and color controls
- Other visualization files: `spiral.js`, `threejs-plot.js` (integration may be incomplete)
- Canvas management and performance tracking built into module system

## Making Content Changes

**Adding a new section:** Add a module object to `siteConfig` array in `index.html`
**Removing content:** Set `enabled: false` on any module
**Reordering sections:** Rearrange objects in the `siteConfig` array
**Content updates:** Modify the `data` property within existing module objects

The module system automatically handles styling, spacing, and background alternation. See `MODULE-GUIDE.md` for detailed examples.

## Key Integration Points

**WebGL Integration:** The `featured` module type automatically initializes Mandelbrot visualization when `canvasId: 'mandelbrot-container'` is present.

**Global Functions:** Button actions in modules call global functions like `resetMandelbrot()`, `toggleColorScheme()`, `exploreInterestingLocation()` defined in `js/modules.js`.

**Background Canvas:** Particle animation system runs independently, initialized by `ModuleManager.initializeBackgroundCanvas()`.

## File Dependencies

- `index.html` depends on both CSS files and `js/modules.js`
- Module system requires `js/mandelbrot-webgl.js` for interactive visualizations
- External CDN dependencies: p5.js, Three.js (loaded but integration incomplete)
- Asset dependency: `IMG_5068.JPEG` for about section photo

## Important Notes

- The site uses a custom modular architecture rather than a standard framework
- Content is configuration-driven rather than template-driven
- Background colors alternate automatically between `--primary-bg` and `--section-alt`
- The fixed header requires first modules to have extra top padding via `module--first` class