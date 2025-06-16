// spiral.js - Golden Spiral and Mathematical Sequences Module
class SpiralVisualizer {
    constructor(containerId) {
        this.containerId = containerId;
        this.angle = 0;
        this.points = [];
        this.spiralType = 0;
        this.colorMode = 0;
        this.animationSpeed = 0.05;
        this.maxPoints = 200;
        this.showGrid = false;
        this.showInfo = true;
        this.isPaused = false;
        this.particleTrail = [];
        this.time = 0;
        this.frameCount = 0;
        this.lastFPSUpdate = 0;
        this.fps = 60;
        this.p5Instance = null;
        
        // Mathematical constants
        this.phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
        this.spiralScale = 3;
        this.rotationOffset = 0;
        
        // Spiral definitions
        this.spiralTypes = [
            {
                name: 'Golden Spiral',
                func: (a) => this.spiralScale * Math.pow(this.phi, a * 0.1),
                color: '#FFD700'
            },
            {
                name: 'Fibonacci Spiral',
                func: (a) => this.spiralScale * Math.pow(1.618, a * 0.08) * 0.8,
                color: '#FF6B6B'
            },
            {
                name: 'Archimedean Spiral',
                func: (a) => this.spiralScale + a * 2,
                color: '#4ECDC4'
            },
            {
                name: 'Logarithmic Spiral',
                func: (a) => this.spiralScale * Math.exp(a * 0.1),
                color: '#45B7D1'
            }
        ];
        
        this.colorModes = ['Rainbow Trail', 'Golden Gradient', 'Fire', 'Ocean'];
        
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
                
                this.initializeSpiral();
                this.addControls();
            };
            
            p.draw = () => {
                this.updateFPS();
                
                if (!this.isPaused) {
                    this.time += 0.02;
                    this.angle += this.animationSpeed;
                }
                
                // Dynamic background
                this.drawBackground();
                
                p.translate(p.width/2, p.height/2);
                p.rotate(this.rotationOffset);
                
                if (this.showGrid) {
                    this.drawGrid();
                }
                
                // Calculate new point
                let point = this.calculateSpiralPoint(this.angle);
                
                if (!this.isPaused) {
                    this.points.push(point);
                    
                    if (this.points.length > this.maxPoints) {
                        this.points.shift();
                    }
                    
                    if (this.points.length > 5) {
                        this.addParticle(point);
                    }
                }
                
                // Draw the spiral
                this.drawSpiral();
                this.drawParticles();
                this.drawCurrentPoint(point);
                
                // Reset when spiral gets too big
                if (this.getSpiralRadius(this.angle) > 150) {
                    this.resetSpiral();
                }
                
                p.resetMatrix();
                
                if (this.showInfo) {
                    this.drawUI();
                }
            };
            
            p.keyPressed = () => {
                switch(p.key.toLowerCase()) {
                    case 's':
                        this.spiralType = (this.spiralType + 1) % this.spiralTypes.length;
                        this.resetSpiral();
                        break;
                    case 'c':
                        this.colorMode = (this.colorMode + 1) % this.colorModes.length;
                        break;
                    case ' ':
                        this.isPaused = !this.isPaused;
                        break;
                    case 'g':
                        this.showGrid = !this.showGrid;
                        break;
                    case 'i':
                        this.showInfo = !this.showInfo;
                        break;
                    case '+':
                    case '=':
                        this.animationSpeed = Math.min(this.animationSpeed * 1.2, 0.2);
                        break;
                    case '-':
                    case '_':
                        this.animationSpeed = Math.max(this.animationSpeed * 0.8, 0.01);
                        break;
                    case 'r':
                        this.resetSpiral();
                        break;
                }
                return false;
            };
            
            p.mouseMoved = () => {
                if (this.isInCanvas(p.mouseX, p.mouseY)) {
                    let mouseInfluence = p.map(p.mouseX, 0, p.width, -0.02, 0.02);
                    this.rotationOffset += mouseInfluence * 0.1;
                }
            };
            
