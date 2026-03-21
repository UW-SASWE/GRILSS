import './style.css'
import L from 'leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster'

// Globals
let map;
let geojsonData;
let clusterGroup;
let nonClusterLayer = L.layerGroup();
let currentGeoJsonLayer = null;
let selectedFeature = null;

const filters = { continent: '', country: '', basin: '' };

const els = {
    leftSidebar: document.getElementById('left-sidebar'),
    rightSidebar: document.getElementById('right-sidebar'),
    toggleLeft: document.getElementById('toggle-left-sidebar'),
    toggleRight: document.getElementById('toggle-right-sidebar'),
    closeLeft: document.getElementById('close-left-panel'),
    closeRight: document.getElementById('close-right-panel'),
    continent: document.getElementById('continent-filter'),
    country: document.getElementById('country-filter'),
    basin: document.getElementById('basin-filter'),
    continentList: document.getElementById('continent-list'),
    countryList: document.getElementById('country-list'),
    basinList: document.getElementById('basin-list'),
    resetBtn: document.getElementById('reset-filters'),
    statTotal: document.getElementById('stat-total'),
    toggleClusters: document.getElementById('toggle-clusters'),
    toggleScale: document.getElementById('toggle-scale'),
    capLossGauge: document.getElementById('cap-loss-gauge'),
    sedRateGauge: document.getElementById('sed-rate-gauge'),
    emptySelection: document.getElementById('empty-selection'),
    damDetails: document.getElementById('dam-details'),
    btnCatchment: document.getElementById('btn-show-catchment'),
    btnReservoir: document.getElementById('btn-show-reservoir'),
    btnClearGeom: document.getElementById('btn-clear-geom')
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  initMap();
  setupUI();
  await loadData();
}

function initMap() {
  map = L.map('map', { zoomControl: false }).setView([20, 0], 3);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>'
  }).addTo(map);
  
  clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        return L.divIcon({ html: '<div><span>' + count + '</span></div>', className: 'marker-cluster marker-cluster-neutral', iconSize: L.point(40, 40) });
      }
  });
  map.addLayer(clusterGroup); // Initial mode
}

function setupUI() {
    els.toggleLeft.addEventListener('click', () => els.leftSidebar.classList.toggle('collapsed'));
    els.toggleRight.addEventListener('click', () => els.rightSidebar.classList.toggle('hidden'));
    
    els.closeLeft.addEventListener('click', () => els.leftSidebar.classList.add('collapsed'));
    els.closeRight.addEventListener('click', () => els.rightSidebar.classList.add('hidden'));

    els.continent.addEventListener('input', (e) => onFilterChange('continent', e.target.value));
    els.country.addEventListener('input', (e) => onFilterChange('country', e.target.value));
    els.basin.addEventListener('input', (e) => onFilterChange('basin', e.target.value));
    els.resetBtn.addEventListener('click', resetFilters);

    els.toggleClusters.addEventListener('change', renderMarkers);
    els.toggleScale.addEventListener('change', renderMarkers);

    els.btnCatchment.addEventListener('click', () => fetchGeometry('catchments'));
    els.btnReservoir.addEventListener('click', () => fetchGeometry('reservoirs'));
    els.btnClearGeom.addEventListener('click', clearGeometry);
}

async function loadData() {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data.geojson');
    if (!res.ok) throw new Error();
    geojsonData = await res.json();
    populateDatalists();
    renderMarkers();
  } catch (err) { console.error(err); }
}

function populateDatalists() {
    const cs = new Set(), co = new Set(), ba = new Set();
    geojsonData.features.forEach(f => {
        const p = f.properties;
        if (p.Continent) cs.add(p.Continent);
        if (p.Country) co.add(p.Country);
        if (p['Major River Basin']) ba.add(p['Major River Basin']);
    });
    [...cs].sort().forEach(c => els.continentList.appendChild(new Option(c)));
    [...co].sort().forEach(c => els.countryList.appendChild(new Option(c)));
    [...ba].sort().forEach(c => els.basinList.appendChild(new Option(c)));
}

