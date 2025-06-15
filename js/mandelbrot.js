// Enhanced Mandelbrot Set Visualization with Interactive Features
let mandelbrotSketch = function(p) {
    let maxIterations = 100;
    let zoom = 1;
    let offsetX = 0;
    let offsetY = 0;
    let isMousePressed = false;
    let lastMouseX, lastMouseY;
    let isAnimating = false;
    let animationFrame = 0;
    let colorPalette = 0; // 0: classic, 1: fire, 2: ocean, 3: rainbow
    let renderQuality = 1; // 1: full quality, 2: half quality for performance
    
    // Performance tracking
    let renderTime = 0;
    let frameBuffer;
    
    p.setup = function() {
        let canvas = p.createCanvas(300, 250);
        canvas.parent('mandelbrot-container');
        p.colorMode(p.HSB, 360, 100, 100);
        
        // Create off-screen buffer for smoother rendering
        frameBuffer = p.createGraphics(p.width, p.height);
        frameBuffer.colorMode(p.HSB, 360, 100, 100);
        
        // Initial render
        drawMandelbrot();
        
        // Add controls info
        addControlsInfo();
    };
    
    p.draw = function() {
        if (isAnimating) {
            animateZoom();
        }
    };
    
    function drawMandelbrot() {
        let startTime = p.millis();
        
        frameBuffer.loadPixels();
        let step = renderQuality;
        
        for (let x = 0; x < p.width; x += step) {
            for (let y = 0; y < p.height; y += step) {
                let iterations = calculateMandelbrot(x, y);
                let colors = getColorFromPalette(iterations);
                
                // Fill pixels based on render quality
                for (let dx = 0; dx < step && x + dx < p.width; dx++) {
                    for (let dy = 0; dy < step && y + dy < p.height; dy++) {
                        let pix = ((x + dx) + (y + dy) * p.width) * 4;
                        frameBuffer.pixels[pix + 0] = colors.r;
                        frameBuffer.pixels[pix + 1] = colors.g;
                        frameBuffer.pixels[pix + 2] = colors.b;
                        frameBuffer.pixels[pix + 3] = 255;
                    }
                }
            }
        }
        
        frameBuffer.updatePixels();
        p.image(frameBuffer, 0, 0);
        
        renderTime = p.millis() - startTime;
        
        // Draw UI overlay
        drawUI();
    }
    
    function calculateMandelbrot(x, y) {
        let a = p.map(x, 0, p.width, -2.5/zoom + offsetX, 1.5/zoom + offsetX);
        let b = p.map(y, 0, p.height, -1.5/zoom + offsetY, 1.5/zoom + offsetY);
        
        let ca = a;
        let cb = b;
        let n = 0;
        let za = a;
        let zb = b;
        
        while (n < maxIterations) {
            let aa = za * za - zb * zb;
            let bb = 2 * za * zb;
            za = aa + ca;
            zb = bb + cb;
            
            if (za * za + zb * zb > 4) {
                // Smooth coloring using continuous iteration count
                let smoothN = n + 1 - p.log(p.log(p.sqrt(za*za + zb*zb)))/p.log(2);
                return smoothN;
            }
            n++;
        }
        
        return maxIterations;
    }
    
    function getColorFromPalette(iterations) {
        if (iterations >= maxIterations) {
            return {r: 0, g: 0, b: 0}; // Black for points in the set
        }
        
        let normalizedIterations = iterations / maxIterations;
        let hue, sat, bright;
        
        switch(colorPalette) {
            case 0: // Classic blue-purple
                hue = p.map(iterations % 80, 0, 80, 200, 300);
                sat = 100;
                bright = p.map(iterations, 0, maxIterations, 20, 100);
                break;
                
            case 1: // Fire palette
                hue = p.map(iterations % 60, 0, 60, 0, 60);
                sat = p.map(iterations, 0, maxIterations, 70, 100);
                bright = p.map(iterations, 0, maxIterations, 30, 100);
                break;
                
            case 2: // Ocean palette
                hue = p.map(iterations % 100, 0, 100, 180, 240);
                sat = 80;
                bright = p.map(iterations, 0, maxIterations, 40, 90);
                break;
                
            case 3: // Rainbow
                hue = (iterations * 7) % 360;
                sat = 100;
                bright = p.map(iterations, 0, maxIterations, 50, 100);
                break;
        }
        
        let col = p.color(hue, sat, bright);
        return {
            r: p.red(col),
            g: p.green(col),
            b: p.blue(col)
        };
    }
    
    function drawUI() {
        // Semi-transparent overlay for info
        p.fill(0, 0, 0, 150);
        p.noStroke();
        p.rect(5, 5, 140, 60);
        
        // Info text
        p.fill(255);
        p.textSize(10);
        p.text(`Zoom: ${zoom.toFixed(2)}x`, 10, 20);
        p.text(`Quality: ${renderQuality === 1 ? 'High' : 'Fast'}`, 10, 35);
        p.text(`Render: ${renderTime}ms`, 10, 50);
        
        // Color palette indicator
        let paletteNames = ['Classic', 'Fire', 'Ocean', 'Rainbow'];
        p.text(`Palette: ${paletteNames[colorPalette]}`, 10, 65);
    }
    
    function addControlsInfo() {
        // Add controls information below the canvas
        let container = document.getElementById('mandelbrot-container');
        if (container) {
            let controlsDiv = document.createElement('div');
            controlsDiv.innerHTML = `
                <div style="font-size: 11px; color: #666; margin-top: 10px; line-height: 1.4;">
                    <strong>Controls:</strong><br>
                    • Click & drag to pan<br>
                    • Mouse wheel to zoom<br>
                    • Space: toggle animation<br>
                    • C: change colors<br>
                    • Q: toggle quality<br>
                    • R: reset view
                </div>
            `;
            container.appendChild(controlsDiv);
        }
    }
    
    // Mouse interactions
    p.mousePressed = function() {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            isMousePressed = true;
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
            renderQuality = 2; // Lower quality during interaction
            return false;
        }
    };
    
    p.mouseReleased = function() {
        if (isMousePressed) {
            isMousePressed = false;
            renderQuality = 1; // Full quality after interaction
            drawMandelbrot();
        }
    };
    
    p.mouseDragged = function() {
        if (isMousePressed) {
            let deltaX = (p.mouseX - lastMouseX) / p.width;
            let deltaY = (p.mouseY - lastMouseY) / p.height;
            
            offsetX -= deltaX * (4.0 / zoom);
            offsetY -= deltaY * (3.0 / zoom);
            
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
            
            drawMandelbrot();
        }
        return false;
    };
    
    p.mouseWheel = function(event) {
        if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
            let zoomFactor = event.delta > 0 ? 0.9 : 1.1;
            
            // Zoom towards mouse position
            let mouseXNorm = p.map(p.mouseX, 0, p.width, -2.5/zoom + offsetX, 1.5/zoom + offsetX);
            let mouseYNorm = p.map(p.mouseY, 0, p.height, -1.5/zoom + offsetY, 1.5/zoom + offsetY);
            
            zoom *= zoomFactor;
            zoom = p.constrain(zoom, 0.1, 1000);
            
            // Adjust offset to zoom towards mouse
            offsetX = mouseXNorm - (mouseXNorm - offsetX) * zoomFactor;
            offsetY = mouseYNorm - (mouseYNorm - offsetY) * zoomFactor;
            
            maxIterations = p.constrain(50 + p.floor(zoom * 10), 50, 200);
            
            drawMandelbrot();
            return false;
        }
    };
    
    // Keyboard interactions
    p.keyPressed = function() {
        switch(p.key.toLowerCase()) {
            case ' ':
                isAnimating = !isAnimating;
                if (isAnimating) {
                    p.loop();
                } else {
                    p.noLoop();
                }
                break;
                
            case 'c':
                colorPalette = (colorPalette + 1) % 4;
                drawMandelbrot();
                break;
                
            case 'q':
                renderQuality = renderQuality === 1 ? 2 : 1;
                drawMandelbrot();
                break;
                
            case 'r':
                zoom = 1;
                offsetX = 0;
                offsetY = 0;
                maxIterations = 100;
                drawMandelbrot();
                break;
        }
        return false;
    };
    
    function animateZoom() {
        animationFrame++;
        let zoomSpeed = 1.02;
        zoom *= zoomSpeed;
        
        if (zoom > 100) {
            zoom = 1;
            offsetX = (p.random(-1, 1) * 0.5);
            offsetY = (p.random(-1, 1) * 0.5);
        }
        
        maxIterations = p.constrain(50 + p.floor(zoom * 5), 50, 150);
        
        if (animationFrame % 3 === 0) { // Update every 3 frames for performance
            drawMandelbrot();
        }
    }
    
    // Resize handling
    p.windowResized = function() {
        // Maintain aspect ratio and update canvas
        let container = document.getElementById('mandelbrot-container');
        if (container) {
            let newWidth = Math.min(container.offsetWidth, 400);
            let newHeight = Math.floor(newWidth * 0.75);
            p.resizeCanvas(newWidth, newHeight);
            frameBuffer = p.createGraphics(p.width, p.height);
            frameBuffer.colorMode(p.HSB, 360, 100, 100);
            drawMandelbrot();
        }
    };
};