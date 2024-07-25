let map, markers, freezones;
const emirateColors = {
    'Dubai': '#FF6B6B',
    'Abu Dhabi': '#4ECDC4',
    'Sharjah': '#45B7D1',
    'Ras Al-Khaimah': '#FFA07A',
    'Ajman': '#98D8C8',
    'Umm Al Quwain': '#F7B267',
    'Fujairah': '#C06C84'
};

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    loadFreeZones();
});

function initializeMap() {
    map = L.map('map').setView([24.4539, 54.3773], 7);
    L.tileLayer.provider('CartoDB.Voyager').addTo(map);
}

function loadFreeZones() {
    Papa.parse('FREEZONES.csv', {
        download: true,
        header: true,
        complete: function(results) {
            freezones = results.data;
            populateFilters();
            createMarkers();
            createLegend();
        }
    });
}

function populateFilters() {
    const emirateSelect = document.getElementById('emirate-select');
    const emirates = [...new Set(freezones.map(fz => fz.location))];
    emirates.forEach(emirate => {
        const option = document.createElement('option');
        option.value = emirate;
        option.textContent = emirate;
        emirateSelect.appendChild(option);
    });
    emirateSelect.addEventListener('change', filterFreeZones);
}

function createMarkers() {
    markers = L.layerGroup().addTo(map);
    freezones.forEach(freezone => {
        const marker = L.marker([freezone.latitude, freezone.longitude], {
            icon: createCustomIcon(freezone.location)
        }).addTo(markers);

        marker.bindTooltip(freezone.name, {
            permanent: false,
            direction: 'top'
        });

        marker.on('click', () => showFreeZoneDetails(freezone));
    });
}

function createCustomIcon(emirate) {
    const color = emirateColors[emirate] || '#777777';
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color:${color};" class="marker-pin"></div><i class="fas fa-map-marker-alt" style="color:${color};"></i>`,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
}

function showFreeZoneDetails(freezone) {
    document.getElementById('freezone-name').textContent = freezone.name;
    document.getElementById('freezone-category').textContent = freezone.category || 'No category available';
    const image = document.getElementById('freezone-image');
    image.src = freezone.image_url || 'placeholder.jpg';
    image.alt = freezone.name;
    image.onclick = () => window.open(freezone.official_url, '_blank');

    // Smooth transition for side panel
    const sidePanel = document.getElementById('side-panel');
    sidePanel.style.transform = 'translateX(100%)';
    setTimeout(() => {
        sidePanel.style.transform = 'translateX(0)';
    }, 50);
}

function filterFreeZones() {
    const selectedEmirate = document.getElementById('emirate-select').value;
    markers.clearLayers();

    const filteredFreeZones = freezones.filter(fz => 
        selectedEmirate === 'all' || fz.location === selectedEmirate
    );

    filteredFreeZones.forEach(freezone => {
        const marker = L.marker([freezone.latitude, freezone.longitude], {
            icon: createCustomIcon(freezone.location)
        }).addTo(markers);

        marker.bindTooltip(freezone.name, {
            permanent: false,
            direction: 'top'
        });

        marker.on('click', () => showFreeZoneDetails(freezone));
    });

    // Pan and zoom to the selected emirate
    if (selectedEmirate !== 'all') {
        const bounds = L.latLngBounds(filteredFreeZones.map(fz => [fz.latitude, fz.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        map.setView([24.4539, 54.3773], 7);
    }
}

function createLegend() {
    const legendContent = document.getElementById('legend-content');
    Object.entries(emirateColors).forEach(([emirate, color]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${color};"></div>
            <span>${emirate}</span>
        `;
        legendContent.appendChild(item);
    });
}