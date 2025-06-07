// Interactive Globe with Country Highlights
class InteractiveGlobe {
    // Earth texture from NASA
    static EARTH_TEXTURE = 'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg';
    
    // SAT Prep Access Data (0-100 scale)
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
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        
        // Initialize Three.js
        this.init();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 2;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(this.width, this.height);
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Create Earth
        this.createEarth();
        
        // Add controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }
    
    async createEarth() {
        // Create a group to hold the Earth and its highlights
        this.earthGroup = new THREE.Group();
        
        // Create Earth sphere
        const geometry = new THREE.SphereGeometry(1, 64, 64);
        
        // Load Earth texture
        const textureLoader = new THREE.TextureLoader();
        
        // Create base Earth
        const earthMaterial = new THREE.MeshPhongMaterial({
            color: 0x1a237e, // Dark blue base
            specular: new THREE.Color('grey'),
            shininess: 5,
            transparent: true,
            opacity: 0.7
        });
        
        this.earth = new THREE.Mesh(geometry, earthMaterial);
        this.earthGroup.add(this.earth);
        
        // Add country highlights
        await this.addCountryHighlights();
        
        // Add simple atmosphere effect
        const atmosphere = new THREE.Mesh(
            new THREE.SphereGeometry(1.01, 32, 32),
            new THREE.MeshPhongMaterial({
                color: 0x4a7ba6,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            })
        );
        this.earthGroup.add(atmosphere);
        
        this.scene.add(this.earthGroup);
    }
    
    async addCountryHighlights() {
        // Load world countries GeoJSON data
        try {
            const response = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
            const worldData = await response.json();
            
            // Convert to GeoJSON
            const countries = topojson.feature(worldData, worldData.objects.countries);
            
            // Create a group for all country meshes
            const countriesGroup = new THREE.Group();
            
            // Process each country
            countries.features.forEach(feature => {
                const countryCode = feature.id;
                const countryData = InteractiveGlobe.COUNTRY_DATA[countryCode];
                
                if (!countryData) return; // Skip if no data for this country
                
                // Create a shape for the country
                const shape = new THREE.Shape();
                const geometry = new THREE.BufferGeometry();
                
                // Handle MultiPolygon and Polygon types
                const coordinates = feature.geometry.coordinates;
                const isMultiPolygon = feature.geometry.type === 'MultiPolygon';
                
                if (isMultiPolygon) {
                    // For MultiPolygon, take the largest polygon (usually the mainland)
                    let maxArea = 0;
                    let mainPolygon = coordinates[0];
                    
                    coordinates.forEach(polygon => {
                        const area = this.calculatePolygonArea(polygon[0]);
                        if (area > maxArea) {
                            maxArea = area;
                            mainPolygon = polygon;
                        }
                    });
                    
                    this.createCountryShape(shape, mainPolygon[0]);
                } else {
                    // For single Polygon
                    this.createCountryShape(shape, coordinates[0]);
                }
                
                // Create geometry from shape
                const extrudeSettings = {
                    depth: 0.001, // Very small depth for 2.5D effect
                    bevelEnabled: false
                };
                
                const extrudeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                
                // Position on sphere
                const countryMesh = new THREE.Mesh(
                    extrudeGeometry,
                    new THREE.MeshPhongMaterial({
                        color: this.getColorForValue(countryData.value),
                        transparent: true,
                        opacity: 0.8,
                        side: THREE.DoubleSide
                    })
                );
                
                // Scale to fit on sphere
                countryMesh.scale.set(1, 1, 1);
                countryMesh.rotation.x = -Math.PI / 2; // Align with sphere
                
                // Add to group
                countriesGroup.add(countryMesh);
            });
            
            // Add all countries to the Earth group
            this.earthGroup.add(countriesGroup);
            
        } catch (error) {
            console.error('Error loading country data:', error);
            // Fallback to data points if country outline loading fails
            this.addDataPoints();
        }
    }
    
    createCountryShape(shape, coordinates) {
        // Start the shape
        shape.moveTo(coordinates[0][0] * 0.1, coordinates[0][1] * 0.1);
        
        // Add points to the shape
        for (let i = 1; i < coordinates.length; i++) {
            shape.lineTo(coordinates[i][0] * 0.1, coordinates[i][1] * 0.1);
        }
        
        // Close the shape
        shape.closePath();
    }
    