            p.mousePressed = () => {
                if (this.isInCanvas(p.mouseX, p.mouseY)) {
                    this.spiralType = (this.spiralType + 1) % this.spiralTypes.length;
                    this.resetSpiral();
                    return false;
                }
            };
        };
        
        new p5(sketch);
    }
    
    isInCanvas(x, y) {
        return x >= 0 && x <= this.p5Instance.width && y >= 0 && y <= this.p5Instance.height;
    }
    
    initializeSpiral() {
        this.points = [];
        for (let i = 0; i < 50; i++) {
            let a = i * this.animationSpeed;
            this.points.push(this.calculateSpiralPoint(a));
        }
        this.angle = 50 * this.animationSpeed;
    }
    
    calculateSpiralPoint(a) {
        let r = this.spiralTypes[this.spiralType].func(a);
        let x = r * Math.cos(a);
        let y = r * Math.sin(a);
        
        return {x: x, y: y, angle: a, radius: r};
    }
    
    getSpiralRadius(a) {
        return this.spiralTypes[this.spiralType].func(a);
    }
    
    drawBackground() {
        const p = this.p5Instance;
        
        for (let i = 0; i <= p.height; i += 2) {
            let inter = p.map(i, 0, p.height, 0, 1);
            let c = p.lerpColor(
                p.color(220, 30, 15 + Math.sin(this.time) * 5),
                p.color(250, 50, 25 + Math.cos(this.time * 0.7) * 5),
                inter
            );
            p.stroke(c);
            p.line(0, i, p.width, i);
        }
    }
    
    drawGrid() {
        const p = this.p5Instance;
        
        p.stroke(0, 0, 40, 100);
        p.strokeWeight(0.5);
        
        // Concentric circles
        for (let r = 20; r < 150; r += 20) {
            p.noFill();
            p.circle(0, 0, r * 2);
        }
        
        // Radial lines
        for (let a = 0; a < p.TWO_PI; a += p.PI / 8) {
            p.line(0, 0, Math.cos(a) * 140, Math.sin(a) * 140);
        }
    }
    
    drawSpiral() {
        const p = this.p5Instance;
        
        if (this.points.length < 2) return;
        
        p.strokeWeight(1.5);
        p.noFill();
        
        for (let i = 1; i < this.points.length; i++) {
            let progress = i / this.points.length;
            let point = this.points[i];
            let prevPoint = this.points[i-1];
            
            let col = this.getSpiralColor(progress, point);
            p.stroke(col);
            
            let weight = p.map(progress, 0, 1, 0.5, 3);
            p.strokeWeight(weight);
            
            p.line(prevPoint.x, prevPoint.y, point.x, point.y);
        }
        
        // Smooth curve overlay
        p.stroke(0, 0, 100, 150);
        p.strokeWeight(0.8);
        p.noFill();
        p.beginShape();
        for (let point of this.points) {
            p.curveVertex(point.x, point.y);
        }
        p.endShape();
    }
    
    getSpiralColor(progress, point) {
        const p = this.p5Instance;
        let hue, sat, bright;
        
        switch(this.colorMode) {
            case 0: // Rainbow trail
                hue = (progress * 360 + this.time * 50) % 360;
                sat = 80 + Math.sin(progress * p.PI) * 20;
                bright = 60 + progress * 40;
                break;
                
            case 1: // Golden gradient
                hue = 45 + Math.sin(progress * p.PI * 2) * 15;
                sat = 70 + progress * 30;
                bright = 50 + progress * 50;
                break;
                
            case 2: // Fire
                hue = p.map(progress, 0, 1, 0, 60);
                sat = 90;
                bright = 40 + progress * 60;
                break;
                
            case 3: // Ocean
                hue = p.map(progress, 0, 1, 180, 240) + Math.sin(this.time + progress * 10) * 10;
                sat = 70 + Math.cos(progress * p.PI) * 30;
                bright = 50 + progress * 40;
                break;
        }
        
        return p.color(hue, sat, bright, 200);
    }
    
    addParticle(point) {
        const p = this.p5Instance;
        
        if (p.random() < 0.3) {
            this.particleTrail.push({
                x: point.x + p.random(-3, 3),
                y: point.y + p.random(-3, 3),
                life: 30,
                maxLife: 30,
                size: p.random(1, 3)
            });
        }
        
        this.particleTrail = this.particleTrail.filter(particle => particle.life > 0);
    }
    
    drawParticles() {
        const p = this.p5Instance;
        
        for (let particle of this.particleTrail) {
            let alpha = p.map(particle.life, 0, particle.maxLife, 0, 100);
            let size = p.map(particle.life, 0, particle.maxLife, 0, particle.size);
            
            p.fill(60, 100, 100, alpha);
            p.noStroke();
            p.circle(particle.x, particle.y, size);
            
            particle.life--;
        }
    }
    
    drawCurrentPoint(point) {
        const p = this.p5Instance;
        
        let pulseSize = 4 + Math.sin(this.time * 8) * 2;
        
        // Outer glow
        p.fill(60, 100, 100, 100);
        p.noStroke();
        p.circle(point.x, point.y, pulseSize * 2);
        
        // Inner point
        p.fill(45, 90, 100);
        p.circle(point.x, point.y, pulseSize);
        
        // Center highlight
        p.fill(60, 50, 100);
        p.circle(point.x, point.y, pulseSize * 0.4);
    }
    
    drawUI() {
        const p = this.p5Instance;
        
        // Semi-transparent background
        p.fill(0, 0, 0, 150);
        p.noStroke();
        p.rect(10, 10, 180, 100);
        
        // Info text
        p.fill(0, 0, 100);
        p.textSize(11);
        p.text(`Spiral: ${this.spiralTypes[this.spiralType].name}`, 20, 30);
        p.text(`Colors: ${this.colorModes[this.colorMode]}`, 20, 45);
        p.text(`Speed: ${(this.animationSpeed * 20).toFixed(1)}x`, 20, 60);
        p.text(`Points: ${this.points.length}`, 20, 75);
        p.text(`Status: ${this.isPaused ? 'Paused' : 'Running'}`, 20, 90);
        p.text(`FPS: ${this.fps}`, 20, 105);
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
                    <div>• S key: change spiral type</div>
                    <div>• C key: change color mode</div>
                    <div>• Spacebar: pause/resume animation</div>
                    <div>• G key: toggle grid display</div>
                    <div>• I key: toggle info panel</div>
                    <div>• +/- keys: adjust animation speed</div>
                    <div>• R key: reset spiral</div>
                    <div>• Mouse: subtle rotation influence</div>
                    <div style="margin-top: 10px; font-style: italic;">Explore the mathematical beauty of spirals!</div>
                </div>
            `;
            container.appendChild(controlsDiv);
        }
    }
    
    resetSpiral() {
        this.angle = 0;
        this.points = [];
        this.particleTrail = [];
        this.rotationOffset += this.p5Instance ? this.p5Instance.random(-0.2, 0.2) : 0;
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
    toggleAnimation() {
        this.isPaused = !this.isPaused;
    }
    
    changeSpiralType() {
        this.spiralType = (this.spiralType + 1) % this.spiralTypes.length;
        this.resetSpiral();
    }
    
    changeColorMode() {
        this.colorMode = (this.colorMode + 1) % this.colorModes.length;
    }
    
    getInfo() {
        return {
            title: 'Golden Spiral & Mathematical Sequences',
            description: 'Interactive visualization of mathematical spirals and the golden ratio',
            spiralType: this.spiralTypes[this.spiralType].name,
            colorMode: this.colorModes[this.colorMode],
            animationSpeed: this.animationSpeed,
            isPaused: this.isPaused,
            fps: this.fps
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpiralVisualizer;
}

// Global factory function
window.createSpiralVisualizer = function(containerId) {
    return new SpiralVisualizer(containerId);
};