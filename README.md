# elmassihgeorge.com

A modular mathematics portfolio website showcasing interactive visualizations, blog posts, and professional background.

## Features

- **Interactive Mandelbrot Set Explorer** - GPU-accelerated WebGL visualization with real-time zoom and color controls
- **Modular Architecture** - Easy-to-manage content system for adding, removing, or reordering sections
- **Responsive Design** - Works seamlessly across desktop and mobile devices
- **Dark Chocolate Theme** - Professional, warm color scheme with Helvetica typography

## Architecture

This site uses a custom modular system built around a `ModuleManager` class that dynamically generates content from configuration objects. All site content is defined in a single `siteConfig` array in `index.html`.

### Module Types
- `featured` - Showcase posts with interactive demos
- `blog` - Grid of blog posts
- `projects` - Interactive project cards
- `resume` - Education and skills sections
- `about` - Personal information with photo
- `custom` - Any HTML content

## Development

Since this is a static website, development is straightforward:

1. Open `index.html` directly in a browser, or
2. Use a local web server: `python -m http.server 8000`
3. Navigate to `http://localhost:8000`

## Content Management

To modify site content, edit the `siteConfig` array in `index.html`:

```javascript
// Add a new section
{
    id: 'contact',
    type: 'custom',
    title: 'Contact Me',
    background: 'auto',
    enabled: true,
    content: '<p>Your content here</p>'
}

// Disable a section
{
    id: 'projects',
    enabled: false,
    // ... rest of config
}

// Reorder sections by moving objects in the array
```

See `MODULE-GUIDE.md` for detailed examples and all available module types.

## Deployment

This is a static website that can be deployed to any web server or static hosting service:

### Files Required for Deployment
- `index.html`
- `css/` directory (base.css, modules.css)
- `js/` directory (modules.js, mandelbrot-webgl.js, and visualization files)
- `IMG_5068.JPEG` (profile photo)
- `CLAUDE.md` (for future development)

### Deployment Options
- **GitHub Pages** - Push to a repository and enable Pages
- **Netlify** - Drag and drop the entire folder
- **Vercel** - Connect repository or upload files
- **Traditional Web Hosting** - Upload files via FTP/SFTP

## Technologies

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Visualizations**: WebGL, p5.js, Three.js
- **Typography**: Helvetica Neue system font stack
- **Dependencies**: Loaded via CDN (p5.js, Three.js)

## Browser Support

- Modern browsers with WebGL support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Personal portfolio website © 2025 George ElMassih