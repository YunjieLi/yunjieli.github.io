mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN || '';

var UI_ICONS = {
	play: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5a1 1 0 0 1 1.528-.852l12 7a1 1 0 0 1 0 1.704l-12 7A1 1 0 0 1 5 19z"></path></svg>',
	pause: '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="14" y="3" width="5" height="18" rx="1"></rect><rect x="5" y="3" width="5" height="18" rx="1"></rect></svg>',
};

var POPUP_ICONS = {
	mapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>',
	clock: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
	church: '<path d="M10 9h4"></path><path d="M12 7v5"></path><path d="M14 22v-4a2 2 0 0 0-4 0v4"></path><path d="M18 22V5.618a1 1 0 0 0-.553-.894l-4-2a1 1 0 0 0-.894 0l-4 2A1 1 0 0 0 6 5.618V22"></path><path d="m18 22-4-4-4 4"></path><path d="m10 22 4-4 4 4"></path>',
	flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" x2="4" y1="22" y2="15"></line>',
};

function popupIcon(iconName) {
	return (
		'<svg class="mission-popup__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
		POPUP_ICONS[iconName] +
		'</svg>'
	);
}

function popupDetailRow(iconName, text) {
	return '<div class="mission-popup__detail">' + popupIcon(iconName) + '<span>' + text + '</span></div>';
}

function popupFieldRow(label, value) {
	if (!value) return '';
	return '<div class="mission-popup__detail"><span class="mission-popup__field">' + label + ':</span> ' + value + '</div>';
}

function setButtonIcon(button, iconName) {
	if (button && UI_ICONS[iconName]) {
		button.innerHTML = UI_ICONS[iconName];
	}
}

var ORDER_HQ = {
	Jesuit: 'Nuestra Señora de Loreto Conchó',
	Franciscan: 'San Carlos Borromeo de Carmelo',
	Dominican: 'San Vicente Ferrer',
};


var ORDER_COLORS = {
	Jesuit: '#2a6f97',
	Franciscan: '#bc6c25',
	Dominican: '#606c38',
};
var MARKER_REFERENCE_ZOOM = 7;
var MARKER_ICON_SIZE_SCALE = 1.5;
var MISSION_CIRCLE_RADIUS = 6;
var MISSION_HQ_CIRCLE_RADIUS = 12;
var PRESIDIO_CAPITAL_CIRCLE_RADIUS = 8;
var MISSION_MARKER_OPACITY = 0.9;
var MISSION_MARKER_LOGICAL_SIZE = 48;
var PRESIDIO_MARKER_LOGICAL_SIZE = MISSION_MARKER_LOGICAL_SIZE;
var PRESIDIO_SYMBOL_URL = './markers/presidio.svg';
var NATIONAL_CAPITAL_MARKER_LOGICAL_SIZE = 96;
var NATIONAL_CAPITAL_MARKER_RADIUS = 28;
var NATIONAL_CAPITAL_SIZE_SCALE = 0.6;
var NEW_SPAIN_CAPITAL_SIZE_SCALE = 1.6;
var NATIONAL_CAPITAL_ICONS = {
	'capital-new-spain': './markers/viceroyalty-of-New-Spain.svg',
	'capital-mexico': './markers/mexico.svg',
	'capital-texas': './markers/texas.svg',
	'capital-usa': './markers/usa.svg',
};
var NATIONAL_CAPITAL_COUNTRY_LABELS = {
	'capital-new-spain': 'New Spain',
	'capital-mexico': 'Mexico',
	'capital-texas': 'Republic of Texas',
	'capital-usa': 'United States',
};
var MEXICO_CITY_COORDS = [-99.1332, 19.4326];
var AUSTIN_COORDS = [-97.7431, 30.2672];
var MISSION_CROSS_PATH = 'M26 17H40V21H26V45H22V21H8V17H22V4H26V17Z';

function getLatestFeaturesByYear(features, year, getEntityId) {
	var byEntity = {};
	features.forEach(function(feature) {
		var props = feature.properties;
		var featureYear = props.year;
		if (featureYear == null || featureYear > year) return;
		var entityId = getEntityId(props);
		var existing = byEntity[entityId];
		if (!existing || existing.properties.year < featureYear) {
			byEntity[entityId] = feature;
		}
	});
	return Object.keys(byEntity).map(function(key) {
		return byEntity[key];
	});
}

function getLatestContextFeaturesByYear(features, year) {
	return getLatestFeaturesByYear(features, year, function(props) {
		return props.Entidad_ID || props.Nombre;
	});
}

function getVisibleContextGeojson(source) {
	if (!source || !source.features) {
		return { type: 'FeatureCollection', features: [] };
	}
	return {
		type: 'FeatureCollection',
		features: getLatestContextFeaturesByYear(source.features, selectedYear),
	};
}

function getVisibleProvinciaMayorGeojson() {
	if (selectedYear > PROVINCIA_MAYOR_END_YEAR || !provinciaMayor) {
		return { type: 'FeatureCollection', features: [] };
	}
	return {
		type: 'FeatureCollection',
		features: getLatestContextFeaturesByYear(provinciaMayor.features, selectedYear).filter(function(feature) {
			return feature.properties.regional_zone === PROVINCIAS_INTERNAS_ZONE;
		}),
	};
}

function getVisibleProvinciaRegionGeojson() {
	if (selectedYear > PROVINCIA_MAYOR_END_YEAR || !provinciaMayor) {
		return { type: 'FeatureCollection', features: [] };
	}
	if (provinciaRegionGeojsonCache[selectedYear]) {
		return provinciaRegionGeojsonCache[selectedYear];
	}

	var features = getLatestContextFeaturesByYear(provinciaMayor.features, selectedYear);
	var byZone = {};
	features.forEach(function(feature) {
		var zone = feature.properties.regional_zone;
		if (!zone) return;
		if (!byZone[zone]) byZone[zone] = [];
		byZone[zone].push(feature);
	});

	var regionalFeatures = Object.keys(byZone).map(function(zone) {
		var merged = unionProvinciaGeometries(byZone[zone]);
		return {
			type: 'Feature',
			properties: { regional_zone: zone },
			geometry: merged.geometry,
		};
	});

	var result = { type: 'FeatureCollection', features: regionalFeatures };
	provinciaRegionGeojsonCache[selectedYear] = result;
	return result;
}

function unionProvinciaGeometries(features) {
	if (!features.length) return null;
	if (features.length === 1 || typeof turf === 'undefined') {
		return {
			type: 'Feature',
			properties: {},
			geometry: features[0].geometry,
		};
	}

	var collection = turf.featureCollection(features.map(function(feature) {
		return turf.feature(feature.geometry);
	}));
	return turf.union(collection);
}

var US_STATE_DECADES = [1776, 1790, 1800, 1810, 1820, 1830, 1840, 1850];

function getUsStateGeojsonUrl(decade) {
	if (decade === 1776) return './layers/context-us_1776.geojson';
	return './layers/context-us_state_' + decade + '.geojson';
}

function getUsStateDecadeYear(year) {
	if (year >= 1848) return 1850;
	var decadeYear = null;
	US_STATE_DECADES.forEach(function(decade) {
		if (decade <= year) decadeYear = decade;
	});
	return decadeYear;
}

function getVisibleUsStateGeojson() {
	var decadeYear = getUsStateDecadeYear(selectedYear);
	if (!decadeYear || !usStateByDecade[decadeYear]) {
		return { type: 'FeatureCollection', features: [] };
	}
	return usStateByDecade[decadeYear];
}

function getActiveUsStateDecadeYear() {
	return getUsStateDecadeYear(selectedYear);
}

var MEXICO_PERIOD_YEARS = [1821, 1823, 1836, 1848];

function getActiveMexicoPeriodYear() {
	if (selectedYear < 1821) return null;
	if (selectedYear < 1823) return 1821;
	if (selectedYear < 1836) return 1823;
	if (selectedYear < 1848) return 1836;
	return 1848;
}

function isTexasPeriodActive() {
	return selectedYear >= 1836 && selectedYear < 1848;
}

function getVisibleMexicoGeojson() {
	var periodYear = getActiveMexicoPeriodYear();
	if (!periodYear || !mexicoByPeriod[periodYear]) {
		return { type: 'FeatureCollection', features: [] };
	}
	return mexicoByPeriod[periodYear];
}

function getVisibleTexasGeojson() {
	if (!isTexasPeriodActive() || !texasGeojson) {
		return { type: 'FeatureCollection', features: [] };
	}
	return texasGeojson;
}

var PROVINCIA_MAYOR_COLOR = '#4658ce';
var PROVINCIAS_INTERNAS_ZONE = 'Provincias Internas';

function addProvinciaRegionLayers() {
	map.addSource('provincia-regions', {
		type: 'geojson',
		data: getVisibleProvinciaRegionGeojson(),
	});

	map.addLayer({
		id: 'provincia-regions-fill',
		type: 'fill',
		source: 'provincia-regions',
		paint: {
			'fill-color': PROVINCIA_MAYOR_COLOR,
			'fill-opacity': 0.18,
		},
	});

	map.addLayer({
		id: 'provincia-regions-outline',
		type: 'line',
		source: 'provincia-regions',
		paint: {
			'line-color': PROVINCIA_MAYOR_COLOR,
			'line-opacity': 0.55,
			'line-width': 1.5,
		},
	});
}

