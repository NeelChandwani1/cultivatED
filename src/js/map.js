document.addEventListener('DOMContentLoaded', function() {
    // Sample data - in a real app, this would come from an API
    const satPrepData = {
        // North America
        "USA": 90,
        "CAN": 85,
        "MEX": 45,
        // South America
        "BRA": 40,
        "ARG": 50,
        "COL": 35,
        "PER": 30,
        "CHL": 55,
        // Europe
        "GBR": 88,
        "DEU": 85,
        "FRA": 82,
        "ITA": 75,
        "ESP": 70,
        "NLD": 83,
        "SWE": 86,
        "NOR": 85,
        "FIN": 84,
        "DNK": 83,
        "CHE": 87,
        "AUT": 80,
        "BEL": 82,
        // Asia
        "CHN": 60,
        "JPN": 78,
        "KOR": 85,
        "IND": 35,
        "IDN": 25,
        "PAK": 20,
        "BGD": 15,
        "VNM": 30,
        "THA": 40,
        "MYS": 55,
        "SGP": 88,
        "HKG": 87,
        "TWN": 70,
        // Africa
        "ZAF": 45,
        "NGA": 20,
        "EGY": 30,
        "KEN": 25,
        "ETH": 15,
        "GHA": 30,
        "MAR": 35,
        "TUN": 40,
        // Oceania
        "AUS": 82,
        "NZL": 80
    };

    // Create modern color scale with vibrant gradient
    const colorScale = d3.scale.linear()
        .domain([0, 25, 50, 75, 100])
        .range(['#4a7ba6', '#5f97c7', '#7dbde8', '#9fd8ff', '#c7eeff']);
        
    // Add a subtle gradient for the water
    const waterGradient = 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)';

    // Process data for the map
    const dataset = {};
    Object.keys(satPrepData).forEach(countryCode => {
        dataset[countryCode] = {
            fillColor: colorScale(satPrepData[countryCode]),
            fillOpacity: 0.8,
            highlightFillColor: colorScale(satPrepData[countryCode]),
            highlightFillOpacity: 1,
            highlightBorderColor: '#fff',
            highlightBorderWidth: 2,
            highlightBorderOpacity: 1,
            // Store the value for the tooltip
            value: satPrepData[countryCode],
            // Generate a tooltip message based on the score
            tooltipMessage: `${countryCode}: ${getPrepLevel(satPrepData[countryCode])} access to SAT prep`
        };
    });

    // Initialize the map with modern styling
    const map = new Datamap({
        element: document.getElementById('map-container'),
        responsive: true,
        projection: 'mercator',
        fills: { 
            defaultFill: 'rgba(15, 23, 42, 0.7)',
            high: colorScale(100),
            low: colorScale(0)
        },
        // Customize country styling
        geographyConfig: {
            highlightBorderColor: '#fff',
            highlightBorderWidth: 1.5,
            highlightFillColor: function(geo) {
                return geo.fillColor || 'rgba(15, 23, 42, 0.7)';
            },
            highlightFillOpacity: 0.9,
            popupOnHover: true,
            highlightOnHover: true,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 0.8,
            popupTemplate: function(geo, data) {
                if (!data) return;
                return [
                    '<div class="hoverinfo">',
                    '<div class="hoverinfo-header">', geo.properties.name, '</div>',
                    '<div class="hoverinfo-content">SAT Prep Access: <strong>', getPrepLevel(data.value), '</strong></div>',
                    '<div class="hoverinfo-score">', data.value, '/100</div>',
                    '</div>'
                ].join('');
            }
        },
        // Style the bubbles/labels
        bubblesConfig: {
            borderWidth: 1,
            borderOpacity: 0.8,
            borderColor: 'rgba(255, 255, 255, 0.3)'
        },
        // Add a subtle background pattern or gradient
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit')
                .style('stroke', 'rgba(255, 255, 255, 0.08)')
                .style('stroke-width', 0.8);
                
            // Add a subtle gradient to the background
            const defs = datamap.svg.append('defs');
            const gradient = defs.append('linearGradient')
                .attr('id', 'map-bg-gradient')
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '100%');
                
            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', '#0f172a')
                .attr('stop-opacity', 1);
                
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', '#1e293b')
                .attr('stop-opacity', 1);
                
            datamap.svg.select('.datamaps-bg')
                .style('fill', 'url(#map-bg-gradient)');
        },
        data: dataset,
        geographyConfig: {
            highlightBorderColor: '#fff',
            highlightBorderWidth: 2,
            highlightFillColor: function(geo) {
                return geo.fillColor || '#F5F5F5';
            },
            highlightFillOpacity: 0.8,
            popupOnHover: true,
            highlightOnHover: true,
            borderColor: '#aaa',
            borderWidth: 0.5,
            popupTemplate: function(geo, data) {
                if (!data) return;
                return [
                    '<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br/>SAT Prep Access: <strong>', getPrepLevel(data.value), '</strong>',
                    '</div>'
                ].join('');
            }
        },
        setProjection: function(element) {
            const projection = d3.geo.mercator()
                .center([0, 20])  // Center on the equator
                .scale(120)       // Reduced scale to fit more of the world
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            const path = d3.geo.path().projection(projection);
            return { path: path, projection: projection };
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        map.resize();
    });

    // Helper function to get prep level based on score
    function getPrepLevel(score) {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Average';
        if (score >= 20) return 'Below Average';
        return 'Limited';
    }
});
