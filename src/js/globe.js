class InteractiveGlobe {
    constructor() {
        this.container = document.getElementById('map-container');
        if (!this.container) return;
        this.init();
    }

    init() {
        this.createScene();
        this.createGlobe();
        this.createLights();
        this.createControls();
        this.animate();
        this.handleResize();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('globeCanvas'),
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.camera.position.z = 200;
    }

    createGlobe() {
        const radius = 100;
        const segments = 64;
        const geometry = new THREE.SphereGeometry(radius, segments, segments);
        
        // Create canvas for texture
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const context = canvas.getContext('2d');

        // Fill background with ocean color
        context.fillStyle = '#1a4275';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Create material with enhanced properties
        const material = new THREE.MeshPhongMaterial({
            map: new THREE.CanvasTexture(canvas),
            bumpScale: 0.5,
            shininess: 10,
            transparent: true,
            opacity: 0.9
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Draw countries after globe is created
        this.drawCountries(context, canvas.width, canvas.height);
    }

    drawCountries(context, width, height) {
        // Load and draw country outlines
        fetch('assets/data/world-countries.geojson')
            .then(response => response.json())
            .then(geoData => {
                // Draw all country outlines first
                context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                context.lineWidth = 0.5;

                geoData.features.forEach(feature => {
                    context.beginPath();
                    
                    if (feature.geometry.type === 'Polygon') {
                        feature.geometry.coordinates.forEach(ring => {
                            ring.forEach((coord, i) => {
                                const x = (coord[0] + 180) * (width / 360);
                                const y = (90 - coord[1]) * (height / 180);
                                
                                if (i === 0) context.moveTo(x, y);
                                else context.lineTo(x, y);
                            });
                        });
                    } else if (feature.geometry.type === 'MultiPolygon') {
                        feature.geometry.coordinates.forEach(polygon => {
                            polygon.forEach(ring => {
                                ring.forEach((coord, i) => {
                                    const x = (coord[0] + 180) * (width / 360);
                                    const y = (90 - coord[1]) * (height / 180);
                                    
                                    if (i === 0) context.moveTo(x, y);
                                    else context.lineTo(x, y);
                                });
                            });
                        });
                    }
                    context.stroke();
                });

                // Draw highlight dots for specific countries
                const countryCoordinates = {
                    // Limited Access (Warm Red)
                    'IN': { lat: 20.5937, lon: 78.9629, color: '#ff6b6b' }, // India
                    'NG': { lat: 9.0820, lon: 8.6753, color: '#ff6b6b' },   // Nigeria
                    'BD': { lat: 23.6850, lon: 90.3563, color: '#ff6b6b' }, // Bangladesh
                    'PK': { lat: 30.3753, lon: 69.3451, color: '#ff6b6b' }, // Pakistan
                    'ID': { lat: -0.7893, lon: 113.9213, color: '#ff6b6b' }, // Indonesia

                    // Below Average (Orange)
                    'BR': { lat: -14.2350, lon: -51.9253, color: '#ffa557' }, // Brazil
                    'MX': { lat: 23.6345, lon: -102.5528, color: '#ffa557' }, // Mexico
                    'ZA': { lat: -30.5595, lon: 22.9375, color: '#ffa557' },  // South Africa
                    'EG': { lat: 26.8206, lon: 30.8025, color: '#ffa557' },   // Egypt
                    'VN': { lat: 14.0583, lon: 108.2772, color: '#ffa557' },  // Vietnam

                    // Average Access (Yellow)
                    'CN': { lat: 35.8617, lon: 104.1954, color: '#ffd93d' }, // China
                    'RU': { lat: 61.5240, lon: 105.3188, color: '#ffd93d' }, // Russia
                    'TR': { lat: 38.9637, lon: 35.2433, color: '#ffd93d' },  // Turkey
                    'SA': { lat: 23.8859, lon: 45.0792, color: '#ffd93d' },  // Saudi Arabia
                    'AE': { lat: 23.4241, lon: 53.8478, color: '#ffd93d' }   // UAE
                };

                // Draw highlight dots with reduced size
                for (const [country, data] of Object.entries(countryCoordinates)) {
                    const x = (data.lon + 180) * (width / 360);
                    const y = (90 - data.lat) * (height / 180);
                    
                    // Add glow effect
                    const gradient = context.createRadialGradient(x, y, 0, x, y, 15);
                    gradient.addColorStop(0, data.color);
                    gradient.addColorStop(1, 'rgba(0,0,0,0)');
                    
                    context.fillStyle = gradient;
                    context.beginPath();
                    context.arc(x, y, 15, 0, Math.PI * 2);
                    context.fill();
                    
                    // Add center dot
                    context.fillStyle = data.color;
                    context.beginPath();
                    context.arc(x, y, 5, 0, Math.PI * 2);
                    context.fill();
                }

                // Update the texture
                this.globe.material.map.needsUpdate = true;
            });
    }

    createLights() {
        // Ambient light for overall visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(directionalLight);

        // Add rim light for better edge definition
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(-5, -3, -5);
        this.scene.add(rimLight);
    }

    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.enableZoom = false;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.globe.rotation.y += 0.001;
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        });
    }
}

// Initialize the globe when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveGlobe();
});