function onFilterChange(k, v) { filters[k] = v.toLowerCase(); renderMarkers(); }
function resetFilters() {
    els.continent.value = ''; els.country.value = ''; els.basin.value = '';
    filters.continent = ''; filters.country = ''; filters.basin = '';
    renderMarkers();
}

// Marker Icon logic
const createSVGMarker = (color, scaleRadius) => {
    // scale up SVG dynamically based on radius. Default radius ~24x32
    // If scaleRadius is e.g. 1, width=24. If scaleRadius=1.5, width=36
    const w = 24 * scaleRadius;
    const h = 32 * scaleRadius;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" class="custom-drop-marker" style="width:${w}px; height:${h}px;">
      <path fill="${color}" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5" fill="#fff"/>
    </svg>`;
    return L.divIcon({ className: '', html: svg, iconSize: [w, h], iconAnchor: [w/2, h], popupAnchor: [0, -h] });
}

function getColor(lossRate) {
  if (lossRate === undefined || lossRate === null) return '#94a3b8';
  if (lossRate >= 2.25) return '#ef4444'; // Red (Severe)
  if (lossRate >= 1.0) return '#f59e0b'; // Amber (High)
  if (lossRate >= 0.5) return '#4ade80'; // Light Green (Medium)
  return '#15803d'; // Dark Green (Low)
}

function renderMarkers() {
    clusterGroup.clearLayers();
    nonClusterLayer.clearLayers();
    
    // Manage Layers
    const useClusters = els.toggleClusters.checked;
    const useScale = els.toggleScale.checked;

    if (useClusters) {
        if (!map.hasLayer(clusterGroup)) map.addLayer(clusterGroup);
        if (map.hasLayer(nonClusterLayer)) map.removeLayer(nonClusterLayer);
    } else {
        if (!map.hasLayer(nonClusterLayer)) map.addLayer(nonClusterLayer);
        if (map.hasLayer(clusterGroup)) map.removeLayer(clusterGroup);
    }

    let totalSedRate = 0, count = 0, totalLossRate = 0, lossRateCount = 0;

    const filtered = geojsonData.features.filter(f => {
        const p = f.properties;
        return (p.Continent||'').toLowerCase().includes(filters.continent) &&
               (p.Country||'').toLowerCase().includes(filters.country) &&
               (p['Major River Basin']||'').toLowerCase().includes(filters.basin);
    });

    const markers = filtered.map(f => {
        const p = f.properties;
        const sedRate = p['Avg Sedimentation Rate (MCM/year)'] || 0;
        const lossRate = p['Avg Capacity Loss Rate (%/year)'];
        const capacity = p['Original Built Capacity (MCM)'] || 10;
        
        count++;
        totalSedRate += sedRate;
        if (lossRate !== undefined && lossRate !== null) {
            totalLossRate += lossRate; lossRateCount++;
        }

        let scale = 1.0;
        if (useScale) {
            scale = 0.8 + Math.pow(capacity, 0.25) * 0.1; 
            scale = Math.min(2.5, scale); // Cap the max scaling
        }

        const icon = createSVGMarker(getColor(lossRate), scale);
        const mk = L.marker([p.Latitude, p.Longitude], { icon });
        mk.on('click', () => showDetails(f));
        mk.bindTooltip(`<b>${p.Reservoir||'Unknown'}</b><br>${p.Country||''}`, { direction: 'top' });
        return mk;
    });

    if (useClusters) {
        clusterGroup.addLayers(markers);
    } else {
        markers.forEach(m => nonClusterLayer.addLayer(m));
    }

    if (markers.length > 0 && markers.length < geojsonData.features.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [50, 50], maxZoom: 10 });
    } else if (markers.length === geojsonData.features.length) {
        map.setView([20, 0], 3);
    }

    els.statTotal.innerText = count;

    const avgLossRate = lossRateCount > 0 ? (totalLossRate / lossRateCount) : 0;
    const avgSedRate = count > 0 ? (totalSedRate / count) : 0;
    
    drawSpeedometer(els.capLossGauge, avgLossRate, 7, '%/yr');
    drawSpeedometer(els.sedRateGauge, avgSedRate, 70, 'MCM/yr');
}

function formatVal(val, initialPlaces = 2) {
    if (val === null || val === undefined) return 'N/A';
    if (val === 0) return val.toFixed(initialPlaces);
    
    let currentPlaces = initialPlaces;
    let s = val.toFixed(currentPlaces);
    
    if (parseFloat(s) !== 0) return s;
    
    for (const p of [4, 6, 8]) {
        if (p <= currentPlaces) continue;
        s = val.toFixed(p);
        if (parseFloat(s) !== 0) return s;
    }
    
    return val.toFixed(8);
}

function polarToCartesian(cx, cy, r, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
  return { x: cx + (r * Math.cos(angleInRadians)), y: cy + (r * Math.sin(angleInRadians)) };
}

function describeArc(cx, cy, r, startAngle, endAngle){
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

// Custom Multi-color SVG Speedometer
function drawSpeedometer(container, val, maxVal, label) {
    const rawVal = val;
    val = Math.max(0, Math.min(val, maxVal)); // Clamp for visual presentation
    
    const ranges = maxVal === 7 ? [
        { start: 0, end: 0.5, color: '#15803d' },
        { start: 0.5, end: 1.0, color: '#4ade80' },
        { start: 1.0, end: 2.25, color: '#f59e0b' },
        { start: 2.25, end: 7, color: '#ef4444' }
    ] : [
        { start: 0, end: 5, color: '#15803d' },
        { start: 5, end: 10, color: '#4ade80' },
        { start: 10, end: 22.5, color: '#f59e0b' },
        { start: 22.5, end: 70, color: '#ef4444' }
    ];

    let arcsHtml = '';
    ranges.forEach(r => {
        if(r.start >= maxVal) return;
        const s = Math.max(0, r.start);
        const e = Math.min(maxVal, r.end);
        const a1 = (s / maxVal) * 180;
        const a2 = (e / maxVal) * 180;
        arcsHtml += `<path d="${describeArc(100, 100, 80, a1, a2)}" fill="none" stroke="${r.color}" stroke-width="20" />`;
    });

    const tickInterval = maxVal === 7 ? 1 : 10;
    let ticksHtml = '';
    for(let i=0; i<=maxVal; i+=tickInterval) {
        const angle = (i / maxVal) * 180;
        const labelPos = polarToCartesian(100, 100, 55, angle);
        const tickStart = polarToCartesian(100, 100, 70, angle);
        const tickEnd = polarToCartesian(100, 100, 90, angle);
        
        ticksHtml += `<line x1="${tickStart.x}" y1="${tickStart.y}" x2="${tickEnd.x}" y2="${tickEnd.y}" stroke="#fff" stroke-width="2" />`;
        ticksHtml += `<text x="${labelPos.x}" y="${labelPos.y + 4}" font-size="11" font-weight="600" fill="#64748b" text-anchor="middle">${i}</text>`;
    }

    const rot = -90 + (180 * (val / maxVal));

    const svg = `
        <svg class="gauge-svg" viewBox="0 0 200 130" style="width:200px; height:130px; overflow:visible;">
            ${arcsHtml}
            ${ticksHtml}
            <!-- Needle -->
            <g class="gauge-needle" style="transform: rotate(${rot}deg);">
                <g class="needle-wobble">
                    <polygon points="97,100 103,100 100,20" />
                    <circle cx="100" cy="100" r="6" />
                </g>
            </g>
            <!-- Value explicit text below needle -->
            <text x="100" y="125" font-size="18" font-weight="700" fill="var(--text-primary)" text-anchor="middle">${formatVal(rawVal)} ${label}</text>
        </svg>
    `;
    container.innerHTML = svg;
    
    // Remove old `.gauge-text` class element if it exists because the text is now embedded safely below needle
}

function showDetails(feature) {
  selectedFeature = feature;
  const p = feature.properties;
  
  els.rightSidebar.classList.remove('hidden');
  els.emptySelection.classList.add('hidden');
  els.damDetails.classList.remove('hidden');
  els.leftSidebar.classList.add('collapsed'); 

  clearGeometry();

  document.getElementById('detail-name').innerText = p['Reservoir'] || 'Unknown Reservoir';
  document.getElementById('detail-country').innerText = p['Country'] || 'Unknown Country';
  document.getElementById('detail-basin').innerText = p['Major River Basin'] || 'N/A';
  document.getElementById('detail-rid').innerText = p['GRILSS RID'] || 'N/A';
  document.getElementById('detail-built').innerText = p['Built Year'] || 'N/A';
  
  const origCap = p['Original Built Capacity (MCM)'];
  document.getElementById('detail-original-cap').innerText = origCap !== undefined && origCap !== null ? `${formatVal(origCap)} MCM` : 'N/A';
  
  const sedRate = p['Avg Sedimentation Rate (MCM/year)'];
  document.getElementById('detail-sed-rate-detail').innerText = sedRate ? `${formatVal(sedRate)} MCM/yr` : 'N/A';
  
  const lossRate = p['Avg Capacity Loss Rate (%/year)'];
  document.getElementById('detail-loss-rate-detail').innerText = lossRate !== undefined && lossRate !== null ? `${formatVal(lossRate)} %/yr` : 'N/A';
  
  const obsContainer = document.getElementById('observation-list');
  obsContainer.innerHTML = '';
  const obsList = p['observations'] || [];
  
  if (obsList.length === 0) {
      obsContainer.innerHTML = '<p class="meta-text text-center">No precise observation data.</p>';
  } else {
      obsList.forEach(obs => {
         const start = obs['Observation Start Year'] || '?';
         const end = obs['Observation End Year'] || '?';
         const sed = obs['Sedimentation Rate (MCM/year)'];
         const loss = obs['Capacity Loss Rate (%/year)'];
         
         const div = document.createElement('div');
         div.className = 'obs-item';
         div.innerHTML = `
            <div class="obs-header">Period: ${start} - ${end}</div>
            <div class="obs-stat">
                <span class="obs-stat-lbl">Sedimentation:</span>
                <span class="obs-stat-val">${sed !== null ? formatVal(sed) + ' MCM/yr' : 'N/A'}</span>
            </div>
            <div class="obs-stat">
                <span class="obs-stat-lbl">Loss Rate:</span>
                <span class="obs-stat-val" style="color:${getColor(loss)};">${loss !== null ? formatVal(loss) + ' %/yr' : 'N/A'}</span>
            </div>
         `;
         obsContainer.appendChild(div);
      });
  }
}

async function fetchGeometry(type) {
    if (!selectedFeature) return;
    const rid = selectedFeature.properties['GRILSS RID'];
    if (!rid) return alert("No reservoir ID found.");

    try {
        const res = await fetch(`${import.meta.env.BASE_URL}${type}/${rid}.geojson`);
        if (!res.ok) return alert(`No ${type} geometry available.`);
        const geom = await res.json();
        
        clearGeometry();
        const color = type === 'catchments' ? '#3b82f6' : '#ef4444';
        const weight = type === 'catchments' ? 2 : 1;
        const fillOpacity = type === 'catchments' ? 0.2 : 0.6;

        currentGeoJsonLayer = L.geoJSON(geom, {
            style: { color, weight, fillColor: color, fillOpacity }
        }).addTo(map);

        map.fitBounds(currentGeoJsonLayer.getBounds(), { padding: [50, 50] });
        els.btnClearGeom.classList.remove('hidden');
    } catch (e) {
        console.error(e); alert(`Failed to load ${type} geometry.`);
    }
}

function clearGeometry() {
    if (currentGeoJsonLayer) { map.removeLayer(currentGeoJsonLayer); currentGeoJsonLayer = null; }
    els.btnClearGeom.classList.add('hidden');
}
