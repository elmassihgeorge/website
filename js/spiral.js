// Enhanced Golden Spiral and Mathematical Spirals Visualization
let spiralSketch = function(p) {
    let angle = 0;
    let points = [];
    let spiralType = 0; // 0: Golden, 1: Fibonacci, 2: Archimedean, 3: Logarithmic
    let colorMode = 0; // 0: Rainbow trail, 1: Golden gradient, 2: Fire, 3: Ocean
    let animationSpeed = 0.05;
    let maxPoints = 200;
    let showGrid = false;
    let showInfo = true;
    let isPaused = false;
    let particleTrail = [];
    let time = 0;
    
    // Spiral parameters
    let phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    let spiralScale = 3;
    let rotationOffset = 0;
    
    p.setup = function() {
        let canvas = p.createCanvas(300, 250);
        canvas.parent('spiral-container');
        p.colorMode(p.HSB, 360, 100, 100);
        
        // Initialize with some starting points for smoother animation
        initializeSpiral();
        
        // Add controls info
        addControlsInfo();
    };
    
    p.draw = function() {
        if (!isPaused) {
            time += 0.02;
            angle += animationSpeed;
        }
        
        // Dynamic background with subtle gradient
        drawBackground();
        
        p.translate(p.width/2, p.height/2);
        p.rotate(rotationOffset);
        
        if (showGrid) {
            drawGrid();
        }
        
        // Calculate new point based on spiral type
        let point = calculateSpiralPoint(angle);
        
        if (!isPaused) {
            points.push(point);
            
            // Maintain point history
            if (points.length > maxPoints) {
                points.shift();
            }
            
            // Add particle effect
            if (points.length > 5) {
                addParticle(point);
            }
        }
        
        // Draw the spiral
        drawSpiral();
        
        // Draw particle effects
        drawParticles();
        
        // Draw current point
        drawCurrentPoint(point);
        
        // Reset when spiral gets too big
        if (getSpiralRadius(angle) > 120) {
            resetSpiral();
        }
        
        // Reset transform for UI
        p.resetMatrix();
        
        if (showInfo) {
            drawUI();
        }
    };
    
    function initializeSpiral() {
        points = [];
        for (let i = 0; i < 50; i++) {
            let a = i * animationSpeed;
            points.push(calculateSpiralPoint(a));
        }
        angle = 50 * animationSpeed;
    }
    
    function calculateSpiralPoint(a) {
        let r, x, y;
        
        switch(spiralType) {
            case 0: // Golden Spiral
                r = spiralScale * Math.pow(phi, a * 0.1);
                break;
                
            case 1: // Fibonacci Spiral (approximation)
                r = spiralScale * Math.pow(1.618, a * 0.08) * 0.8;
                break;
                
            case 2: // Archimedean Spiral
                r = spiralScale + a * 2;
                break;
                
            case 3: // Logarithmic Spiral
                r = spiralScale * Math.exp(a * 0.1);
                break;
        }
        
        x = r * Math.cos(a);
        y = r * Math.sin(a);
        
        return {x: x, y: y, angle: a, radius: r};
    }
    
    function getSpiralRadius(a) {
        switch(spiralType) {
            case 0: return spiralScale * Math.pow(phi, a * 0.1);
            case 1: return spiralScale * Math.pow(1.618, a * 0.08) * 0.8;
            case 2: return spiralScale + a * 2;
            case 3: return spiralScale * Math.exp(a * 0.1);
        }
    }
    
    function drawBackground() {
        // Animated gradient background
        for (let i = 0; i <= p.height; i += 2) {
            let inter = p.map(i, 0, p.height, 0, 1);
            let c = p.lerpColor(
                p.color(220, 30, 15 + Math.sin(time) * 5),
                p.color(250, 50, 25 + Math.cos(time * 0.7) * 5),
                inter
            );
            p.stroke(c);
            p.line(0, i, p.width, i);
        }
    }
    
    function drawGrid() {
        p.stroke(0, 0, 40, 100);
        p.strokeWeight(0.5);
        
        // Concentric circles
        for (let r = 20; r < 120; r += 20) {
            p.noFill();
            p.circle(0, 0, r * 2);
        }
        
        // Radial lines
        for (let a = 0; a < p.TWO_PI; a += p.PI / 8) {
            p.line(0, 0, Math.cos(a) * 100, Math.sin(a) * 100);
        }
    }
    
    function drawSpiral() {
        if (points.length < 2) return;
        
        p.strokeWeight(1.5);
        p.noFill();
        
        // Draw spiral with gradient colors
        for (let i = 1; i < points.length; i++) {
            let progress = i / points.length;
            let point = points[i];
            let prevPoint = points[i-1];
            
            let col = getSpiralColor(progress, point);
            p.stroke(col);
            
            // Variable line width based on position
            let weight = p.map(progress, 0, 1, 0.5, 3);
            p.strokeWeight(weight);
            
            p.line(prevPoint.x, prevPoint.y, point.x, point.y);
        }
        
        // Draw smoother curve overlay
        p.stroke(0, 0, 100, 150);
        p.strokeWeight(0.8);
        p.noFill();
        p.beginShape();
        for (let point of points) {
            p.curveVertex(point.x, point.y);
        }
        p.endShape();
    }
    
    function getSpiralColor(progress, point) {
        let hue, sat, bright;
        
        switch(colorMode) {
            case 0: // Rainbow trail
                hue = (progress * 360 + time * 50) % 360;
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
                hue = p.map(progress, 0, 1, 180, 240) + Math.sin(time + progress * 10) * 10;
                sat = 70 + Math.cos(progress * p.PI) * 30;
                bright = 50 + progress * 40;
                break;
        }
        
        return p.color(hue, sat, bright, 200);
    }
    
    function addParticle(point) {
        if (p.random() < 0.3) {
            particleTrail.push({
                x: point.x + p.random(-3, 3),
                y: point.y + p.random(-3, 3),
                life: 30,
                maxLife: 30,
                size: p.random(1, 3)
            });
        }
        
        // Remove old particles
        particleTrail = particleTrail.filter(particle => particle.life > 0);
    }
    
    function drawParticles() {
        for (let particle of particleTrail) {
            let alpha = p.map(particle.life, 0, particle.maxLife, 0, 100);
            let size = p.map(particle.life, 0, particle.maxLife, 0, particle.size);
            
            p.fill(60, 100, 100, alpha);
            p.noStroke();
            p.circle(particle.x, particle.y, size);
            
            particle.life--;
        }
    }
    
    function drawCurrentPoint(point) {
        // Pulsing current point
        let pulseSize = 4 + Math.sin(time * 8) * 2;
        
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
    
    function drawUI() {
        // Semi-transparent background
        p.fill(0, 0, 0, 150);
        p.noStroke();
        p.rect(5, 5, 140, 85);
        
        // Info text
        p.fill(0, 0, 100);
        p.textSize(10);
        let spiralNames = ['Golden', 'Fibonacci', 'Archimedean', 'Logarithmic'];
        let colorNames = ['Rainbow', 'Golden', 'Fire', 'Ocean'];
        
        p.text(`Spiral: ${spiralNames[spiralType]}`, 10, 20);
        p.text(`Colors: ${colorNames[colorMode]}`, 10, 35);
        p.text(`Speed: ${(animationSpeed * 20).toFixed(1)}x`, 10, 50);
        p.text(`Points: ${points.length}`, 10, 65);
        p.text(`Status: ${isPaused ? 'Paused' : 'Running'}`, 10, 80);
    }
    
    function addControlsInfo() {
        let container = document.getElementById('spiral-container');
        if (container) {
            let controlsDiv = document.createElement('div');
            controlsDiv.innerHTML = `
                <div style="font-size: 11px; color: #666; margin-top: 10px; line-height: 1.4;">
                    <strong>Controls:</strong><br>
                    • S: change spiral type<br>
                    • C: change colors<br>
                    • Space: pause/resume<br>
                    • G: toggle grid<br>
                    • I: toggle info<br>
                    • +/-: adjust speed<br>
                    • R: reset spiral
                </div>
            `;
            container.appendChild(controlsDiv);
        }
    }
    
    function resetSpiral() {
        angle = 0;
        points = [];
        particleTrail = [];
        rotationOffset += p.random(-0.2, 0.2);
    }
    
    // Keyboard controls
    p.keyPressed = function() {
        switch(p.key.toLowerCase()) {
            case 's':
                spiralType = (spiralType + 1) % 4;
                resetSpiral();
                break;
                
            case 'c':
                colorMode = (colorMode + 1) % 4;
                break;
                
            case ' ':
                isPaused = !isPaused;
                break;
                
            case 'g':
                showGrid = !showGrid;
                break;
                
            case 'i':
                showInfo = !showInfo;
                break;
                
            case '+':
            case '=':
                animationSpeed = Math.min(animationSpeed * 1.2, 0.2);
                break;
                
            case '-':
            case '_':
                animationSpeed = Math.max(animationSpeed * 0.8, 0.01);
                break;
                
            case 'r':
                resetSpiral();
                break;
        }
        return false;
    };
    
    // Mouse interaction
    p.mouseMoved = function() {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            // Subtle mouse influence on spiral
            let mouseInfluence = p.map(p.mouseX, 0, p.width, -0.02, 0.02);
            rotationOffset += mouseInfluence * 0.1;
        }
    };
    
    p.mousePressed = function() {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            // Click to change spiral type
            spiralType = (spiralType + 1) % 4;
            resetSpiral();
            return false;
        }
    };
    
    // Resize handling
    p.windowResized = function() {
        let container = document.getElementById('spiral-container');
        if (container) {
            let newWidth = Math.min(container.offsetWidth, 400);
            let newHeight = Math.floor(newWidth * 0.75);
            p.resizeCanvas(newWidth, newHeight);
        }
    };
};