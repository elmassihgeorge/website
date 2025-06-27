# Module Management Guide

This guide shows how easy it is to add, remove, reorder, and customize modules on your site.

## Quick Start

All modules are configured in the `siteConfig` array in `index.html`. Each module is a simple JavaScript object.

## Basic Operations

### 1. Disable a Module
Set `enabled: false`:
```javascript
{
    id: 'projects',
    type: 'projects',
    title: 'Interactive Projects',
    enabled: false, // This module won't appear
    // ... rest of config
}
```

### 2. Reorder Modules
Simply move objects in the array:
```javascript
const siteConfig = [
    // Move blog before featured post
    blogModule,
    featuredModule,
    projectsModule,
    // ...
];
```

### 3. Add a New Module
Add a new object to the array:
```javascript
{
    id: 'contact',
    type: 'custom',
    title: 'Contact Me',
    background: 'auto',
    enabled: true,
    content: '<p>Email me at: <a href="mailto:contact@elmassihgeorge.com">contact@elmassihgeorge.com</a></p>'
}
```

## Module Types

### Featured Module
```javascript
{
    id: 'featured',
    type: 'featured',
    background: 'primary',
    data: {
        title: 'Your Post Title',
        excerpts: ['Paragraph 1', 'Paragraph 2'],
        date: 'Month Year',
        readTime: 'X min read',
        tags: 'Tag1 • Tag2 • Tag3',
        canvasId: 'your-canvas-id',
        buttons: [
            { text: 'Button Text', type: 'primary', action: 'yourFunction()' }
        ]
    }
}
```

### Blog Module
```javascript
{
    id: 'blog',
    type: 'blog',
    title: 'Recent Posts',
    background: 'auto',
    data: {
        posts: [
            {
                title: 'Post Title',
                date: 'Month Year',
                category: 'Category',
                excerpt: 'Post description...',
                link: '#link',
                linkText: 'Read More →'
            }
        ]
    }
}
```

### Projects Module
```javascript
{
    id: 'projects',
    type: 'projects',
    title: 'Interactive Projects',
    background: 'auto',
    data: {
        projects: [
            {
                title: 'Project Name',
                icon: '∇',
                iconStyle: 'background: linear-gradient(135deg, #color1, #color2);',
                description: 'Project description...',
                containerId: 'container-id',
                performance: '60 FPS',
                buttons: [
                    { text: 'View Details', type: 'primary', action: 'showDetails()' }
                ]
            }
        ]
    }
}
```

### Resume Module
```javascript
{
    id: 'resume',
    type: 'resume',
    title: 'Experience & Education',
    background: 'auto',
    data: {
        sections: [
            {
                title: 'Education',
                type: 'education',
                items: [
                    {
                        title: 'Degree Title',
                        date: 'Year',
                        institution: 'School Name',
                        description: 'Description...'
                    }
                ]
            },
            {
                title: 'Technical Skills',
                type: 'skills',
                categories: [
                    {
                        title: 'Category Name',
                        skills: ['Skill 1', 'Skill 2', 'Skill 3']
                    }
                ]
            }
        ]
    }
}
```

### About Module
```javascript
{
    id: 'about',
    type: 'about',
    title: 'About Me',
    background: 'auto',
    data: {
        paragraphs: [
            'First paragraph...',
            'Second paragraph...'
        ],
        image: {
            src: 'path/to/image.jpg',
            alt: 'Alt text'
        }
    }
}
```

### Custom Module
```javascript
{
    id: 'custom',
    type: 'custom',
    title: 'Custom Section',
    background: 'auto',
    content: '<div>Any HTML content here</div>'
}
```

## Background Options

- `'primary'` - Uses primary chocolate background
- `'alt'` - Uses alternate chocolate background  
- `'auto'` - Automatically alternates between primary and alt based on position

## Examples

### Add a Contact Section
```javascript
// Add this to your siteConfig array
{
    id: 'contact',
    type: 'custom',
    title: 'Get In Touch',
    background: 'auto',
    enabled: true,
    content: `
        <div style="text-align: center; padding: 2rem;">
            <p>Interested in collaborating or discussing mathematical visualization?</p>
            <a href="mailto:contact@elmassihgeorge.com" class="btn btn--primary">
                Contact Me
            </a>
        </div>
    `
}
```

### Reorder to Show About First
```javascript
const siteConfig = [
    aboutModule,    // Move about to first
    featuredModule, // Keep featured second
    blogModule,
    projectsModule,
    resumeModule
];
```

### Temporarily Hide Projects
```javascript
{
    id: 'projects',
    type: 'projects', 
    title: 'Interactive Projects',
    enabled: false, // Just add this line
    // ... rest stays the same
}
```

## File Structure

```
/
├── index.html          # Main HTML with module config
├── css/
│   ├── base.css       # Core styles
│   └── modules.css    # Module-specific styles
├── js/
│   ├── modules.js     # Module management system
│   └── mandelbrot-webgl.js
└── MODULE-GUIDE.md    # This guide
```

## Tips

1. Always test your changes by refreshing the browser
2. Use browser dev tools to debug any issues
3. Keep the module config readable with comments
4. Background alternation works automatically with `'auto'`
5. IDs should be unique across all modules
6. You can add custom CSS classes with the `className` property