/**
 * High-Precision WebGL Mandelbrot Set Explorer
 * GPU-accelerated fractal visualization with deep zoom support
 * 
 * Usage:
 * const mandelbrot = new MandelbrotWebGL({
 *     canvas: document.getElementById('mandelbrot-canvas'),
 *     onFPSUpdate: (fps) => console.log(fps)
 * });
 */

class MandelbrotWebGL {
    constructor(options = {}) {
        this.canvas = options.canvas;
        this.onFPSUpdate = options.onFPSUpdate || (() => {});
        this.gl = null;
        this.program = null;
        this.positionBuffer = null;
        
        // Viewport parameters - using higher precision
        this.centerX = options.centerX || -0.5;
        this.centerY = options.centerY || 0.0;
        this.zoom = options.zoom || 0.7;
        this.targetZoom = this.zoom;
        
        // Rendering parameters
        this.maxIterations = 256;
        this.colorScheme = 0;
        this.superSampling = 1; // Anti-aliasing factor
        this.dynamicIterations = true;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 0;
        
        // Interaction state
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.isAnimating = false;
        
        this.init();
    }
    
    init() {
        // Get WebGL 2 context for better precision
        this.gl = this.canvas.getContext('webgl2', {
            antialias: false, // We'll do our own AA
            preserveDrawingBuffer: false,
            powerPreference: 'high-performance'
        });
        
        if (!this.gl) {
            // Fallback to WebGL 1
            this.gl = this.canvas.getContext('webgl', {
                antialias: false,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance'
            });
            
            if (!this.gl) {
                console.error('WebGL not supported');
                if (this.canvas.parentElement) {
                    this.canvas.parentElement.innerHTML = '<div class="webgl-error">WebGL not supported. Please use a modern browser.</div>';
                }
                return;
            }
        }
        
        // Check for required extensions
        const ext = this.gl.getExtension('OES_texture_float');
        const ext2 = this.gl.getExtension('OES_standard_derivatives');
        
        // Set up WebGL
        this.setupShaders();
        this.setupBuffers();
        this.setupControls();
        
        // Initial resize
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Start render loop
        this.render();
    }
    
    setupShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_position;
            
