/**
 * Module Management System for elmassihgeorge.com
 * Simple, flexible system for managing site modules
 */

class ModuleManager {
    constructor() {
        this.modules = [];
        this.container = null;
    }

    /**
     * Initialize the module system
     * @param {string} containerId - ID of the container element
     */
    init(containerId = 'main-content') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        this.render();
        this.initializeInteractivity();
    }

    /**
     * Add a module to the system
     * @param {Object} moduleConfig - Module configuration object
     */
    addModule(moduleConfig) {
        this.modules.push(moduleConfig);
    }

    /**
     * Configure all modules at once
     * @param {Array} moduleConfigs - Array of module configurations
     */
    setModules(moduleConfigs) {
        this.modules = moduleConfigs;
    }

    /**
     * Render all modules to the DOM
     */
    render() {
        if (!this.container) return;

        this.container.innerHTML = '';
        
        this.modules.forEach((module, index) => {
            if (module.enabled === false) return;
            
            const moduleElement = this.createModule(module, index);
            this.container.appendChild(moduleElement);
        });
    }

    /**
     * Create a module element
     * @param {Object} config - Module configuration
     * @param {number} index - Module index for background alternation
     * @returns {HTMLElement} Module element
     */
    createModule(config, index) {
        const module = document.createElement('section');
        module.className = this.getModuleClasses(config, index);
        module.id = config.id || `module-${index}`;
        
        const content = document.createElement('div');
        content.className = `module__content ${config.contentClass || ''}`;
        
        // Add header if title exists
        if (config.title) {
            const header = this.createModuleHeader(config);
            content.appendChild(header);
        }
        
        // Add module content
        const moduleContent = this.createModuleContent(config);
        content.appendChild(moduleContent);
        
        module.appendChild(content);
        return module;
    }

    /**
     * Generate CSS classes for a module
     * @param {Object} config - Module configuration
     * @param {number} index - Module index
     * @returns {string} CSS classes
     */
    getModuleClasses(config, index) {
        let classes = ['module'];
        
        // Add module type class
        if (config.type) {
            classes.push(`${config.type}-module`);
        }
        
        // Add background alternation
        if (config.background === 'auto') {
            classes.push(index % 2 === 0 ? 'module--primary-bg' : 'module--alt-bg');
        } else if (config.background) {
            classes.push(`module--${config.background}-bg`);
        }
        
        // Add first module class
        if (index === 0) {
            classes.push('module--first');
        }
        
        // Add custom classes
        if (config.className) {
            classes.push(config.className);
        }
        
        return classes.join(' ');
    }

    /**
     * Create module header
     * @param {Object} config - Module configuration
     * @returns {HTMLElement} Header element
     */
    createModuleHeader(config) {
        const header = document.createElement('div');
        header.className = 'module__header';
        
        const title = document.createElement('h2');
        title.className = 'module__title';
        title.textContent = config.title;
        header.appendChild(title);
        
        if (config.subtitle) {
            const subtitle = document.createElement('p');
            subtitle.className = 'module__subtitle';
            subtitle.textContent = config.subtitle;
            header.appendChild(subtitle);
        }
        
        return header;
    }

    /**
     * Create module content based on type
     * @param {Object} config - Module configuration
     * @returns {HTMLElement} Content element
     */
    createModuleContent(config) {
        const content = document.createElement('div');
        
        switch (config.type) {
            case 'featured':
                return this.createFeaturedContent(config);
            case 'blog':
                return this.createBlogContent(config);
            case 'projects':
                return this.createProjectsContent(config);
            case 'resume':
                return this.createResumeContent(config);
            case 'about':
                return this.createAboutContent(config);
            case 'custom':
                return this.createCustomContent(config);
            default:
                content.innerHTML = config.content || '';
                return content;
        }
    }

    /**
     * Create featured module content
     */
    createFeaturedContent(config) {
        const article = document.createElement('article');
        article.className = 'featured-article';
        
        article.innerHTML = `
            <div class="featured-article__content">
                <div class="featured-article__text">
                    <h3>${config.data.title}</h3>
                    ${config.data.excerpts.map(excerpt => `<p class="featured-article__excerpt">${excerpt}</p>`).join('')}
                    <div class="featured-article__meta">
                        <span class="publish-date">${config.data.date}</span>
                        <span class="read-time">${config.data.readTime}</span>
                        <span class="tags">${config.data.tags}</span>
                    </div>
                </div>
                <div class="featured-article__demo">
                    <div class="canvas-container">
                        <div id="${config.data.canvasId}">
                            <canvas id="${config.data.canvasId}-canvas"></canvas>
                            <div class="canvas-loading" id="${config.data.canvasId}-loading">Initializing WebGL...</div>
                        </div>
                        <div class="performance-badge" id="${config.data.canvasId}-fps">0 FPS</div>
                    </div>
                    <div class="btn-group">
                        ${config.data.buttons.map(btn => 
                            `<button class="btn btn--${btn.type}" onclick="${btn.action}">${btn.text}</button>`
                        ).join('')}
                    </div>
                </div>
            </div>
        `;
        
        return article;
    }

    /**
     * Create blog module content
     */
    createBlogContent(config) {
        const grid = document.createElement('div');
        grid.className = 'blog-grid';
        
        config.data.posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post';
            
            postElement.innerHTML = `
                <div class="blog-post__header">
                    <h3>${post.title}</h3>
                    <div class="blog-post__meta">
                        <span class="blog-post__date">${post.date}</span>
                        <span class="blog-post__category">${post.category}</span>
                    </div>
                </div>
                <p class="blog-post__excerpt">${post.excerpt}</p>
                <a href="${post.link}" class="blog-post__link">${post.linkText}</a>
            `;
            
            grid.appendChild(postElement);
        });
        
        return grid;
    }

    /**
     * Create projects module content
     */
    createProjectsContent(config) {
        const grid = document.createElement('div');
        grid.className = 'projects-grid';
        
        config.data.projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.className = 'project-card';
            
            projectElement.innerHTML = `
                <div class="project-card__header">
                    <div class="project-card__icon" style="${project.iconStyle}">${project.icon}</div>
                    <h3 class="project-card__title">${project.title}</h3>
                </div>
                <p class="project-card__description">${project.description}</p>
                ${project.controls ? `<div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">
                    <strong>Controls:</strong> ${project.controls}
                </div>` : ''}
                <div class="canvas-container">
                    <div id="${project.containerId}"></div>
                    <div class="performance-badge">${project.performance}</div>
                </div>
                <div class="btn-group">
                    ${project.buttons.map(btn => 
                        `<button class="btn btn--${btn.type}" onclick="${btn.action}">${btn.text}</button>`
                    ).join('')}
                </div>
            `;
            
            grid.appendChild(projectElement);
        });
        
        return grid;
    }

    /**
     * Create resume module content
     */
    createResumeContent(config) {
        const grid = document.createElement('div');
        grid.className = 'resume-grid';
        
        config.data.sections.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'resume-section';
            
            let content = `<h3 class="resume-section__title">${section.title}</h3>`;
            
            if (section.type === 'education') {
                section.items.forEach(item => {
                    content += `
                        <div class="resume-item">
                            <div class="resume-item__header">
                                <h4 class="resume-item__title">${item.title}</h4>
                                <span class="resume-item__date">${item.date}</span>
                            </div>
                            <p class="resume-item__institution">${item.institution}</p>
                            <p class="resume-item__description">${item.description}</p>
                        </div>
                    `;
                });
            } else if (section.type === 'skills') {
                content += '<div class="skills-grid">';
                section.categories.forEach(category => {
                    content += `
                        <div class="skill-category">
                            <h4 class="skill-category__title">${category.title}</h4>
                            <ul class="skill-category__list">
                                ${category.skills.map(skill => `<li class="skill-category__item">${skill}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                });
                content += '</div>';
            }
            
            sectionElement.innerHTML = content;
            grid.appendChild(sectionElement);
        });
        
        return grid;
    }

    /**
     * Create about module content
     */
    createAboutContent(config) {
        const layout = document.createElement('div');
        layout.className = 'about-layout';
        
        layout.innerHTML = `
            <div class="about-text">
                ${config.data.paragraphs.map(p => `<p>${p}</p>`).join('')}
            </div>
            <div class="about-image">
                <img src="${config.data.image.src}" alt="${config.data.image.alt}" />
            </div>
        `;
        
        return layout;
    }

    /**
     * Create custom module content
     */
    createCustomContent(config) {
        const content = document.createElement('div');
        content.innerHTML = config.content || '';
        return content;
    }

    /**
     * Initialize interactive elements
     */
    initializeInteractivity() {
        // Initialize any interactive elements (like Mandelbrot canvas)
        // This will be called after all modules are rendered
        this.initializeMandelbrot();
        this.initializeBackgroundCanvas();
        this.initializeScrollHandler();
        this.initializeSmoothScrolling();
    }

    /**
     * Initialize Mandelbrot visualization
     */
    initializeMandelbrot() {
        const canvas = document.getElementById('mandelbrot-canvas');
        const loading = document.getElementById('mandelbrot-loading');
        
        if (canvas && typeof MandelbrotWebGL !== 'undefined') {
            try {
                window.mandelbrot = new MandelbrotWebGL({
                    canvas: canvas,
                    centerX: -0.5,
                    centerY: 0.0,
                    zoom: 0.7,
                    onFPSUpdate: (fps) => {
                        const fpsElement = document.getElementById('mandelbrot-fps');
                        if (fpsElement) {
                            fpsElement.textContent = fps + ' FPS';
                        }
                    }
                });
                
                if (loading) {
                    loading.style.display = 'none';
                }
            } catch (error) {
                console.error('Failed to initialize Mandelbrot:', error);
                if (loading) {
                    loading.innerHTML = 'WebGL initialization failed. Please ensure you have a modern browser with WebGL support.';
                    loading.style.color = '#ff6b6b';
                }
            }
        }
    }

    /**
     * Initialize background canvas
     */
    initializeBackgroundCanvas() {
        const canvas = document.querySelector('.bg-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let particles = [];
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        function createParticles() {
            particles = [];
            const numParticles = 50;
            
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.1
                });
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = canvas.height;
                if (particle.y > canvas.height) particle.y = 0;
                
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 183, 77, ${particle.opacity * 0.3})`;
                ctx.fill();
            });
            
            requestAnimationFrame(animate);
        }
        
        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
        
        resizeCanvas();
        createParticles();
        animate();
    }

    /**
     * Initialize scroll handler for header
     */
    initializeScrollHandler() {
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.site-header');
            if (header) {
                const scrolled = window.pageYOffset;
                const opacity = Math.min(0.98, 0.85 + (scrolled / 200) * 0.13);
                header.style.background = `rgba(46, 26, 22, ${opacity})`;
            }
        });
    }

    /**
     * Initialize smooth scrolling for navigation
     */
    initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Global functions for button actions
window.resetMandelbrot = function() {
    if (window.mandelbrot) window.mandelbrot.reset();
};

window.toggleColorScheme = function() {
    if (window.mandelbrot) window.mandelbrot.nextColorScheme();
};

window.exploreInterestingLocation = function() {
    const locations = [
        { x: -0.7269, y: 0.1889, zoom: 1000 },
        { x: -0.8, y: 0.156, zoom: 500 },
        { x: -0.74529, y: 0.11307, zoom: 2000 },
        { x: -1.25066, y: 0.02012, zoom: 5000 },
        { x: -0.7533, y: 0.1138, zoom: 10000 }
    ];
    
    const location = locations[Math.floor(Math.random() * locations.length)];
    if (window.mandelbrot) {
        window.mandelbrot.zoomTo(location.x, location.y, location.zoom, 2000);
    }
};

// Export for use in other modules
window.ModuleManager = ModuleManager;