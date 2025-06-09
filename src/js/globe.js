class InteractiveGlobe {
    constructor() {
        this.container = document.getElementById('map-container');
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
        
        // Load texture
        const textureLoader = new THREE.TextureLoader();
        const material = new THREE.MeshPhongMaterial({
            map: textureLoader.load(InteractiveGlobe.EARTH_TEXTURE),
            bumpMap: textureLoader.load('assets/images/earth-bump.jpg'),
            bumpScale: 0.5,
            specularMap: textureLoader.load('assets/images/earth-specular.jpg'),
            specular: new THREE.Color('grey'),
            shininess: 5
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
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

    // Keep your existing COUNTRY_DATA static property
    static EARTH_TEXTURE = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
    static COUNTRY_DATA = {
        'USA': { value: 90, name: 'United States' },
        'CAN': { value: 85, name: 'Canada' },
        'GBR': { value: 88, name: 'United Kingdom' },
        'AUS': { value: 82, name: 'Australia' },
        'DEU': { value: 86, name: 'Germany' },
        'FRA': { value: 84, name: 'France' },
        'JPN': { value: 83, name: 'Japan' },
        'KOR': { value: 85, name: 'South Korea' },
        'SGP': { value: 89, name: 'Singapore' },
        'CHN': { value: 75, name: 'China' },
        'IND': { value: 60, name: 'India' },
        'BRA': { value: 65, name: 'Brazil' },
        'ZAF': { value: 58, name: 'South Africa' },
        'NGA': { value: 45, name: 'Nigeria' },
        'KEN': { value: 40, name: 'Kenya' },
        'MEX': { value: 55, name: 'Mexico' },
        'RUS': { value: 70, name: 'Russia' },
        'TUR': { value: 65, name: 'Turkey' },
        'IDN': { value: 50, name: 'Indonesia' },
        'PAK': { value: 48, name: 'Pakistan' },
        'BGD': { value: 45, name: 'Bangladesh' },
        'JPN': { value: 83, name: 'Japan' },
        'PHL': { value: 52, name: 'Philippines' },
        'VNM': { value: 58, name: 'Vietnam' },
        'EGY': { value: 50, name: 'Egypt' },
        'ETH': { value: 42, name: 'Ethiopia' },
        'DZA': { value: 55, name: 'Algeria' },
        'SDN': { value: 40, name: 'Sudan' },
        'IRQ': { value: 45, name: 'Iraq' },
        'AFG': { value: 35, name: 'Afghanistan' },
        'MAR': { value: 58, name: 'Morocco' },
        'PER': { value: 62, name: 'Peru' },
        'VEN': { value: 50, name: 'Venezuela' },
        'MYS': { value: 75, name: 'Malaysia' },
        'SAU': { value: 68, name: 'Saudi Arabia' },
        'UZB': { value: 55, name: 'Uzbekistan' },
        'MMR': { value: 45, name: 'Myanmar' },
        'ARG': { value: 70, name: 'Argentina' },
        'PRK': { value: 30, name: 'North Korea' },
        'TWN': { value: 80, name: 'Taiwan' },
        'ESP': { value: 82, name: 'Spain' },
        'ITA': { value: 80, name: 'Italy' },
        'NLD': { value: 85, name: 'Netherlands' },
        'BEL': { value: 84, name: 'Belgium' },
        'SWE': { value: 86, name: 'Sweden' },
        'POL': { value: 75, name: 'Poland' },
        'UKR': { value: 68, name: 'Ukraine' }
    };
}

// Initialize the globe when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new InteractiveGlobe();
});