            void main() {
                v_position = a_position;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        // Enhanced fragment shader with better precision and smooth coloring
        const fragmentShaderSource = `
            #ifdef GL_ES
            precision highp float;
            #endif
            
            varying vec2 v_position;
            uniform vec2 u_resolution;
            uniform vec2 u_center;
            uniform float u_zoom;
            uniform int u_maxIterations;
            uniform int u_colorScheme;
            uniform float u_time;
            uniform float u_superSampling;
            
            // Convert HSV to RGB
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            // Smooth coloring function
            vec3 getColor(float iterations, float maxIter) {
                if (iterations >= maxIter) return vec3(0.0);
                
                // Normalized iteration count for smooth gradients
                float normalized = iterations / maxIter;
                float smooth_iter = pow(normalized, 0.5); // Adjust gradient curve
                
                vec3 color;
                
                if (u_colorScheme == 0) {
                    // Classic blue-purple-gold
                    float hue = 0.66 - smooth_iter * 0.4;
                    float sat = 0.7 + smooth_iter * 0.3;
                    float val = smooth_iter * 0.9 + 0.1;
                    color = hsv2rgb(vec3(hue, sat, val));
                    
                } else if (u_colorScheme == 1) {
                    // Fire palette
                    if (smooth_iter < 0.5) {
                        color = mix(vec3(0.0, 0.0, 0.0), vec3(1.0, 0.0, 0.0), smooth_iter * 2.0);
                    } else {
                        color = mix(vec3(1.0, 0.0, 0.0), vec3(1.0, 1.0, 0.0), (smooth_iter - 0.5) * 2.0);
                    }
                    
                } else if (u_colorScheme == 2) {
                    // Ocean depths
                    float hue = 0.55 + smooth_iter * 0.15;
                    float sat = 0.8 - smooth_iter * 0.3;
                    float val = 0.2 + smooth_iter * 0.8;
                    color = hsv2rgb(vec3(hue, sat, val));
                    
                } else if (u_colorScheme == 3) {
                    // Psychedelic rainbow
                    float hue = mod(smooth_iter * 3.0 + u_time * 0.1, 1.0);
                    float sat = 0.8 + sin(smooth_iter * 10.0) * 0.2;
                    float val = 0.5 + smooth_iter * 0.5;
                    color = hsv2rgb(vec3(hue, sat, val));
                    
                } else if (u_colorScheme == 4) {
                    // Monochrome
                    float brightness = pow(smooth_iter, 0.4);
                    color = vec3(brightness);
                }
                
                return color;
            }
            
            // Calculate Mandelbrot with smooth iteration counting
            float mandelbrot(vec2 c) {
                vec2 z = vec2(0.0);
                float escaped = 0.0;
                
                for (int i = 0; i < 2048; i++) {
                    if (i >= u_maxIterations) break;
                    
                    // z = z^2 + c
                    float x = z.x * z.x - z.y * z.y + c.x;
                    float y = 2.0 * z.x * z.y + c.y;
                    z = vec2(x, y);
                    
                    float mag2 = dot(z, z);
                    if (mag2 > 256.0) {
                        // Smooth iteration count
                        escaped = float(i) + 1.0 - log2(log2(mag2) * 0.5);
                        break;
                    }
                    
                    escaped = float(i);
                }
                
                return escaped;
            }
            
            void main() {
                vec3 color = vec3(0.0);
                float samples = u_superSampling;
                float sampleStep = 1.0 / samples;
                
                // Super-sampling for anti-aliasing
                for (float dx = 0.0; dx < 1.0; dx += sampleStep) {
                    for (float dy = 0.0; dy < 1.0; dy += sampleStep) {
                        // Calculate position with sub-pixel offset
                        vec2 pos = v_position;
                        pos += vec2(dx - 0.5, dy - 0.5) * (2.0 / u_resolution) / u_zoom;
                        
                        // Convert to complex plane coordinates
                        vec2 c = pos * 2.0 / u_zoom + u_center;
                        
                        // Calculate Mandelbrot
                        float iterations = mandelbrot(c);
                        
                        // Accumulate color
                        color += getColor(iterations, float(u_maxIterations));
                    }
                }
                
                // Average the samples
                color /= (samples * samples);
                
                // Gamma correction for better visual quality
                color = pow(color, vec3(1.0 / 2.2));
                
                gl_FragColor = vec4(color, 1.0);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) return;
        
        // Create and link program
        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vertexShader);
        this.gl.attachShader(this.program, fragmentShader);
        this.gl.linkProgram(this.program);
        
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            console.error('Program link failed:', this.gl.getProgramInfoLog(this.program));
            return;
        }
        
        // Get uniform and attribute locations
        this.locations = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            center: this.gl.getUniformLocation(this.program, 'u_center'),
            zoom: this.gl.getUniformLocation(this.program, 'u_zoom'),
            maxIterations: this.gl.getUniformLocation(this.program, 'u_maxIterations'),
            colorScheme: this.gl.getUniformLocation(this.program, 'u_colorScheme'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            superSampling: this.gl.getUniformLocation(this.program, 'u_superSampling')
        };
        
        // Clean up shaders
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        
        return shader;
    }
    
    setupBuffers() {
        // Create buffer for full-screen quad
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        
        const positions = new Float32Array([
            -1, -1,  // bottom left
             1, -1,  // bottom right
            -1,  1,  // top left
             1,  1,  // top right
        ]);
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }
    
    setupControls() {
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', () => this.handleTouchEnd());
        
        // Keyboard controls
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    handleMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const dx = (e.clientX - this.lastMouseX) / rect.width;
        const dy = (e.clientY - this.lastMouseY) / rect.height;
        
        // Pan in fractal space
        this.centerX -= dx * 3.0 / this.zoom;
        this.centerY += dy * 3.0 / this.zoom;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.canvas.style.cursor = 'grab';
    }
    
    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) / rect.width * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height * 2 - 1);
        
        // Calculate world coordinates at mouse position
        const worldX = mouseX * 2.0 / this.zoom + this.centerX;
        const worldY = mouseY * 2.0 / this.zoom + this.centerY;
        
        // Zoom
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= zoomFactor;
        this.zoom = Math.max(0.1, Math.min(1e12, this.zoom));
        
        // Adjust center to zoom towards mouse position
        this.centerX = worldX - mouseX * 2.0 / this.zoom;
        this.centerY = worldY - mouseY * 2.0 / this.zoom;
        
        // Update quality based on zoom level
        this.updateQuality();
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            this.isDragging = false;
            // Store initial touch positions for pinch zoom
            this.touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            this.touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
            this.initialDistance = Math.hypot(
                this.touch2.x - this.touch1.x,
                this.touch2.y - this.touch1.y
            );
            this.initialZoom = this.zoom;
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 1 && this.isDragging) {
            const rect = this.canvas.getBoundingClientRect();
            const dx = (e.touches[0].clientX - this.lastMouseX) / rect.width;
            const dy = (e.touches[0].clientY - this.lastMouseY) / rect.height;
            
            this.centerX -= dx * 3.0 / this.zoom;
            this.centerY += dy * 3.0 / this.zoom;
            
            this.lastMouseX = e.touches[0].clientX;
            this.lastMouseY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const newDistance = Math.hypot(
                e.touches[1].clientX - e.touches[0].clientX,
                e.touches[1].clientY - e.touches[0].clientY
            );
            
            this.zoom = this.initialZoom * (newDistance / this.initialDistance);
            this.zoom = Math.max(0.1, Math.min(1e12, this.zoom));
            this.updateQuality();
        }
    }
    
    handleTouchEnd() {
        this.isDragging = false;
    }
    
    handleKeyDown(e) {
        switch(e.key) {
            case 'r':
            case 'R':
                this.reset();
                break;
            case 'c':
            case 'C':
                this.nextColorScheme();
                break;
            case '+':
            case '=':
                this.zoom *= 1.5;
                this.updateQuality();
                break;
            case '-':
            case '_':
                this.zoom /= 1.5;
                this.updateQuality();
                break;
            case 'q':
            case 'Q':
                this.toggleQuality();
                break;
        }
    }
    
    updateQuality() {
        // Dynamically adjust iterations based on zoom level
        if (this.dynamicIterations) {
            const logZoom = Math.log10(this.zoom);
            this.maxIterations = Math.min(2048, Math.floor(100 + logZoom * 100));
            
            // Adjust super-sampling based on zoom
            if (this.zoom < 100) {
                this.superSampling = 2;
            } else if (this.zoom < 10000) {
                this.superSampling = 1.5;
            } else {
                this.superSampling = 1;
            }
        }
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Set canvas size accounting for device pixel ratio
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // Maintain CSS size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    render(time = 0) {
        if (!this.gl || !this.program) return;
        
        // Calculate FPS
        this.frameCount++;
        const deltaTime = time - this.lastTime;
        if (deltaTime >= 1000) {
            this.fps = Math.round(this.frameCount * 1000 / deltaTime);
            this.onFPSUpdate(this.fps);
            this.frameCount = 0;
            this.lastTime = time;
        }
        
        // Clear
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // Use shader program
        this.gl.useProgram(this.program);
        
        // Set up attributes
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.locations.position);
        this.gl.vertexAttribPointer(this.locations.position, 2, this.gl.FLOAT, false, 0, 0);
        
        // Set uniforms
        this.gl.uniform2f(this.locations.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform2f(this.locations.center, this.centerX, this.centerY);
        this.gl.uniform1f(this.locations.zoom, this.zoom);
        this.gl.uniform1i(this.locations.maxIterations, this.maxIterations);
        this.gl.uniform1i(this.locations.colorScheme, this.colorScheme);
        this.gl.uniform1f(this.locations.time, time * 0.001);
        this.gl.uniform1f(this.locations.superSampling, this.superSampling);
        
        // Draw
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        
        // Continue render loop
        requestAnimationFrame((t) => this.render(t));
    }
    
    // Public API methods
    reset() {
        this.centerX = -0.5;
        this.centerY = 0.0;
        this.zoom = 0.7;
        this.updateQuality();
    }
    
    nextColorScheme() {
        this.colorScheme = (this.colorScheme + 1) % 5;
    }
    
    setColorScheme(scheme) {
        this.colorScheme = Math.max(0, Math.min(4, scheme));
    }
    
    toggleQuality() {
        if (this.superSampling > 1) {
            this.superSampling = 1;
        } else {
            this.superSampling = 2;
        }
    }
    
    zoomTo(x, y, targetZoom, duration = 1000) {
        // Animate zoom to specific location
        const startCenterX = this.centerX;
        const startCenterY = this.centerY;
        const startZoom = this.zoom;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-in-out curve
            const eased = progress < 0.5
                ? 2 * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            
            this.centerX = startCenterX + (x - startCenterX) * eased;
            this.centerY = startCenterY + (y - startCenterY) * eased;
            this.zoom = startZoom + (targetZoom - startZoom) * eased;
            
            this.updateQuality();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Get current viewport info
    getViewport() {
        return {
            centerX: this.centerX,
            centerY: this.centerY,
            zoom: this.zoom,
            iterations: this.maxIterations
        };
    }
    
    // Set viewport
    setViewport(viewport) {
        this.centerX = viewport.centerX || this.centerX;
        this.centerY = viewport.centerY || this.centerY;
        this.zoom = viewport.zoom || this.zoom;
        this.updateQuality();
    }
    
    // Destroy and cleanup
    destroy() {
        if (this.gl) {
            this.gl.deleteProgram(this.program);
            this.gl.deleteBuffer(this.positionBuffer);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.resize);
        window.removeEventListener('keydown', this.handleKeyDown);
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MandelbrotWebGL;
}