function addProvinciaMayorLayers() {
	map.addSource('provincia-mayor', {
		type: 'geojson',
		data: getVisibleProvinciaMayorGeojson(),
	});

	map.addLayer({
		id: 'provincia-mayor-fill',
		type: 'fill',
		source: 'provincia-mayor',
		paint: {
			'fill-color': PROVINCIA_MAYOR_COLOR,
			'fill-opacity': 0.18,
		},
	});

	map.addLayer({
		id: 'provincia-mayor-outline',
		type: 'line',
		source: 'provincia-mayor',
		paint: {
			'line-color': PROVINCIA_MAYOR_COLOR,
			'line-opacity': 0.55,
			'line-width': 1.5,
		},
	});
}

function addMexicoLayers() {
	map.addSource('mexico', {
		type: 'geojson',
		data: getVisibleMexicoGeojson(),
	});

	map.addLayer({
		id: 'mexico-fill',
		type: 'fill',
		source: 'mexico',
		paint: {
			'fill-color': '#2a9d8f',
			'fill-opacity': 0.14,
		},
	});

	map.addLayer({
		id: 'mexico-outline',
		type: 'line',
		source: 'mexico',
		paint: {
			'line-color': '#2a9d8f',
			'line-opacity': 0.55,
			'line-width': 1.25,
		},
	});
}

function addTexasLayers() {
	map.addSource('texas', {
		type: 'geojson',
		data: getVisibleTexasGeojson(),
	});

	map.addLayer({
		id: 'texas-fill',
		type: 'fill',
		source: 'texas',
		paint: {
			'fill-color': '#e9c46a',
			'fill-opacity': 0.16,
		},
	});

	map.addLayer({
		id: 'texas-outline',
		type: 'line',
		source: 'texas',
		paint: {
			'line-color': '#e9c46a',
			'line-opacity': 0.65,
			'line-width': 1.25,
		},
	});
}

function addUsStateLayers() {
	map.addSource('us-states', {
		type: 'geojson',
		data: getVisibleUsStateGeojson(),
	});

	map.addLayer({
		id: 'us-states-fill',
		type: 'fill',
		source: 'us-states',
		paint: {
			'fill-color': '#e76f51',
			'fill-opacity': 0.14,
		},
	});

	map.addLayer({
		id: 'us-states-outline',
		type: 'line',
		source: 'us-states',
		paint: {
			'line-color': '#e76f51',
			'line-opacity': 0.5,
			'line-width': 1.25,
		},
	});
}

function addCaliforniaLayers() {
	map.addSource('california', {
		type: 'geojson',
		data: california,
	});

	map.addLayer({
		id: 'california-outline',
		type: 'line',
		source: 'california',
		paint: {
			'line-color': '#bc6c25',
			'line-opacity': 0.5,
			'line-width': 1.25,
			'line-dasharray': [1, 2],
		},
	});
}

function buildCaliforniaPopupHtml(props) {
	return (
		'<div class="mission-popup__name">' + (props.name || 'California') + '</div>' +
		'<div class="mission-popup__detail">Modern state boundary</div>'
	);
}

function buildProvinciaRegionPopupHtml(props) {
	return popupFieldRow('region', props.regional_zone);
}

function buildContextPopupHtml(props) {
	var name = props.Nombre || props.Label || '';
	return (
		popupFieldRow('provincia', name) +
		popupFieldRow('region', props.regional_zone) +
		popupFieldRow('cabecera', props.Cabecera) +
		popupFieldRow('tipo', props.Tipo ? String(props.Tipo).replace(/[-_]/g, ' ') : '')
	);
}

function buildUsStatePopupHtml(props) {
	var name = props.STATENAM || props.name || '';
	return name ? '<div class="mission-popup__detail">' + name + '</div>' : '';
}

function setupPolygonLayerInteractions(layerId, buildPopupHtmlFn) {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	map.on('mouseenter', layerId, function() {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', layerId, function() {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});

	map.on('mousemove', layerId, function(event) {
		if (!event.features || !event.features.length) return;
		popup
			.setLngLat(event.lngLat)
			.setHTML(buildPopupHtmlFn(event.features[0].properties))
			.addTo(map);
	});
}

var LEGEND_LAYERS = {
	presidios: ['presidios-symbols', 'presidios-capital-symbols'],
	'provincia-mayor': [
		'provincia-regions-fill',
		'provincia-regions-outline',
		'provincia-mayor-fill',
		'provincia-mayor-outline',
	],
	mexico: ['mexico-fill', 'mexico-outline'],
	texas: ['texas-fill', 'texas-outline'],
	'us-states': ['us-states-fill', 'us-states-outline'],
	california: ['california-outline'],
};

var legendLayerVisibility = {
	presidios: true,
	'provincia-mayor': true,
	mexico: true,
	texas: true,
	'us-states': true,
	california: true,
};

var MISSION_LAYER_IDS = ['missions-symbols', 'missions-hq-symbols'];
var missionsVisible = true;

var MISSION_HQ_ICON_OFFSET = [-1.25, 1.25];
var PRESIDIO_CAPITAL_ICON_OFFSET = [1.25, -1.25];

function extendBoundsWithCoords(bounds, coords) {
	if (typeof coords[0] === 'number') {
		bounds.extend(coords);
		return;
	}
	coords.forEach(function(child) {
		extendBoundsWithCoords(bounds, child);
	});
}

function boundsFromGeojson(geojson) {
	var bounds = new mapboxgl.LngLatBounds();
	if (!geojson || !geojson.features) return bounds;
	geojson.features.forEach(function(feature) {
		if (feature.geometry && feature.geometry.coordinates) {
			extendBoundsWithCoords(bounds, feature.geometry.coordinates);
		}
	});
	return bounds;
}

function getMissionOrderFilter() {
	if (!missionsVisible) {
		return ['==', ['get', 'order'], ''];
	}
	return ['any',
		['==', ['get', 'order'], 'Jesuit'],
		['==', ['get', 'order'], 'Franciscan'],
		['==', ['get', 'order'], 'Dominican'],
	];
}

function updateMissionLayerFilters() {
	var orderFilter = getMissionOrderFilter();
	MISSION_LAYER_IDS.forEach(function(layerId) {
		if (!map.getLayer(layerId)) return;
		var baseFilter = layerId === 'missions-hq-symbols' ? isHqExpression() : notHqFilter();
		map.setFilter(layerId, ['all', baseFilter, orderFilter]);
	});
}

function setMissionsVisibility(visible) {
	missionsVisible = visible;
	updateMissionLayerFilters();
}

function setLegendLayerVisibility(target, visible) {
	if (target && Object.prototype.hasOwnProperty.call(legendLayerVisibility, target)) {
		legendLayerVisibility[target] = visible;
	}
	var layerVisible = visible;
	if (target === 'provincia-mayor') {
		layerVisible = visible && selectedYear <= PROVINCIA_MAYOR_END_YEAR;
	}
	if (target === 'presidios') {
		layerVisible = visible && selectedYear <= PROVINCIA_MAYOR_END_YEAR;
	}
	if (target === 'mexico') {
		layerVisible = visible && !!getActiveMexicoPeriodYear();
	}
	if (target === 'texas') {
		layerVisible = visible && isTexasPeriodActive();
	}
	if (target === 'us-states') {
		layerVisible = visible && !!getActiveUsStateDecadeYear();
	}
	(LEGEND_LAYERS[target] || []).forEach(function(layerId) {
		if (map.getLayer(layerId)) {
			map.setLayoutProperty(layerId, 'visibility', layerVisible ? 'visible' : 'none');
		}
	});
	updateNationalCapitals();
}

function setupLegendControls() {
	setupLegendSymbolZoom();
}

function setupLegendSymbolZoom() {
	var symbols = document.querySelectorAll('.legend-row__symbol[data-locate]');
	Array.prototype.forEach.call(symbols, function(button) {
		button.addEventListener('click', function() {
			locateLegendLayer(button.dataset.locate);
		});
	});
}

function mergeFeatureCollections(collections) {
	var features = [];
	collections.forEach(function(collection) {
		if (!collection || !collection.features) return;
		features = features.concat(collection.features);
	});
	return {
		type: 'FeatureCollection',
		features: features,
	};
}

function getLegendLocateGeojson(target) {
	switch (target) {
		case 'missions':
			return getVisibleMarkerGeojson().missions;
		case 'presidios':
			return getVisiblePresidiosGeojson();
		case 'provincia-mayor':
			return mergeFeatureCollections([
				getVisibleProvinciaRegionGeojson(),
				getVisibleProvinciaMayorGeojson(),
			]);
		case 'us-states':
			return getVisibleUsStateGeojson();
		case 'mexico':
			return getVisibleMexicoGeojson();
		case 'texas':
			return getVisibleTexasGeojson();
		case 'california':
			return california;
		default:
			return null;
	}
}

function fitMapToGeojson(geojson, options) {
	if (!map) return;

	options = options || {};
	var bounds = new mapboxgl.LngLatBounds();
	unionBoundsFromGeojson(bounds, geojson);
	if (bounds.isEmpty()) return;

	map.fitBounds(bounds, {
		padding: { top: 48, bottom: 96, left: 48, right: 48 },
		duration: options.duration != null ? options.duration : 600,
	});
}

function locateLegendLayer(target) {
	fitMapToGeojson(getLegendLocateGeojson(target));
}

var readmeMarkdownCache = null;

function extractFirstMarkdownHeading(markdown) {
	var lines = markdown.split(/\r?\n/);
	for (var i = 0; i < lines.length; i++) {
		var match = lines[i].match(/^#{1,6}\s+(.+)$/);
		if (match) return match[1].trim();
	}
	return null;
}

function applyLegendTitleFromReadme(markdown) {
	var title = extractFirstMarkdownHeading(markdown);
	if (!title) return;
	var titleEl = document.querySelector('#legend h2');
	if (titleEl) titleEl.textContent = title;
}

function loadReadmeMarkdown() {
	if (readmeMarkdownCache) {
		return Promise.resolve(readmeMarkdownCache);
	}
	return fetch('./README.md').then(function(response) {
		if (!response.ok) throw new Error('Failed to load README.md');
		return response.text();
	}).then(function(text) {
		readmeMarkdownCache = text;
		return text;
	});
}

function renderReadmeMarkdown(markdown) {
	if (typeof marked !== 'undefined' && marked.parse) {
		return marked.parse(markdown);
	}
	return '<pre>' + markdown.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</pre>';
}

function isReadmeModalOpen() {
	var modal = document.getElementById('readme-modal');
	return !!(modal && modal.classList.contains('is-open'));
}

function openReadmeModal() {
	var modal = document.getElementById('readme-modal');
	var content = document.getElementById('readme-modal__content');
	if (!modal || !content) return;

	function showModal(markdown) {
		content.innerHTML = renderReadmeMarkdown(markdown);
		modal.classList.add('is-open');
		modal.setAttribute('aria-hidden', 'false');
	}

	loadReadmeMarkdown().then(function(text) {
		showModal(text);
	}).catch(function(error) {
		console.error(error);
		content.innerHTML = '<p>Could not load README.md.</p>';
		modal.classList.add('is-open');
		modal.setAttribute('aria-hidden', 'false');
	});
}

function closeReadmeModal() {
	var modal = document.getElementById('readme-modal');
	if (!modal || !modal.classList.contains('is-open')) return;
	modal.classList.remove('is-open');
	modal.setAttribute('aria-hidden', 'true');
}

function setupReadmeModal() {
	var infoBtn = document.getElementById('legend__info');
	var closeBtn = document.getElementById('readme-modal__close');
	var modal = document.getElementById('readme-modal');

	if (infoBtn) infoBtn.addEventListener('click', openReadmeModal);
	if (closeBtn) closeBtn.addEventListener('click', closeReadmeModal);
	if (modal) {
		modal.addEventListener('click', function(event) {
			if (event.target === modal) closeReadmeModal();
		});
	}

	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape' && isReadmeModalOpen()) {
			event.preventDefault();
			closeReadmeModal();
		}
	});
}

