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
        
        // Create canvas for country highlighting
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const context = canvas.getContext('2d');

        // Create material with base texture
        const material = new THREE.MeshPhongMaterial({
            map: new THREE.CanvasTexture(canvas),
            bumpScale: 0.5,
            specular: new THREE.Color('grey'),
            shininess: 5
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Load and apply world map
        const worldMap = new Image();
        worldMap.crossOrigin = "Anonymous";
        worldMap.onload = () => {
            context.drawImage(worldMap, 0, 0, canvas.width, canvas.height);
            this.highlightCountries(context, canvas.width, canvas.height);
            material.map.needsUpdate = true;
        };
        worldMap.src = 'assets/images/world-map.png';

        // Handle loading error
        worldMap.onerror = (err) => {
            console.error('Error loading world map:', err);
            // Fallback to basic texture if world map fails to load
            material.map = new THREE.TextureLoader().load(InteractiveGlobe.EARTH_TEXTURE);
        };
    }

    highlightCountries(context, width, height) {
        // Load country boundary data
        fetch('assets/data/countries.geojson')
            .then(response => response.json())
            .then(data => {
                data.features.forEach(feature => {
                    const countryCode = feature.properties.ISO_A2;
                    const color = InteractiveGlobe.COUNTRY_DATA[countryCode];
                    
                    if (color) {
                        const coordinates = feature.geometry.coordinates;
                        context.fillStyle = color;
                        context.beginPath();
                        
                        coordinates.forEach(poly => {
                            poly.forEach((coord, i) => {
                                const x = (coord[0] + 180) * (width / 360);
                                const y = (90 - coord[1]) * (height / 180);
                                
                                if (i === 0) context.moveTo(x, y);
                                else context.lineTo(x, y);
                            });
                        });
                        
                        context.fill();
                    }
                });
                
                // Update the texture
                this.globe.material.map.needsUpdate = true;
            });
    }

    createLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(200, 100, 150);
        
        this.scene.add(ambientLight);
        this.scene.add(pointLight);
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

    static EARTH_TEXTURE = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
    static COUNTRY_DATA = {
        // Limited Access (Dark Blue)
        'IN': '#4a7ba6', // India
        'NG': '#4a7ba6', // Nigeria
        'BD': '#4a7ba6', // Bangladesh
        'PK': '#4a7ba6', // Pakistan
        'ID': '#4a7ba6', // Indonesia

        // Below Average (Medium Blue)
        'BR': '#5f97c7', // Brazil
        'MX': '#5f97c7', // Mexico
        'ZA': '#5f97c7', // South Africa
        'EG': '#5f97c7', // Egypt
        'VN': '#5f97c7', // Vietnam

        // Average Access (Light Blue)
        'CN': '#7dbde8', // China
        'RU': '#7dbde8', // Russia
        'TR': '#7dbde8', // Turkey
        'SA': '#7dbde8', // Saudi Arabia
        'AE': '#7dbde8'  // UAE
    };
}

// Initialize the globe when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('map-container');
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('globeCanvas'),
        alpha: true,
        antialias: true
    });

    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.position.z = 200;

    // Create globe
    const radius = 100;
    const segments = 64;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const material = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        bumpScale: 0.5,
        specular: new THREE.Color('grey'),
        shininess: 5
    });

    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(200, 100, 150);
    scene.add(pointLight);

    // Controls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.enableZoom = false;

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    animate();
});
