// Enhanced Three.js 3D Function Plot with Multiple Mathematical Functions
let threejsInstance = null;

function init3D() {
    if (threejsInstance) {
        threejsInstance.cleanup();
    }
    
    const container = document.getElementById('threejs-container');
    if (!container) {
        console.error('Three.js container not found');
        return;
    }
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create new instance
    threejsInstance = new ThreeJSVisualizer(container);
    threejsInstance.init();
}

class ThreeJSVisualizer {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.mesh = null;
        this.controls = null;
        this.animationId = null;
        
        // State
        this.currentFunction = 0;
        this.isAnimating = true;
        this.animationSpeed = 1.0;
        this.time = 0;
        this.wireframe = true;
        this.colorMode = 0;
        this.resolution = 50;
        
        // Mathematical functions
        this.functions = [
            {
                name: 'Sine Wave',
                func: (x, y, t) => Math.sin(x * y * 2 + t) * 0.5,
                color: 0x4488ff
            },
            {
                name: 'Ripple Effect',
                func: (x, y, t) => Math.sin(Math.sqrt(x*x + y*y) * 3 - t*2) * 0.3,
                color: 0xff4488
            },
            {
                name: 'Saddle Function',
                func: (x, y, t) => (x*x - y*y) * 0.2 + Math.sin(t) * 0.1,
                color: 0x44ff88
            },
            {
                name: 'Gaussian Hills',
                func: (x, y, t) => Math.exp(-(x*x + y*y)) * Math.cos(t) * 0.5,
                color: 0xff8844
            },
            {
                name: 'Twisted Surface',
                func: (x, y, t) => Math.sin(x*2 + t) * Math.cos(y*2 + t) * 0.4,
                color: 0x8844ff
            },
            {
                name: 'Hyperbolic Paraboloid',
                func: (x, y, t) => (x*y) * 0.3 + Math.sin(t * 0.5) * 0.1,
                color: 0x44ffff
            }
        ];
        