function syncLegendLayerVisibility() {
	setMissionsVisibility(true);
	Object.keys(legendLayerVisibility).forEach(function(target) {
		setLegendLayerVisibility(target, legendLayerVisibility[target]);
	});
}

function isNewSpainCapitalVisible() {
	return legendLayerVisibility['provincia-mayor'] && selectedYear <= PROVINCIA_MAYOR_END_YEAR;
}

function isMexicoCapitalVisible() {
	return legendLayerVisibility.mexico && !!getActiveMexicoPeriodYear();
}

function isTexasCapitalVisible() {
	return legendLayerVisibility.texas && isTexasPeriodActive();
}

function isUsCapitalVisible() {
	return legendLayerVisibility['us-states'] && !!getActiveUsStateDecadeYear();
}

function getUsCapitalForYear(year) {
	if (year >= 1800) {
		return { name: 'Washington, D.C.', coordinates: [-77.0369, 38.9072] };
	}
	if (year >= 1790) {
		return { name: 'Philadelphia', coordinates: [-75.1652, 39.9526] };
	}
	if (year >= 1785) {
		return { name: 'New York City', coordinates: [-74.006, 40.7128] };
	}
	if (year >= 1774) {
		return { name: 'Philadelphia', coordinates: [-75.1652, 39.9526] };
	}
	return null;
}

function getVisibleNationalCapitalsGeojson() {
	var features = [];

	if (isNewSpainCapitalVisible()) {
		features.push({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: MEXICO_CITY_COORDS },
			properties: { name: 'Mexico City', iconImage: 'capital-new-spain' },
		});
	}

	if (isMexicoCapitalVisible()) {
		features.push({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: MEXICO_CITY_COORDS },
			properties: { name: 'Mexico City', iconImage: 'capital-mexico' },
		});
	}

	if (isTexasCapitalVisible()) {
		features.push({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: AUSTIN_COORDS },
			properties: { name: 'Austin', iconImage: 'capital-texas' },
		});
	}

	if (isUsCapitalVisible()) {
		var usCapital = getUsCapitalForYear(selectedYear);
		if (usCapital) {
			features.push({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: usCapital.coordinates },
				properties: { name: usCapital.name, iconImage: 'capital-usa' },
			});
		}
	}

	return {
		type: 'FeatureCollection',
		features: features,
	};
}

function updateNationalCapitals() {
	if (!map) return;
	ensureNationalCapitalLayers();
	if (!map.getSource('national-capitals')) return;
	map.getSource('national-capitals').setData(getVisibleNationalCapitalsGeojson());
}

function getNationalCapitalBaseIconSize() {
	return getMarkerIconSizeAtReferenceZoom(
		NATIONAL_CAPITAL_MARKER_RADIUS,
		NATIONAL_CAPITAL_MARKER_LOGICAL_SIZE
	) * NATIONAL_CAPITAL_SIZE_SCALE;
}

function getNationalCapitalSymbolLayout(sizeMultiplier) {
	return {
		'icon-image': ['get', 'iconImage'],
		'icon-size': getZoomScaledIconSizeExpression(getNationalCapitalBaseIconSize() * sizeMultiplier),
		'icon-anchor': 'center',
		'icon-allow-overlap': true,
		'icon-ignore-placement': true,
	};
}

function ensureNationalCapitalLayers() {
	if (!map.getSource('national-capitals')) {
		map.addSource('national-capitals', {
			type: 'geojson',
			data: getVisibleNationalCapitalsGeojson(),
		});
	}

	var symbolPaint = { 'icon-opacity': 0.95 };

	if (!map.getLayer('national-capitals-symbols')) {
		map.addLayer({
			id: 'national-capitals-symbols',
			type: 'symbol',
			source: 'national-capitals',
			filter: ['!=', ['get', 'iconImage'], 'capital-new-spain'],
			layout: getNationalCapitalSymbolLayout(1),
			paint: symbolPaint,
		});
	}

	if (!map.getLayer('national-capitals-new-spain-symbols')) {
		map.addLayer({
			id: 'national-capitals-new-spain-symbols',
			type: 'symbol',
			source: 'national-capitals',
			filter: ['==', ['get', 'iconImage'], 'capital-new-spain'],
			layout: getNationalCapitalSymbolLayout(NEW_SPAIN_CAPITAL_SIZE_SCALE),
			paint: symbolPaint,
		});
	}
}

function addNationalCapitalLayers() {
	ensureNationalCapitalLayers();
}

function buildCapitalPopupHtml(props) {
	var country = NATIONAL_CAPITAL_COUNTRY_LABELS[props.iconImage] || '';
	var capital = props.name || '';
	return (
		'<div class="mission-popup__name">' + country + '</div>' +
		(capital ? '<div class="mission-popup__detail">' + capital + '</div>' : '')
	);
}

function setupNationalCapitalInteractions() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	['national-capitals-symbols', 'national-capitals-new-spain-symbols'].forEach(function(layerId) {
		map.on('mouseenter', layerId, function() {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', layerId, function() {
			map.getCanvas().style.cursor = '';
			popup.remove();
		});

		map.on('mousemove', layerId, function(event) {
			if (!event.features || !event.features.length) return;
			var props = event.features[0].properties;
			popup
				.setLngLat(event.lngLat)
				.setHTML(buildCapitalPopupHtml(props))
				.addTo(map);
		});
	});
}

var missions;
var presidios;
var provinciaMayor;
var provinciaRegionGeojsonCache = {};
var california;
var mexicoByPeriod = {};
var texasGeojson;
var usStateByDecade = {};
var PROVINCIA_MAYOR_END_YEAR = 1820;
var map;
var minYear = 1610;
var maxYear = 1850;
var selectedYear = minYear;
var timelinePlaying = false;
var timelineAnimationId = null;
var timelineStepMs = 150;
var timelineEvents = [];

function parseCsvLine(line) {
	var fields = [];
	var current = '';
	var inQuotes = false;

	for (var i = 0; i < line.length; i++) {
		var ch = line[i];
		if (ch === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i += 1;
			} else {
				inQuotes = !inQuotes;
			}
			continue;
		}
		if (ch === ',' && !inQuotes) {
			fields.push(current.trim());
			current = '';
			continue;
		}
		current += ch;
	}

	fields.push(current.trim());
	return fields;
}

