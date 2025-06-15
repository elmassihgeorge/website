// Main initialization file with enhanced error handling and features
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing visualizations...');
    initializeVisualizations();
    setupEventListeners();
});

async function initializeVisualizations() {
    try {
        // Check if required functions exist before calling them
        const initializations = [];
        
        // Initialize p5.js sketches if functions exist
        if (typeof mandelbrotSketch !== 'undefined') {
            initializations.push(initializeP5Sketch(mandelbrotSketch, 'Mandelbrot Set'));
        } else {
            console.warn('mandelbrotSketch not found');
        }
        
        if (typeof spiralSketch !== 'undefined') {
            initializations.push(initializeP5Sketch(spiralSketch, 'Spiral Visualization'));
        } else {
            console.warn('spiralSketch not found');
        }
        
        // Initialize Three.js visualization if function exists
        if (typeof init3D !== 'undefined') {
            initializations.push(initialize3D());
        } else {
            console.warn('init3D function not found');
        }
        
        // Wait for all initializations to complete
        await Promise.all(initializations);
        console.log('All mathematical visualizations initialized successfully!');
        
        // Add loading complete animation
        document.body.classList.add('loaded');
        
    } catch (error) {
        console.error('Error initializing visualizations:', error);
        showErrorMessage('Failed to load some visualizations. Please refresh the page.');
    }
}

function initializeP5Sketch(sketchFunction, name) {
    return new Promise((resolve, reject) => {
        try {
            new p5(sketchFunction);
            console.log(`${name} initialized successfully`);
            resolve();
        } catch (error) {
            console.error(`Error initializing ${name}:`, error);
            reject(error);
        }
    });
}

function initialize3D() {
    return new Promise((resolve, reject) => {
        try {
            init3D();
            console.log('Three.js visualization initialized successfully');
            resolve();
        } catch (error) {
            console.error('Error initializing Three.js visualization:', error);
            reject(error);
        }
    });
}

function setupEventListeners() {
    // Enhanced smooth scrolling with offset for sticky header
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add intersection observer for animations
    setupScrollAnimations();
    
    // Add resize handler for responsive visualizations
    window.addEventListener('resize', debounce(handleResize, 250));
}

function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all module cards
    document.querySelectorAll('.module-card').forEach(card => {
        observer.observe(card);
    });
}

function handleResize() {
    // Trigger resize events for p5.js and Three.js visualizations
    if (typeof resizeVisualizations === 'function') {
        resizeVisualizations();
    }
    console.log('Window resized, updating visualizations');
}

// Enhanced code viewing with syntax highlighting placeholder
function showCode(moduleName) {
    const codeModal = createCodeModal(moduleName);
    document.body.appendChild(codeModal);
    
    // Add smooth entrance animation
    requestAnimationFrame(() => {
        codeModal.classList.add('show');
    });
}

function createCodeModal(moduleName) {
    const modal = document.createElement('div');
    modal.className = 'code-modal';
    modal.innerHTML = `
        <div class="code-modal-content">
            <div class="code-modal-header">
                <h3>${moduleName} Source Code</h3>
                <button class="close-btn" onclick="closeCodeModal(this)">&times;</button>
            </div>
            <div class="code-modal-body">
                <pre><code>// ${moduleName} source code will be loaded here
// This is a placeholder for the actual implementation
console.log('Loading ${moduleName} source code...');</code></pre>
            </div>
        </div>
    `;
    return modal;
}

function closeCodeModal(button) {
    const modal = button.closest('.code-modal');
    modal.classList.add('hide');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Error handling
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
        setTimeout(() => errorDiv.remove(), 300);
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance monitoring
function logPerformance() {
    if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    }
}

// Call performance logging after everything is loaded
window.addEventListener('load', logPerformance);