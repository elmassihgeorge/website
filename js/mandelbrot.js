// mandelbrot.js - Enhanced Mandelbrot Set Visualization Module
class MandelbrotVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.maxIterations = 100;
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isMousePressed = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.colorPalette = 0;
        this.renderQuality = 1;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.fps = 60;
        this.p5Instance = null;
        
        this.palettes = [
            { name: 'Classic', hueRange: [200, 300], saturation: 100 },
            { name: 'Fire', hueRange: [0, 60], saturation: 90 },
            { name: 'Ocean', hueRange: [180, 240], saturation: 80 },
            { name: 'Rainbow', hueRange: [0, 360], saturation: 100 }
        ];
        
        this.init();
    }
    
    init() {
        const sketch = (p) => {
            this.p5Instance = p;
            
            p.setup = () => {
                const container = document.getElementById(this.containerId);
                if (!container) {
                    console.error(`Container ${this.containerId} not found`);
                    return;
                }
                
                let canvas = p.createCanvas(600, 400);
                canvas.parent(this.containerId);
                p.colorMode(p.HSB, 360, 100, 100);
                p.pixelDensity(1);
                
                this.drawMandelbrot();
                this.updateFPS();
                this.addControls();
            };
            
            p.draw = () => {
                this.updateFPS();
            };
            
            // Mouse interactions
            p.mousePressed = () => {
                if (this.isInCanvas(p.mouseX, p.mouseY)) {
                    this.isMousePressed = true;
                    this.lastMouseX = p.mouseX;
                    this.lastMouseY = p.mouseY;
                    this.renderQuality = 2;
                    return false;
                }
            };
            
            p.mouseReleased = () => {
                if (this.isMousePressed) {
                    this.isMousePressed = false;
                    this.renderQuality = 1;
                    this.drawMandelbrot();
                }
            };
            
            p.mouseDragged = () => {
                if (this.isMousePressed) {
                    let deltaX = (p.mouseX - this.lastMouseX) / p.width;
                    let deltaY = (p.mouseY - this.lastMouseY) / p.height;
                    
                    this.offsetX -= deltaX * (4.0 / this.zoom);
                    this.offsetY -= deltaY * (3.0 / this.zoom);
                    
                    this.lastMouseX = p.mouseX;
                    this.lastMouseY = p.mouseY;
                    this.drawMandelbrot();
                }
                return false;
            };
            
            p.mouseWheel = (event) => {
                if (this.isInCanvas(p.mouseX, p.mouseY)) {
                    let zoomFactor = event.delta > 0 ? 0.9 : 1.1;
                    
                    // Zoom towards mouse position
                    let mouseXNorm = p.map(p.mouseX, 0, p.width, -2.5/this.zoom + this.offsetX, 1.5/this.zoom + this.offsetX);
                    let mouseYNorm = p.map(p.mouseY, 0, p.height, -1.5/this.zoom + this.offsetY, 1.5/this.zoom + this.offsetY);
                    
                    this.zoom *= zoomFactor;
                    this.zoom = p.constrain(this.zoom, 0.1, 1000);
                    
                    // Adjust offset to zoom towards mouse
                    this.offsetX = mouseXNorm - (mouseXNorm - this.offsetX) * zoomFactor;
                    this.offsetY = mouseYNorm - (mouseYNorm - this.offsetY) * zoomFactor;
                    
                    this.maxIterations = p.constrain(50 + p.floor(this.zoom * 10), 50, 200);
                    this.drawMandelbrot();
                    return false;
                }
            };
            
            p.keyPressed = () => {
                switch(p.key.toLowerCase()) {
                    case 'c':
                        this.colorPalette = (this.colorPalette + 1) % this.palettes.length;
                        this.drawMandelbrot();
                        break;
                    case 'r':
                        this.reset();
                        break;
                    case 'q':
                        this.renderQuality = this.renderQuality === 1 ? 2 : 1;
                        this.drawMandelbrot();
                        break;
                }
                return false;
            };
        };
        
        new p5(sketch);
    }
    
    isInCanvas(x, y) {
        return x >= 0 && x <= this.p5Instance.width && y >= 0 && y <= this.p5Instance.height;
    }
    
    drawMandelbrot() {
        if (!this.p5Instance) return;
        
        const p = this.p5Instance;
        p.loadPixels();
        let step = this.renderQuality;
        
        for (let x = 0; x < p.width; x += step) {
            for (let y = 0; y < p.height; y += step) {
                let iterations = this.calculateMandelbrot(x, y);
                let color = this.getColor(iterations);
                
                // Fill pixels based on render quality
                for (let dx = 0; dx < step && x + dx < p.width; dx++) {
                    for (let dy = 0; dy < step && y + dy < p.height; dy++) {
                        let pix = ((x + dx) + (y + dy) * p.width) * 4;
                        p.pixels[pix + 0] = p.red(color);
                        p.pixels[pix + 1] = p.green(color);
                        p.pixels[pix + 2] = p.blue(color);
                        p.pixels[pix + 3] = 255;
                    }
                }
            }
        }
        p.updatePixels();
        this.drawUI();
    }
    
    calculateMandelbrot(x, y) {
        const p = this.p5Instance;
        let a = p.map(x, 0, p.width, -2.5/this.zoom + this.offsetX, 1.5/this.zoom + this.offsetX);
        let b = p.map(y, 0, p.height, -1.5/this.zoom + this.offsetY, 1.5/this.zoom + this.offsetY);
        
        let ca = a, cb = b, n = 0, za = a, zb = b;
        
        while (n < this.maxIterations) {
            let aa = za * za - zb * zb;
            let bb = 2 * za * zb;
            za = aa + ca;
            zb = bb + cb;
            
            if (za * za + zb * zb > 4) {
                return n + 1 - p.log(p.log(p.sqrt(za*za + zb*zb)))/p.log(2);
            }
            n++;
        }
        return this.maxIterations;
    }
    
    getColor(iterations) {
        const p = this.p5Instance;
        if (iterations >= this.maxIterations) return p.color(0, 0, 0);
        
        let palette = this.palettes[this.colorPalette];
        let hue = p.map(iterations % 80, 0, 80, palette.hueRange[0], palette.hueRange[1]);
        let sat = palette.saturation;
        let bright = p.map(iterations, 0, this.maxIterations, 20, 100);
        
        return p.color(hue, sat, bright);
    }
    
    drawUI() {
        const p = this.p5Instance;
        
        // Semi-transparent overlay
        p.fill(0, 0, 0, 150);
        p.noStroke();
        p.rect(10, 10, 160, 70);
        
        // Info text
        p.fill(255);
        p.textSize(12);
        p.text(`Zoom: ${this.zoom.toFixed(2)}x`, 20, 30);
        p.text(`Palette: ${this.palettes[this.colorPalette].name}`, 20, 45);
        p.text(`Quality: ${this.renderQuality === 1 ? 'High' : 'Fast'}`, 20, 60);
        p.text(`FPS: ${this.fps}`, 20, 75);
        
        // Performance indicator
        const container = document.getElementById(this.containerId);
        if (container) {
            let badge = container.querySelector('.performance-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'performance-badge';
                badge.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0, 0, 0, 0.7);
                    color: #00d4aa;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-family: 'JetBrains Mono', monospace;
                `;
                container.appendChild(badge);
            }
            badge.textContent = `${this.fps} FPS`;
        }
    }
    
    updateFPS() {
        this.frameCount++;
        if (this.p5Instance && this.p5Instance.millis() - this.lastFPSUpdate > 1000) {
            this.fps = Math.round(this.frameCount * 1000 / (this.p5Instance.millis() - this.lastFPSUpdate));
            this.frameCount = 0;
            this.lastFPSUpdate = this.p5Instance.millis();
        }
    }
    
    addControls() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        let controlsDiv = container.querySelector('.module-controls');
        if (!controlsDiv) {
            controlsDiv = document.createElement('div');
            controlsDiv.className = 'module-controls';
            controlsDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 15px; background: rgba(0, 0, 0, 0.3); border-radius: 8px; font-size: 11px; color: #a0a9c0; font-family: 'JetBrains Mono', monospace;">
                    <div style="margin-bottom: 10px; font-weight: bold; color: #00d4aa;">Controls:</div>
                    <div>• Click & drag to pan the view</div>
                    <div>• Mouse wheel to zoom in/out</div>
                    <div>• C key: cycle color palettes</div>
                    <div>• Q key: toggle render quality</div>
                    <div>• R key: reset to initial view</div>
                    <div style="margin-top: 10px; font-style: italic;">Explore the infinite complexity of the Mandelbrot set!</div>
                </div>
            `;
            container.appendChild(controlsDiv);
        }
    }
    
    reset() {
        this.zoom = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.maxIterations = 100;
        this.drawMandelbrot();
    }
    
    destroy() {
        if (this.p5Instance) {
            this.p5Instance.remove();
            this.p5Instance = null;
        }
        
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
    
    // Public API methods
    changeColorPalette() {
        this.colorPalette = (this.colorPalette + 1) % this.palettes.length;
        this.drawMandelbrot();
    }
    
    toggleQuality() {
        this.renderQuality = this.renderQuality === 1 ? 2 : 1;
        this.drawMandelbrot();
    }
    
    getInfo() {
        return {
            title: 'Mandelbrot Set Explorer',
            description: 'Interactive exploration of the famous fractal through complex number iteration',
            zoom: this.zoom,
            iterations: this.maxIterations,
            palette: this.palettes[this.colorPalette].name,
            fps: this.fps
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MandelbrotVisualizer;
}

// Global factory function
window.createMandelbrotVisualizer = function(containerId) {
    return new MandelbrotVisualizer(containerId);
};