function parseMilestonesCsv(text) {
	var lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
	var events = [];

	for (var i = 0; i < lines.length; i++) {
		var line = lines[i].trim();
		if (!line || /^year\s*,/i.test(line)) continue;

		var fields = parseCsvLine(line);
		if (fields.length < 3) continue;

		var year = parseInt(fields[0], 10);
		if (isNaN(year)) continue;

		events.push({
			year: year,
			name: fields[1],
			description: fields[2],
		});
	}

	events.sort(function(a, b) {
		return a.year - b.year;
	});

	return events;
}

function applyTimelineEvents(events) {
	timelineEvents = events;
	renderTimelineEvents();
}

function syncYearRange() {
	if (selectedYear > maxYear) selectedYear = maxYear;
	if (selectedYear < minYear) selectedYear = minYear;

	var slider = document.getElementById('timeline__range');
	if (slider) {
		slider.min = String(minYear);
		slider.max = String(maxYear);
		slider.value = String(selectedYear);
	}
	renderTimelineTicks();
	renderTimelineEvents();
	updateTimelineControls();
}

function applyMissions(data) {
	missions = normalizeMissions(data);
	syncYearRange();
	updateMissionData();
	syncDebuggingTables();
}

function applyPresidios(data) {
	presidios = normalizePresidios(data);
	syncYearRange();
	updateMissionData();
	syncDebuggingTables();
}

function applyProvinciaMayor(data) {
	provinciaMayor = data;
	provinciaRegionGeojsonCache = {};
	updateMissionData();
	syncDebuggingTables();
}

function syncDebuggingTables() {
	populateMissionsTable();
	populatePresidiosTable();
	populateProvinciaMayorTable();
}

function formatYearBecameCapitalForTable(value) {
	return value != null && value !== '' ? String(value) : '';
}

function parseYearBecameCapitalCell(text) {
	var value = String(text || '').trim();
	if (!value) return null;
	var year = parseInt(value, 10);
	return isNaN(year) ? null : year;
}

function applyPresidioCapitalEndYears(features) {
	var byRegion = {};
	features.forEach(function(feature) {
		var props = feature.properties;
		var became = props.year_became_capital;
		if (became == null) return;
		var region = props.region;
		if (!byRegion[region]) byRegion[region] = [];
		byRegion[region].push({ became: became, props: props });
	});

	Object.keys(byRegion).forEach(function(region) {
		var capitals = byRegion[region].sort(function(a, b) {
			return a.became - b.became;
		});
		capitals.forEach(function(entry, index) {
			if (index + 1 < capitals.length) {
				entry.props.year_ended_as_capital = capitals[index + 1].became;
			} else {
				delete entry.props.year_ended_as_capital;
			}
		});
	});
}

function normalizePresidios(data) {
	data.features.forEach(function(feature) {
		var props = feature.properties;
		if (props.year_became_capital != null && props.year_became_capital !== '') {
			props.year_became_capital = Number(props.year_became_capital);
		} else {
			delete props.year_became_capital;
		}
		if (props.year_ended_as_capital != null && props.year_ended_as_capital !== '') {
			props.year_ended_as_capital = Number(props.year_ended_as_capital);
		} else {
			delete props.year_ended_as_capital;
		}
		delete props.capital;
	});
	applyPresidioCapitalEndYears(data.features);
	return data;
}

function getPresidioFeatureKey(feature) {
	return feature.id != null ? feature.id : feature.properties.name;
}

function isPresidioCapitalAtYear(props, year) {
	var became = props.year_became_capital;
	if (became == null || became > year) return false;
	var ended = props.year_ended_as_capital;
	return ended == null || year < ended;
}

function resolvePresidioCapitalKeys(features, year) {
	var keys = {};
	features.forEach(function(feature) {
		if (isPresidioCapitalAtYear(feature.properties, year)) {
			keys[getPresidioFeatureKey(feature)] = true;
		}
	});
	return keys;
}

function annotatePresidioCapitals(features, year) {
	var capitalKeys = resolvePresidioCapitalKeys(features, year);
	return features.map(function(feature) {
		var clone = cloneFeature(feature);
		clone.properties.capital = !!capitalKeys[getPresidioFeatureKey(feature)];
		return clone;
	});
}

function isHqProperty(value) {
	return value === true || value === 'true' || value === 1 || value === '1';
}

function formatHqForTable(value) {
	return isHqProperty(value) ? 'TRUE' : '';
}

function parseHqCell(text) {
	var value = String(text || '').trim().toLowerCase();
	return value === 'true' || value === '1' || value === 'yes';
}

function normalizeMissionHq(feature) {
	var props = feature.properties;
	if (props.hq == null && ORDER_HQ[props.order]) {
		props.hq = props.name === ORDER_HQ[props.order];
		return;
	}
	props.hq = isHqProperty(props.hq);
}

function normalizeMissions(data) {
	data.features.forEach(normalizeMissionHq);
	return data;
}

function isHqExpression() {
	return [
		'any',
		['==', ['get', 'hq'], true],
		['==', ['get', 'hq'], 'true'],
		['==', ['get', 'hq'], 1],
	];
}

function isCapitalProperty(value) {
	return value === true || value === 'true' || value === 1 || value === '1';
}

function isCapitalExpression() {
	return [
		'any',
		['==', ['get', 'capital'], true],
		['==', ['get', 'capital'], 'true'],
		['==', ['get', 'capital'], 1],
	];
}

function notHqFilter() {
	return [
		'!',
		['any',
			['==', ['get', 'hq'], true],
			['==', ['get', 'hq'], 'true'],
			['==', ['get', 'hq'], 1],
		],
	];
}

function notCapitalFilter() {
	return [
		'!',
		['any',
			['==', ['get', 'capital'], true],
			['==', ['get', 'capital'], 'true'],
			['==', ['get', 'capital'], 1],
		],
	];
}

function iconOffsetExpression() {
	return [
		'case',
		['has', 'iconOffset'],
		['get', 'iconOffset'],
		['literal', [0, 0]],
	];
}

function appendTableCell(row, text, options) {
	options = options || {};
	var td = document.createElement('td');
	td.textContent = text != null ? String(text) : '';
	if (options.className) td.className = options.className;
	if (options.editable) {
		td.contentEditable = 'true';
		td.classList.add('data-table__cell--editable');
	} else {
		td.classList.add('data-table__cell--readonly');
	}
	row.appendChild(td);
	return td;
}

function buildMissionTableRow(feature) {
	var props = feature.properties;
	var coords = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : [];
	var row = document.createElement('tr');
	if (feature.id != null) row.dataset.featureId = feature.id;

	appendTableCell(row, props.name, { editable: true });
	appendTableCell(row, props.location, { editable: true, className: 'data-table__location' });
	appendTableCell(row, props.year, { editable: true });
	appendTableCell(row, props.order, { editable: true });
	appendTableCell(row, props.region, { editable: true });
	appendTableCell(row, formatHqForTable(props.hq), { editable: true });
	appendTableCell(row, coords[0] != null ? coords[0] : '', {
		editable: true,
		className: 'data-table__coordinates',
	});
	appendTableCell(row, coords[1] != null ? coords[1] : '', {
		editable: true,
		className: 'data-table__coordinates',
	});
	appendTableCell(row, feature.id != null ? feature.id : '', { className: 'data-table__id' });

	return row;
}

function populateMissionsTable() {
	var tbody = document.getElementById('missions-table__body');
	if (!tbody || !missions) return;

	tbody.innerHTML = '';

	missions.features.slice().sort(function(a, b) {
		return (a.properties.year || 0) - (b.properties.year || 0);
	}).forEach(function(feature) {
		tbody.appendChild(buildMissionTableRow(feature));
	});
}

function buildPresidioTableRow(feature) {
	var props = feature.properties;
	var coords = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : [];
	var row = document.createElement('tr');
	if (feature.id != null) row.dataset.featureId = feature.id;

	appendTableCell(row, props.name, { editable: true });
	appendTableCell(row, props.location, { editable: true, className: 'data-table__location' });
	appendTableCell(row, props.year, { editable: true });
	appendTableCell(row, props.region, { editable: true });
	appendTableCell(row, formatYearBecameCapitalForTable(props.year_became_capital), { editable: true });
	appendTableCell(row, formatYearBecameCapitalForTable(props.year_ended_as_capital), {
		className: 'data-table__cell--readonly',
	});
	appendTableCell(row, coords[0] != null ? coords[0] : '', {
		editable: true,
		className: 'data-table__coordinates',
	});
	appendTableCell(row, coords[1] != null ? coords[1] : '', {
		editable: true,
		className: 'data-table__coordinates',
	});
	appendTableCell(row, feature.id != null ? feature.id : '', { className: 'data-table__id' });

	return row;
}

function populatePresidiosTable() {
	var tbody = document.getElementById('presidios-table__body');
	if (!tbody || !presidios) return;

	tbody.innerHTML = '';

	presidios.features.slice().sort(function(a, b) {
		return (a.properties.year || 0) - (b.properties.year || 0);
	}).forEach(function(feature) {
		tbody.appendChild(buildPresidioTableRow(feature));
	});
}