    calculatePolygonArea(coords) {
        // Simple area calculation for comparing polygon sizes
        let area = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            area += coords[i][0] * coords[i + 1][1];
            area -= coords[i + 1][0] * coords[i][1];
        }
        return Math.abs(area) / 2;
    }
    }
    
    // Fallback method to show data points if country outlines fail
    addDataPoints() {
        Object.entries(InteractiveGlobe.COUNTRY_DATA).forEach(([code, data]) => {
            // Skip if no coordinates for this country
            if (!data.lat || !data.lng) return;
            
            // Convert lat/lng to 3D position
            const phi = (90 - data.lat) * (Math.PI / 180);
            const theta = (data.lng + 180) * (Math.PI / 180);
            const radius = 1.01; // Slightly above the Earth's surface
            
            const x = -(radius * Math.sin(phi) * Math.cos(theta));
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);
            
            // Create point
            const geometry = new THREE.SphereGeometry(0.02, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: this.getColorForValue(data.value),
                transparent: true,
                opacity: 0.8
            });
            
            const pointMesh = new THREE.Mesh(geometry, material);
            pointMesh.position.set(x, y, z);
            this.scene.add(pointMesh);
            
            // Add country label
            const label = document.createElement('div');
            label.className = 'country-label';
            label.textContent = data.name;
            label.style.color = this.getColorForValue(data.value).getStyle();
            label.style.position = 'absolute';
            label.style.pointerEvents = 'none';
            label.style.fontSize = '10px';
            label.style.fontWeight = 'bold';
            label.style.textShadow = '0 0 3px rgba(0,0,0,0.8)';
            document.body.appendChild(label);
            
            // Store reference for updating position
            pointMesh.userData = { label, value: data.value };
        });
        
        // Start animation for labels
        this.animateLabels();
    }
    
    animateLabels() {
        if (!this.scene || !this.camera) return;
        
        // Update positions of all labels
        this.scene.children.forEach(child => {
            if (child.userData?.label) {
                const position = new THREE.Vector3();
                child.getWorldPosition(position);
                
                // Convert 3D position to 2D screen position
                position.project(this.camera);
                
                const x = (position.x * 0.5 + 0.5) * window.innerWidth;
                const y = (-(position.y * 0.5) + 0.5) * window.innerHeight;
                
                // Only show label if point is in front of the camera
                const distance = position.z;
                const label = child.userData.label;
                
                if (distance < 1) {
                    label.style.display = 'block';
                    label.style.left = `${x + 10}px`;
                    label.style.top = `${y - 10}px`;
                    label.style.opacity = Math.min(1, 2 - distance * 2);
                } else {
                    label.style.display = 'none';
                }
            }
        });
        
        requestAnimationFrame(() => this.animateLabels());
    }
    }
    
    // Get color based on SAT prep access value
    getColorForValue(value) {
        // Create a color gradient from red (low) to green (high)
        const colors = [
            { value: 0, color: new THREE.Color(0xff6b6b) },    // Red
            { value: 30, color: new THREE.Color(0xffa502) },   // Orange
            { value: 60, color: new THREE.Color(0xffd32a) },   // Yellow
            { value: 80, color: new THREE.Color(0x7bed9f) },   // Light Green
            { value: 100, color: new THREE.Color(0x2ed573) }   // Green
        ];
        
        // Handle values outside the range
        if (value <= colors[0].value) return colors[0].color;
        if (value >= colors[colors.length - 1].value) return colors[colors.length - 1].color;
        
        // Find the two colors to interpolate between
        for (let i = 0; i < colors.length - 1; i++) {
            if (value >= colors[i].value && value <= colors[i + 1].value) {
                const t = (value - colors[i].value) / (colors[i + 1].value - colors[i].value);
                return colors[i].color.clone().lerp(colors[i + 1].color, t);
            }
        }
        
        return colors[0].color; // Fallback
    }
    
    getColorForValue(value) {
        // Create a color gradient from blue (low) to purple (high)
        const colors = [
            { value: 0, color: new THREE.Color(0x4a7ba6) },
            { value: 25, color: new THREE.Color(0x5f97c7) },
            { value: 50, color: new THREE.Color(0x7dbde8) },
            { value: 75, color: new THREE.Color(0x9fd8ff) },
            { value: 100, color: new THREE.Color(0xc7eeff) }
        ];
        
        for (let i = 0; i < colors.length - 1; i++) {
            if (value >= colors[i].value && value <= colors[i + 1].value) {
                const t = (value - colors[i].value) / (colors[i + 1].value - colors[i].value);
                return colors[i].color.clone().lerp(colors[i + 1].color, t);
            }
        }
        
        return colors[0].color;
    }
    
    onWindowResize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.width, this.height);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Auto-rotate
        if (this.earth) {
            this.earth.rotation.y += 0.001;
        }
        
        // Update controls if they exist
        if (this.controls) {
            this.controls.update();
        }
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the globe when the page loads
window.addEventListener('load', () => {
    try {
        const globe = new InteractiveGlobe('map-container');
        
        // Add data points after a short delay to ensure the globe is loaded
        setTimeout(() => {
            globe.addDataPoints();
        }, 1000);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            globe.onWindowResize();
        });
        
    } catch (error) {
        console.error('Error initializing globe:', error);
    }
});