        this.colorModes = ['Function', 'Height', 'Gradient', 'Rainbow'];
    }
    
    init() {
        this.setupScene();
        this.setupLighting();
        this.setupMesh();
        this.setupCamera();
        this.setupControls();
        this.addControlsUI();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // Add fog for depth
        this.scene.fog = new THREE.Fog(0x1a1a2e, 5, 15);
        
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(300, 250);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
    }
    
    setupLighting() {
        // Main directional light
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(4, 4, 4);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        this.scene.add(mainLight);
        
        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
        fillLight.position.set(-2, -2, 2);
        this.scene.add(fillLight);
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Point light for highlights
        const pointLight = new THREE.PointLight(0xffffff, 0.8, 10);
        pointLight.position.set(0, 3, 0);
        this.scene.add(pointLight);
    }
    
    setupMesh() {
        const geometry = new THREE.PlaneGeometry(4, 4, this.resolution, this.resolution);
        
        // Create material
        const material = new THREE.MeshPhongMaterial({
            color: this.functions[this.currentFunction].color,
            wireframe: this.wireframe,
            transparent: !this.wireframe,
            opacity: this.wireframe ? 1.0 : 0.8,
            side: THREE.DoubleSide
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.receiveShadow = true;
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
        
        // Add wireframe overlay for solid mode
        if (!this.wireframe) {
            const wireframeGeometry = geometry.clone();
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0x666666,
                wireframe: true,
                transparent: true,
                opacity: 0.2
            });
            this.wireframeMesh = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
            this.scene.add(this.wireframeMesh);
        }
        
        this.updateMesh();
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, 300/250, 0.1, 1000);
        this.camera.position.set(3, 3, 3);
        this.camera.lookAt(0, 0, 0);
    }
    
    setupControls() {
        // Simple mouse controls without external libraries
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;
        let cameraTheta = 0;
        let cameraPhi = Math.PI / 4;
        let cameraRadius = 5;
        
        const canvas = this.renderer.domElement;
        
        canvas.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        canvas.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;
            
            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;
            
            cameraTheta += deltaX * 0.01;
            cameraPhi += deltaY * 0.01;
            cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
            
            mouseX = event.clientX;
            mouseY = event.clientY;
            
            this.updateCameraPosition(cameraTheta, cameraPhi, cameraRadius);
        });
        
        canvas.addEventListener('mouseup', () => {
            isMouseDown = false;
        });
        
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            cameraRadius += event.deltaY * 0.01;
            cameraRadius = Math.max(2, Math.min(10, cameraRadius));
            this.updateCameraPosition(cameraTheta, cameraPhi, cameraRadius);
        });
        
        // Touch controls for mobile
        canvas.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                isMouseDown = true;
                mouseX = event.touches[0].clientX;
                mouseY = event.touches[0].clientY;
            }
        });
        
        canvas.addEventListener('touchmove', (event) => {
            if (!isMouseDown || event.touches.length !== 1) return;
            event.preventDefault();
            
            const deltaX = event.touches[0].clientX - mouseX;
            const deltaY = event.touches[0].clientY - mouseY;
            
            cameraTheta += deltaX * 0.01;
            cameraPhi += deltaY * 0.01;
            cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));
            
            mouseX = event.touches[0].clientX;
            mouseY = event.touches[0].clientY;
            
            this.updateCameraPosition(cameraTheta, cameraPhi, cameraRadius);
        });
        
        canvas.addEventListener('touchend', () => {
            isMouseDown = false;
        });
    }
    
    updateCameraPosition(theta, phi, radius) {
        this.camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
        this.camera.position.y = radius * Math.cos(phi);
        this.camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
        this.camera.lookAt(0, 0, 0);
    }
    
    updateMesh() {
        const geometry = this.mesh.geometry;
        const vertices = geometry.attributes.position.array;
        const colors = [];
        
        const currentFunc = this.functions[this.currentFunction];
        let minZ = Infinity, maxZ = -Infinity;
        
        // First pass: calculate Z values and find min/max
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = currentFunc.func(x, y, this.time);
            vertices[i + 2] = z;
            
            minZ = Math.min(minZ, z);
            maxZ = Math.max(maxZ, z);
        }
        
        // Second pass: assign colors based on mode
        for (let i = 0; i < vertices.length; i += 3) {
            const x = vertices[i];
            const y = vertices[i + 1];
            const z = vertices[i + 2];
            
            let color = this.getVertexColor(x, y, z, minZ, maxZ);
            colors.push(color.r, color.g, color.b);
        }
        
        geometry.attributes.position.needsUpdate = true;
        
        // Update colors if in vertex color mode
        if (this.colorMode > 0) {
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            this.mesh.material.vertexColors = true;
        } else {
            this.mesh.material.vertexColors = false;
            this.mesh.material.color.setHex(currentFunc.color);
        }
        
        // Update wireframe mesh if it exists
        if (this.wireframeMesh) {
            this.wireframeMesh.geometry.attributes.position.needsUpdate = true;
        }
        
        this.mesh.material.needsUpdate = true;
    }
    
    getVertexColor(x, y, z, minZ, maxZ) {
        switch(this.colorMode) {
            case 0: // Function color
                return new THREE.Color(this.functions[this.currentFunction].color);
                
            case 1: // Height-based
                const heightRatio = (z - minZ) / (maxZ - minZ);
                return new THREE.Color().setHSL(0.7 - heightRatio * 0.7, 0.8, 0.5 + heightRatio * 0.3);
                
            case 2: // Gradient
                const distance = Math.sqrt(x*x + y*y) / 2;
                return new THREE.Color().setHSL(distance * 0.5, 0.7, 0.6);
                
            case 3: // Rainbow
                const angle = Math.atan2(y, x) + Math.PI;
                return new THREE.Color().setHSL(angle / (Math.PI * 2), 0.8, 0.6);
                
            default:
                return new THREE.Color(0xffffff);
        }
    }
    
    addControlsUI() {
        const controlsDiv = document.createElement('div');
        controlsDiv.innerHTML = `
            <div style="font-size: 11px; color: #666; margin-top: 10px; line-height: 1.4;">
                <div style="margin-bottom: 8px; font-weight: bold; color: #333;">
                    ${this.functions[this.currentFunction].name}
                </div>
                <div><strong>Controls:</strong></div>
                <div>• Drag to rotate view</div>
                <div>• Scroll to zoom</div>
                <div>• F: change function</div>
                <div>• Space: pause/resume</div>
                <div>• W: toggle wireframe</div>
                <div>• C: change colors</div>
                <div>• +/-: adjust speed</div>
            </div>
        `;
        this.container.appendChild(controlsDiv);
        this.controlsDiv = controlsDiv;
        
        // Add keyboard event listener
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });
    }
    
    handleKeyPress(event) {
        switch(event.key.toLowerCase()) {
            case 'f':
                this.currentFunction = (this.currentFunction + 1) % this.functions.length;
                this.updateFunctionDisplay();
                break;
                
            case ' ':
                this.isAnimating = !this.isAnimating;
                event.preventDefault();
                break;
                
            case 'w':
                this.wireframe = !this.wireframe;
                this.mesh.material.wireframe = this.wireframe;
                this.mesh.material.transparent = !this.wireframe;
                this.mesh.material.opacity = this.wireframe ? 1.0 : 0.8;
                break;
                
            case 'c':
                this.colorMode = (this.colorMode + 1) % this.colorModes.length;
                break;
                
            case '+':
            case '=':
                this.animationSpeed = Math.min(this.animationSpeed * 1.2, 3.0);
                break;
                
            case '-':
            case '_':
                this.animationSpeed = Math.max(this.animationSpeed * 0.8, 0.1);
                break;
        }
    }
    
    updateFunctionDisplay() {
        if (this.controlsDiv) {
            const nameDiv = this.controlsDiv.querySelector('div');
            nameDiv.textContent = this.functions[this.currentFunction].name;
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        if (this.isAnimating) {
            this.time += 0.05 * this.animationSpeed;
        }
        
        this.updateMesh();
        
        // Subtle auto-rotation when not being controlled
        if (this.isAnimating) {
            this.mesh.rotation.z += 0.002;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        const container = this.container;
        if (container) {
            const newWidth = Math.min(container.offsetWidth, 400);
            const newHeight = Math.floor(newWidth * 0.75);
            
            this.camera.aspect = newWidth / newHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(newWidth, newHeight);
        }
    }
    
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.mesh) {
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        if (this.wireframeMesh) {
            this.wireframeMesh.geometry.dispose();
            this.wireframeMesh.material.dispose();
        }
    }
}

// Global resize handler
function resizeVisualizations() {
    if (threejsInstance) {
        threejsInstance.handleResize();
    }
}