function getProvinciaMayorFeatureKey(feature) {
	var props = feature.properties;
	return (props.Entidad_ID || props.Nombre || '') + '|' + (props.year || '');
}

function buildProvinciaMayorTableRow(feature) {
	var props = feature.properties;
	var row = document.createElement('tr');
	row.dataset.featureKey = getProvinciaMayorFeatureKey(feature);

	appendTableCell(row, props.Nombre, { editable: true });
	appendTableCell(row, props.Label, { editable: true });
	appendTableCell(row, props.Cabecera, { editable: true });
	appendTableCell(row, props.year, { editable: true });
	appendTableCell(row, props.regional_zone, { editable: true });
	appendTableCell(row, props.upper_administration, { editable: true });
	appendTableCell(row, props.Tipo, { editable: true });
	appendTableCell(row, props.Entidad_ID, { className: 'data-table__cell--readonly data-table__id' });

	return row;
}

function populateProvinciaMayorTable() {
	var tbody = document.getElementById('provincia-mayor-table__body');
	if (!tbody || !provinciaMayor) return;

	tbody.innerHTML = '';

	provinciaMayor.features.slice().sort(function(a, b) {
		var yearDiff = (a.properties.year || 0) - (b.properties.year || 0);
		if (yearDiff) return yearDiff;
		return String(a.properties.Nombre || '').localeCompare(String(b.properties.Nombre || ''));
	}).forEach(function(feature) {
		tbody.appendChild(buildProvinciaMayorTableRow(feature));
	});
}

function collectMissionsGeojsonFromTable() {
	var features = [];
	var tableRows = document.querySelectorAll('#missions-table__body tr');

	Array.prototype.forEach.call(tableRows, function(tr) {
		var cells = tr.cells;
		if (!cells.length) return;

		var year = parseInt(cells[2].textContent.trim(), 10);
		var feature = {
			type: 'Feature',
			properties: {
				name: cells[0].textContent.trim(),
				location: cells[1].textContent.trim(),
				year: isNaN(year) ? cells[2].textContent.trim() : year,
				order: cells[3].textContent.trim(),
				region: cells[4].textContent.trim(),
				hq: parseHqCell(cells[5].textContent.trim()),
			},
			geometry: {
				type: 'Point',
				coordinates: [
					parseFloat(cells[6].textContent.trim()),
					parseFloat(cells[7].textContent.trim()),
				],
			},
		};

		var idText = cells[8].textContent.trim();
		if (idText) feature.id = /^\d+$/.test(idText) ? parseInt(idText, 10) : idText;
		else if (tr.dataset.featureId) feature.id = tr.dataset.featureId;

		features.push(feature);
	});

	return {
		type: 'FeatureCollection',
		features: features,
	};
}

function getMissionsGeojsonText() {
	if (!missions) return '{"type":"FeatureCollection","features":[]}\n';
	return JSON.stringify(missions, null, 2) + '\n';
}

function collectPresidiosGeojsonFromTable() {
	var features = [];
	var tableRows = document.querySelectorAll('#presidios-table__body tr');

	Array.prototype.forEach.call(tableRows, function(tr) {
		var cells = tr.cells;
		if (!cells.length) return;

		var year = parseInt(cells[2].textContent.trim(), 10);
		var yearBecameCapital = parseYearBecameCapitalCell(cells[4].textContent.trim());
		var feature = {
			type: 'Feature',
			properties: {
				name: cells[0].textContent.trim(),
				location: cells[1].textContent.trim(),
				year: isNaN(year) ? cells[2].textContent.trim() : year,
				region: cells[3].textContent.trim(),
			},
			geometry: {
				type: 'Point',
				coordinates: [
					parseFloat(cells[6].textContent.trim()),
					parseFloat(cells[7].textContent.trim()),
				],
			},
		};
		if (yearBecameCapital != null) {
			feature.properties.year_became_capital = yearBecameCapital;
		}

		var idText = cells[8].textContent.trim();
		if (idText) feature.id = /^\d+$/.test(idText) ? parseInt(idText, 10) : idText;
		else if (tr.dataset.featureId) feature.id = tr.dataset.featureId;

		features.push(feature);
	});

	applyPresidioCapitalEndYears(features);

	return {
		type: 'FeatureCollection',
		features: features,
	};
}

function getPresidiosGeojsonText() {
	if (!presidios) return '{"type":"FeatureCollection","features":[]}\n';
	return JSON.stringify(presidios, null, 2) + '\n';
}

function collectProvinciaMayorGeojsonFromTable() {
	var featureByKey = {};
	if (provinciaMayor && provinciaMayor.features) {
		provinciaMayor.features.forEach(function(feature) {
			featureByKey[getProvinciaMayorFeatureKey(feature)] = feature;
		});
	}

	var features = [];
	var tableRows = document.querySelectorAll('#provincia-mayor-table__body tr');

	Array.prototype.forEach.call(tableRows, function(tr) {
		var original = featureByKey[tr.dataset.featureKey];
		if (!original) return;

		var cells = tr.cells;
		if (!cells.length) return;

		var year = parseInt(cells[3].textContent.trim(), 10);
		var feature = cloneFeature(original);
		feature.properties.Nombre = cells[0].textContent.trim();
		feature.properties.Label = cells[1].textContent.trim();
		feature.properties.Cabecera = cells[2].textContent.trim();
		feature.properties.year = isNaN(year) ? cells[3].textContent.trim() : year;
		feature.properties.regional_zone = cells[4].textContent.trim();
		feature.properties.upper_administration = cells[5].textContent.trim();
		feature.properties.Tipo = cells[6].textContent.trim();
		features.push(feature);
	});

	return {
		type: 'FeatureCollection',
		features: features,
	};
}

function getProvinciaMayorGeojsonText() {
	if (!provinciaMayor) return '{"type":"FeatureCollection","features":[]}\n';
	return JSON.stringify(provinciaMayor, null, 2) + '\n';
}

function copyTextToClipboard(text, button, defaultLabel) {
	function showCopied() {
		if (!button) return;
		button.textContent = 'Copied';
		window.setTimeout(function() {
			button.textContent = defaultLabel;
		}, 1500);
	}

	if (navigator.clipboard && navigator.clipboard.writeText) {
		return navigator.clipboard.writeText(text).then(showCopied).catch(function(error) {
			console.error(error);
		});
	}

	var textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.setAttribute('readonly', '');
	textarea.style.position = 'fixed';
	textarea.style.left = '-9999px';
	document.body.appendChild(textarea);
	textarea.select();
	try {
		document.execCommand('copy');
		showCopied();
	} catch (error) {
		console.error(error);
	}
	document.body.removeChild(textarea);
}

function exportMissionsGeojson() {
	var button = document.getElementById('missions-export-btn');
	copyTextToClipboard(getMissionsGeojsonText(), button, 'Copy missions.geojson');
}

function downloadMissionsGeojson() {
	var text = getMissionsGeojsonText();
	var blob = new Blob([text], { type: 'application/geo+json;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var link = document.createElement('a');
	link.href = url;
	link.download = 'missions.geojson';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function exportPresidiosGeojson() {
	var button = document.getElementById('presidios-export-btn');
	copyTextToClipboard(getPresidiosGeojsonText(), button, 'Copy presidios.geojson');
}

function downloadPresidiosGeojson() {
	var text = getPresidiosGeojsonText();
	var blob = new Blob([text], { type: 'application/geo+json;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var link = document.createElement('a');
	link.href = url;
	link.download = 'presidios.geojson';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function exportProvinciaMayorGeojson() {
	var button = document.getElementById('provincia-mayor-export-btn');
	copyTextToClipboard(getProvinciaMayorGeojsonText(), button, 'Copy context-Provincia_mayor.geojson');
}

function downloadProvinciaMayorGeojson() {
	var text = getProvinciaMayorGeojsonText();
	var blob = new Blob([text], { type: 'application/geo+json;charset=utf-8' });
	var url = URL.createObjectURL(blob);
	var link = document.createElement('a');
	link.href = url;
	link.download = 'context-Provincia_mayor.geojson';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

function isDataModalOpen() {
	var modal = document.getElementById('data-modal');
	return !!(modal && modal.classList.contains('is-open'));
}

function shouldIgnoreDataModalShortcut(event) {
	var target = event.target;
	if (!target) return false;

	var tag = target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return true;
	if (target.isContentEditable && !isDataModalOpen()) return true;

	return false;
}

function shouldIgnoreTimelineShortcut(event) {
	var target = event.target;
	if (!target) return false;

	var tag = target.tagName;
	if (tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return true;
	if (tag === 'INPUT' && target.type !== 'range') return true;
	if (target.isContentEditable) return true;

	return false;
}

function setDataModalTab(tabName) {
	var tabs = [
		{ name: 'missions', tabId: 'data-modal__tab-missions', panelId: 'data-modal__panel-missions' },
		{ name: 'presidios', tabId: 'data-modal__tab-presidios', panelId: 'data-modal__panel-presidios' },
		{ name: 'provincia-mayor', tabId: 'data-modal__tab-provincia-mayor', panelId: 'data-modal__panel-provincia-mayor' },
	];

	tabs.forEach(function(item) {
		var tab = document.getElementById(item.tabId);
		var panel = document.getElementById(item.panelId);
		if (!tab || !panel) return;

		var isActive = tabName === item.name;
		tab.classList.toggle('is-active', isActive);
		tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
		panel.classList.toggle('is-active', isActive);
		panel.hidden = !isActive;
	});
}

function openDataModal() {
	var modal = document.getElementById('data-modal');
	if (!modal) return;

	syncDebuggingTables();
	setDataModalTab('missions');
	modal.classList.add('is-open');
	modal.setAttribute('aria-hidden', 'false');
}

function closeDataModal() {
	var modal = document.getElementById('data-modal');
	if (!modal || !modal.classList.contains('is-open')) return;

	applyMissions(collectMissionsGeojsonFromTable());
	applyPresidios(collectPresidiosGeojsonFromTable());
	applyProvinciaMayor(collectProvinciaMayorGeojsonFromTable());
	modal.classList.remove('is-open');
	modal.setAttribute('aria-hidden', 'true');
}

function toggleDataModal() {
	if (isDataModalOpen()) {
		closeDataModal();
	} else {
		openDataModal();
	}
}

function setupDataModal() {
	var closeBtn = document.getElementById('data-modal__close');
	var missionsTab = document.getElementById('data-modal__tab-missions');
	var presidiosTab = document.getElementById('data-modal__tab-presidios');
	var provinciaMayorTab = document.getElementById('data-modal__tab-provincia-mayor');
	var exportBtn = document.getElementById('missions-export-btn');
	var downloadBtn = document.getElementById('missions-download-btn');
	var presidiosExportBtn = document.getElementById('presidios-export-btn');
	var presidiosDownloadBtn = document.getElementById('presidios-download-btn');
	var provinciaMayorExportBtn = document.getElementById('provincia-mayor-export-btn');
	var provinciaMayorDownloadBtn = document.getElementById('provincia-mayor-download-btn');

	if (closeBtn) closeBtn.addEventListener('click', closeDataModal);
	if (missionsTab) missionsTab.addEventListener('click', function() { setDataModalTab('missions'); });
	if (presidiosTab) presidiosTab.addEventListener('click', function() { setDataModalTab('presidios'); });
	if (provinciaMayorTab) provinciaMayorTab.addEventListener('click', function() { setDataModalTab('provincia-mayor'); });
	if (exportBtn) exportBtn.addEventListener('click', exportMissionsGeojson);
	if (downloadBtn) downloadBtn.addEventListener('click', downloadMissionsGeojson);
	if (presidiosExportBtn) presidiosExportBtn.addEventListener('click', exportPresidiosGeojson);
	if (presidiosDownloadBtn) presidiosDownloadBtn.addEventListener('click', downloadPresidiosGeojson);
	if (provinciaMayorExportBtn) provinciaMayorExportBtn.addEventListener('click', exportProvinciaMayorGeojson);
	if (provinciaMayorDownloadBtn) provinciaMayorDownloadBtn.addEventListener('click', downloadProvinciaMayorGeojson);

	document.addEventListener('keydown', function(event) {
		if (event.key === 'Escape' && isDataModalOpen()) {
			event.preventDefault();
			closeDataModal();
			return;
		}

		if (event.key !== 'x' && event.key !== 'X') return;
		if (shouldIgnoreDataModalShortcut(event)) return;

		event.preventDefault();
		toggleDataModal();
	});
}

function rasterizeMissionMarker(fillColor, logicalSize, pixelRatio) {
	pixelRatio = pixelRatio || 1;
	var size = Math.round(logicalSize * pixelRatio);
	var canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	var radius = size / 2;

	ctx.beginPath();
	ctx.arc(radius, radius, radius, 0, Math.PI * 2);
	ctx.fillStyle = fillColor;
	ctx.fill();

	ctx.fillStyle = '#ffffff';
	var scale = size / MISSION_MARKER_LOGICAL_SIZE;
	ctx.save();
	ctx.scale(scale, scale);
	ctx.fill(new Path2D(MISSION_CROSS_PATH));
	ctx.restore();

	return ctx.getImageData(0, 0, size, size);
}

function loadMissionIconImages(callback) {
	var dpr = getMarkerPixelRatio();
	Object.keys(ORDER_COLORS).forEach(function(order) {
		var imageId = 'mission-' + order.toLowerCase();
		if (!map.hasImage(imageId)) {
			map.addImage(
				imageId,
				rasterizeMissionMarker(ORDER_COLORS[order], MISSION_MARKER_LOGICAL_SIZE, dpr),
				{ pixelRatio: dpr }
			);
		}
	});
	callback();
}

function getMarkerIconSizeAtReferenceZoom(markerRadius, imageLogicalSize) {
	return (markerRadius * 2) / imageLogicalSize;
}

function getZoomScaledIconSizeExpression(baseSizeAtReferenceZoom) {
	var size = baseSizeAtReferenceZoom * MARKER_ICON_SIZE_SCALE;
	return [
		'interpolate',
		['linear'],
		['zoom'],
		4, size * 0.55,
		MARKER_REFERENCE_ZOOM, size,
		10, size * 1.5,
		14, size * 2.25,
	];
}

function getMissionIconImageExpression() {
	return [
		'match',
		['get', 'order'],
		'Jesuit', 'mission-jesuit',
		'Franciscan', 'mission-franciscan',
		'Dominican', 'mission-dominican',
		'mission-franciscan',
	];
}

function getMissionSymbolLayout(baseRadius) {
	return {
		'icon-image': getMissionIconImageExpression(),
		'icon-size': getZoomScaledIconSizeExpression(
			getMarkerIconSizeAtReferenceZoom(baseRadius, MISSION_MARKER_LOGICAL_SIZE)
		),
		'icon-anchor': 'center',
		'icon-offset': iconOffsetExpression(),
		'icon-allow-overlap': true,
		'icon-ignore-placement': true,
	};
}

function getMarkerPixelRatio() {
	if (typeof window === 'undefined' || !window.devicePixelRatio) return 1;
	return Math.min(window.devicePixelRatio, 3);
}

function rasterizePresidioMarker(img, logicalHeight, pixelRatio) {
	pixelRatio = pixelRatio || 1;
	var srcW = img.naturalWidth || img.width;
	var srcH = img.naturalHeight || img.height;
	var height = Math.round(logicalHeight * pixelRatio);
	var width = Math.round(height * (srcW / srcH));
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = 'high';
	ctx.drawImage(img, 0, 0, width, height);
	return ctx.getImageData(0, 0, width, height);
}

function loadNationalCapitalIconImages(callback) {
	var dpr = getMarkerPixelRatio();
	var icons = Object.keys(NATIONAL_CAPITAL_ICONS).map(function(id) {
		return { id: id, url: NATIONAL_CAPITAL_ICONS[id] };
	});
	var pending = icons.length;

	icons.forEach(function(icon) {
		if (map.hasImage(icon.id)) {
			pending -= 1;
			if (pending === 0) callback();
			return;
		}

		var img = new Image();
		img.onload = function() {
			if (!map.hasImage(icon.id)) {
				map.addImage(
					icon.id,
					rasterizePresidioMarker(img, NATIONAL_CAPITAL_MARKER_LOGICAL_SIZE, dpr),
					{ pixelRatio: dpr }
				);
			}
			pending -= 1;
			if (pending === 0) callback();
		};
		img.onerror = function() {
			console.error('Failed to load capital symbol:', icon.url);
			pending -= 1;
			if (pending === 0) callback();
		};
		img.src = icon.url;
	});
}

function loadPresidioIconImages(callback) {
	var img = new Image();
	img.onload = function() {
		if (!map.hasImage('presidio')) {
			var dpr = getMarkerPixelRatio();
			map.addImage(
				'presidio',
				rasterizePresidioMarker(img, PRESIDIO_MARKER_LOGICAL_SIZE, dpr),
				{ pixelRatio: dpr }
			);
		}
		callback();
	};
	img.onerror = function() {
		console.error('Failed to load presidio symbol:', PRESIDIO_SYMBOL_URL);
		callback();
	};
	img.src = PRESIDIO_SYMBOL_URL;
}

function getPresidioIconImageExpression() {
	return 'presidio';
}

function getPresidioSymbolLayout(baseRadius) {
	return {
		'icon-image': getPresidioIconImageExpression(),
		'icon-size': getZoomScaledIconSizeExpression(
			getMarkerIconSizeAtReferenceZoom(baseRadius, PRESIDIO_MARKER_LOGICAL_SIZE)
		),
		'icon-anchor': 'center',
		'icon-offset': iconOffsetExpression(),
		'icon-allow-overlap': true,
		'icon-ignore-placement': true,
	};
}

function cloneFeature(feature) {
	return JSON.parse(JSON.stringify(feature));
}

function coordKey(coords) {
	return coords[0].toFixed(4) + ',' + coords[1].toFixed(4);
}

function applyColocatedIconOffsets(missionFeatures, presidioFeatures) {
	var hqByKey = {};
	missionFeatures.forEach(function(feature) {
		if (!isHqProperty(feature.properties.hq)) return;
		hqByKey[coordKey(feature.geometry.coordinates)] = feature;
	});

	presidioFeatures.forEach(function(feature) {
		if (!isCapitalProperty(feature.properties.capital)) return;
		var hq = hqByKey[coordKey(feature.geometry.coordinates)];
		if (!hq) return;
		hq.properties.iconOffset = MISSION_HQ_ICON_OFFSET.slice();
		feature.properties.iconOffset = PRESIDIO_CAPITAL_ICON_OFFSET.slice();
	});
}

function getVisibleMarkerGeojson() {
	var missionFeatures = getVisibleFeatures().map(cloneFeature);
	var presidioFeatures = annotatePresidioCapitals(getVisiblePresidioFeatures(), selectedYear);
	applyColocatedIconOffsets(missionFeatures, presidioFeatures);
	return {
		missions: {
			type: 'FeatureCollection',
			features: missionFeatures,
		},
		presidios: {
			type: 'FeatureCollection',
			features: presidioFeatures,
		},
	};
}

function getVisibleFeatures() {
	if (!missions) return [];
	return missions.features.filter(function(feature) {
		return (feature.properties.year || 0) <= selectedYear;
	});
}

function getVisibleGeojson() {
	return {
		type: 'FeatureCollection',
		features: getVisibleFeatures(),
	};
}

function getVisiblePresidioFeatures() {
	if (!presidios) return [];
	if (selectedYear > PROVINCIA_MAYOR_END_YEAR) return [];
	return presidios.features.filter(function(feature) {
		return (feature.properties.year || 0) <= selectedYear;
	});
}

function getVisiblePresidiosGeojson() {
	return {
		type: 'FeatureCollection',
		features: getVisiblePresidioFeatures(),
	};
}

function buildPresidioPopupHtml(props) {
	var capitalLabel = '';
	if (isCapitalProperty(props.capital) && props.year_became_capital != null) {
		capitalLabel = props.year_ended_as_capital != null
			? 'Royal capital (' + props.year_became_capital + '–' + props.year_ended_as_capital + ')'
			: 'Royal capital (since ' + props.year_became_capital + ')';
	}
	var regionLabel = props.region ? String(props.region).charAt(0).toUpperCase() + String(props.region).slice(1) : '';
	var typeParts = [];
	if (regionLabel) typeParts.push(regionLabel);
	if (capitalLabel) typeParts.push(capitalLabel);
	return (
		'<div class="mission-popup__name">' + props.name + '</div>' +
		popupDetailRow('mapPin', props.location) +
		popupDetailRow('clock', String(props.year)) +
		(typeParts.length ? popupDetailRow('flag', typeParts.join(' · ')) : '')
	);
}

function buildPopupHtml(props) {
	var orderLabel = props.order + (isHqProperty(props.hq) ? ' · HQ' : '');
	return (
		'<div class="mission-popup__name">' + props.name + '</div>' +
		popupDetailRow('mapPin', props.location) +
		popupDetailRow('clock', String(props.year)) +
		popupDetailRow('church', orderLabel)
	);
}

function updateTimelineUi() {
	var label = document.getElementById('timeline__label');
	if (label) label.textContent = String(selectedYear);
	updateTimelineTickStates();
	updateTimelineControls();
}

function updateTimelineTickStates() {
	var ticksEl = document.getElementById('timeline__ticks');
	if (!ticksEl) return;

	Array.prototype.forEach.call(ticksEl.children, function(tick) {
		var year = Number(tick.dataset.year);
		if (isNaN(year)) return;
		tick.classList.toggle('is-past', year <= selectedYear);
	});
}

function getDecadeTickYears() {
	var first = Math.ceil(minYear / 10) * 10;
	var years = [];
	for (var year = first; year <= maxYear; year += 10) {
		years.push(year);
	}
	return years;
}

function renderTimelineTicks() {
	var ticksEl = document.getElementById('timeline__ticks');
	if (!ticksEl) return;

	ticksEl.innerHTML = '';
	var span = maxYear - minYear;
	if (span <= 0) return;

	getDecadeTickYears().forEach(function(year) {
		var tick = document.createElement('div');
		tick.className = 'timeline-tick' + (year <= selectedYear ? ' is-past' : '');
		tick.dataset.year = String(year);
		tick.style.left = ((year - minYear) / span * 100) + '%';

		var mark = document.createElement('span');
		mark.className = 'timeline-tick__mark';
		tick.appendChild(mark);

		ticksEl.appendChild(tick);
	});
}

function renderTimelineEvents() {
	var eventsEl = document.getElementById('timeline__events');
	if (!eventsEl) return;

	eventsEl.innerHTML = '';
	var span = maxYear - minYear;
	if (span <= 0) return;

	timelineEvents.forEach(function(event) {
		if (event.year < minYear || event.year > maxYear) return;

		var button = document.createElement('button');
		button.type = 'button';
		button.className = 'timeline-event';
		button.style.left = ((event.year - minYear) / span * 100) + '%';
		button.setAttribute('aria-label', event.year + ': ' + event.name);

		var mark = document.createElement('span');
		mark.className = 'timeline-event__mark';
		mark.setAttribute('aria-hidden', 'true');
		button.appendChild(mark);

		var tooltip = document.createElement('span');
		tooltip.className = 'timeline-event__tooltip';
		tooltip.setAttribute('role', 'tooltip');

		var yearEl = document.createElement('strong');
		yearEl.className = 'timeline-event__year';
		yearEl.textContent = String(event.year);
		tooltip.appendChild(yearEl);

		var nameEl = document.createElement('span');
		nameEl.className = 'timeline-event__name';
		nameEl.textContent = event.name;
		tooltip.appendChild(nameEl);

		var descEl = document.createElement('span');
		descEl.className = 'timeline-event__desc';
		descEl.textContent = event.description;
		tooltip.appendChild(descEl);

		button.appendChild(tooltip);
		button.addEventListener('click', function() {
			pauseTimelineAnimation();
			setTimelineYear(event.year);
		});

		eventsEl.appendChild(button);
	});
}

function setTimelineYear(year) {
	selectedYear = Math.min(Math.max(year, minYear), maxYear);
	var slider = document.getElementById('timeline__range');
	if (slider) slider.value = String(selectedYear);
	updateMissionData();
}

function stepTimelineYear(delta) {
	pauseTimelineAnimation();
	setTimelineYear(selectedYear + delta);
}

function getTimelineMilestoneYears() {
	var years = [];
	var seen = {};
	timelineEvents.forEach(function(event) {
		if (event.year < minYear || event.year > maxYear) return;
		if (seen[event.year]) return;
		seen[event.year] = true;
		years.push(event.year);
	});
	years.sort(function(a, b) {
		return a - b;
	});
	return years;
}

function getAdjacentMilestoneYear(delta) {
	var years = getTimelineMilestoneYears();
	if (!years.length) return null;

	if (delta > 0) {
		for (var i = 0; i < years.length; i++) {
			if (years[i] > selectedYear) return years[i];
		}
		return null;
	}

	for (var j = years.length - 1; j >= 0; j--) {
		if (years[j] < selectedYear) return years[j];
	}
	return null;
}

function stepTimelineMilestone(delta) {
	pauseTimelineAnimation();
	var year = getAdjacentMilestoneYear(delta);
	if (year != null) setTimelineYear(year);
}

function updateTimelineControls() {
	var playBtn = document.getElementById('timeline__play');
	var prevBtn = document.getElementById('timeline__prev');
	var nextBtn = document.getElementById('timeline__next');

	if (prevBtn) prevBtn.disabled = getAdjacentMilestoneYear(-1) == null;
	if (nextBtn) nextBtn.disabled = getAdjacentMilestoneYear(1) == null;

	if (!playBtn) return;

	if (timelinePlaying) {
		setButtonIcon(playBtn, 'pause');
		playBtn.setAttribute('aria-label', 'Pause timeline');
		playBtn.disabled = false;
		return;
	}

	setButtonIcon(playBtn, 'play');
	playBtn.setAttribute('aria-label', 'Play timeline');
	playBtn.disabled = selectedYear >= maxYear && minYear >= maxYear;
}

function stopTimelineAnimation() {
	timelinePlaying = false;
	if (timelineAnimationId) {
		cancelAnimationFrame(timelineAnimationId);
		timelineAnimationId = null;
	}
	updateTimelineControls();
}

function pauseTimelineAnimation() {
	stopTimelineAnimation();
}

function playTimelineAnimation() {
	if (timelinePlaying) {
		stopTimelineAnimation();
		return;
	}

	timelinePlaying = true;
	updateTimelineControls();

	var lastStepAt = 0;

	function frame(timestamp) {
		if (!timelinePlaying) return;

		if (!lastStepAt) lastStepAt = timestamp;
		if (timestamp - lastStepAt >= timelineStepMs) {
			lastStepAt = timestamp;
			if (selectedYear >= maxYear) {
				stopTimelineAnimation();
				return;
			}
			setTimelineYear(selectedYear + 1);
		}

		timelineAnimationId = requestAnimationFrame(frame);
	}

	timelineAnimationId = requestAnimationFrame(frame);
}

function updateMissionData() {
	if (!map) return;

	var markerData = getVisibleMarkerGeojson();
	if (map.getSource('missions')) {
		map.getSource('missions').setData(markerData.missions);
	}
	if (map.getSource('presidios')) {
		map.getSource('presidios').setData(markerData.presidios);
	}
	if (map.getSource('provincia-regions')) {
		map.getSource('provincia-regions').setData(getVisibleProvinciaRegionGeojson());
	}
	if (map.getSource('provincia-mayor')) {
		map.getSource('provincia-mayor').setData(getVisibleProvinciaMayorGeojson());
	}
	if (map.getSource('mexico')) {
		map.getSource('mexico').setData(getVisibleMexicoGeojson());
	}
	if (map.getSource('texas')) {
		map.getSource('texas').setData(getVisibleTexasGeojson());
	}
	if (map.getSource('us-states')) {
		map.getSource('us-states').setData(getVisibleUsStateGeojson());
	}
	updateNationalCapitals();
	syncLegendLayerVisibility();
	updateTimelineUi();
}

function unionBoundsFromGeojson(bounds, geojson) {
	if (!geojson || !geojson.features) return;
	geojson.features.forEach(function(feature) {
		if (feature.geometry && feature.geometry.coordinates) {
			extendBoundsWithCoords(bounds, feature.geometry.coordinates);
		}
	});
}

function fitMapToCustomLayers(options) {
	if (!map) return;

	options = options || {};
	var bounds = new mapboxgl.LngLatBounds();

	unionBoundsFromGeojson(bounds, missions);
	unionBoundsFromGeojson(bounds, presidios);
	unionBoundsFromGeojson(bounds, california);
	unionBoundsFromGeojson(bounds, getVisibleNationalCapitalsGeojson());

	if (bounds.isEmpty()) return;

	map.fitBounds(bounds, {
		padding: { top: 48, bottom: 96, left: 48, right: 48 },
		duration: options.duration != null ? options.duration : 600,
	});
}

function setupTimeline() {
	var slider = document.getElementById('timeline__range');
	var playBtn = document.getElementById('timeline__play');
	var prevBtn = document.getElementById('timeline__prev');
	var nextBtn = document.getElementById('timeline__next');
	if (!slider) return;

	slider.min = String(minYear);
	slider.max = String(maxYear);
	slider.value = String(selectedYear);
	renderTimelineTicks();
	renderTimelineEvents();

	slider.addEventListener('pointerdown', function() {
		pauseTimelineAnimation();
	});

	slider.addEventListener('input', function() {
		pauseTimelineAnimation();
		setTimelineYear(Number(slider.value));
	});

	if (playBtn) {
		playBtn.addEventListener('click', playTimelineAnimation);
	}

	if (prevBtn) {
		prevBtn.addEventListener('click', function() {
			stepTimelineMilestone(-1);
		});
	}

	if (nextBtn) {
		nextBtn.addEventListener('click', function() {
			stepTimelineMilestone(1);
		});
	}

	setTimelineYear(selectedYear);

	document.addEventListener('keydown', function(event) {
		if (event.key !== '[' && event.key !== ']') return;
		if (shouldIgnoreTimelineShortcut(event)) return;

		event.preventDefault();
		stepTimelineYear(event.key === '[' ? -1 : 1);
	});

	updateTimelineUi();
}

function setupPresidioInteractions() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	['presidios-symbols', 'presidios-capital-symbols'].forEach(function(layerId) {
		map.on('mouseenter', layerId, function() {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', layerId, function() {
			map.getCanvas().style.cursor = '';
			popup.remove();
		});

		map.on('mousemove', layerId, function(event) {
			if (!event.features || !event.features.length) return;
			var props = event.features[0].properties;
			popup
				.setLngLat(event.lngLat)
				.setHTML(buildPresidioPopupHtml(props))
				.addTo(map);
		});
	});
}

function setupMissionInteractions() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	['missions-symbols', 'missions-hq-symbols'].forEach(function(layerId) {
		map.on('mouseenter', layerId, function() {
			map.getCanvas().style.cursor = 'pointer';
		});

		map.on('mouseleave', layerId, function() {
			map.getCanvas().style.cursor = '';
			popup.remove();
		});

		map.on('mousemove', layerId, function(event) {
			if (!event.features || !event.features.length) return;
			var props = event.features[0].properties;
			popup
				.setLngLat(event.lngLat)
				.setHTML(buildPopupHtml(props))
				.addTo(map);
		});
	});
}

function addMissionLayers() {
	var missionPaint = { 'icon-opacity': MISSION_MARKER_OPACITY };

	map.addLayer({
		id: 'missions-symbols',
		type: 'symbol',
		source: 'missions',
		filter: ['all', notHqFilter(), getMissionOrderFilter()],
		layout: getMissionSymbolLayout(MISSION_CIRCLE_RADIUS),
		paint: missionPaint,
	});

	map.addLayer({
		id: 'missions-hq-symbols',
		type: 'symbol',
		source: 'missions',
		filter: ['all', isHqExpression(), getMissionOrderFilter()],
		layout: getMissionSymbolLayout(MISSION_HQ_CIRCLE_RADIUS),
		paint: missionPaint,
	});
}

function initMap() {
	map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/dark-v11',
		center: [-117.5, 32.5],
		zoom: 5,
		hash: true,
		attributionControl: false,
	});

	map.addControl(new mapboxgl.NavigationControl(), 'top-right');
	map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

	map.on('load', function() {
		addProvinciaRegionLayers();
		addProvinciaMayorLayers();
		addMexicoLayers();
		addTexasLayers();
		addUsStateLayers();
		addCaliforniaLayers();
		setupPolygonLayerInteractions('provincia-regions-fill', buildProvinciaRegionPopupHtml);
		setupPolygonLayerInteractions('provincia-mayor-fill', buildContextPopupHtml);
		setupPolygonLayerInteractions('us-states-fill', buildUsStatePopupHtml);
		setupPolygonLayerInteractions('california-outline', buildCaliforniaPopupHtml);
		setupLegendControls();

		map.addSource('missions', {
			type: 'geojson',
			data: getVisibleMarkerGeojson().missions,
		});

		map.addSource('presidios', {
			type: 'geojson',
			data: getVisibleMarkerGeojson().presidios,
		});

		loadPresidioIconImages(function() {
			loadMissionIconImages(function() {
			loadNationalCapitalIconImages(function() {
			var symbolPaint = { 'icon-opacity': 0.95 };

			map.addLayer({
				id: 'presidios-symbols',
				type: 'symbol',
				source: 'presidios',
				filter: notCapitalFilter(),
				layout: getPresidioSymbolLayout(MISSION_CIRCLE_RADIUS),
				paint: symbolPaint,
			});

			map.addLayer({
				id: 'presidios-capital-symbols',
				type: 'symbol',
				source: 'presidios',
				filter: isCapitalExpression(),
				layout: getPresidioSymbolLayout(PRESIDIO_CAPITAL_CIRCLE_RADIUS),
				paint: symbolPaint,
			});

			addMissionLayers();

			addNationalCapitalLayers();
			setupMissionInteractions();
			setupPresidioInteractions();
			setupNationalCapitalInteractions();
			setupTimeline();
			syncLegendLayerVisibility();
			map.once('idle', function() {
				if (!window.location.hash) {
					fitMapToCustomLayers({ duration: 0 });
				}
			});
			});
			});
		});
	});
}

loadReadmeMarkdown().then(applyLegendTitleFromReadme).catch(function(error) {
	console.error(error);
});

Promise.all([
	fetch('./milestones.csv').then(function(response) {
		if (!response.ok) throw new Error('Failed to load milestones.csv');
		return response.text();
	}),
	fetch('./layers/missions.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load layers/missions.geojson');
		return response.json();
	}),
	fetch('./layers/presidios.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load layers/presidios.geojson');
		return response.json();
	}),
	fetch('./layers/context-Provincia_mayor.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load layers/context-Provincia_mayor.geojson');
		return response.json();
	}),
	fetch('./layers/california.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load layers/california.geojson');
		return response.json();
	}),
].concat(MEXICO_PERIOD_YEARS.map(function(year) {
	return fetch('./layers/context-mexico-' + year + '.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load layers/context-mexico-' + year + '.geojson');
		return response.json();
	});
})).concat([
	fetch('./layers/context-texas.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load layers/context-texas.geojson');
		return response.json();
	}),
]).concat(US_STATE_DECADES.map(function(decade) {
	return fetch(getUsStateGeojsonUrl(decade)).then(function(response) {
		if (!response.ok) throw new Error('Failed to load ' + getUsStateGeojsonUrl(decade));
		return response.json();
	});
}))).then(function(results) {
	applyTimelineEvents(parseMilestonesCsv(results[0]));
	applyMissions(results[1]);
	applyPresidios(results[2]);
	provinciaMayor = results[3];
	california = results[4];
	mexicoByPeriod = {};
	MEXICO_PERIOD_YEARS.forEach(function(year, index) {
		mexicoByPeriod[year] = results[5 + index];
	});
	texasGeojson = results[5 + MEXICO_PERIOD_YEARS.length];
	usStateByDecade = {};
	US_STATE_DECADES.forEach(function(decade, index) {
		usStateByDecade[decade] = results[6 + MEXICO_PERIOD_YEARS.length + index];
	});
	initMap();
	setupDataModal();
	setupReadmeModal();
}).catch(function(error) {
	console.error(error);
});
