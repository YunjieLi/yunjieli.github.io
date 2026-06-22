mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN || '';

var ORDER_COLORS = {
	Jesuit: '#2a6f97',
	Franciscan: '#bc6c25',
	Dominican: '#606c38',
};

var MEXICO_CITY = {
	type: 'FeatureCollection',
	features: [{
		type: 'Feature',
		geometry: {
			type: 'Point',
			coordinates: [-99.1332, 19.4326],
		},
		properties: {
			name: 'Mexico City',
		},
	}],
};

function addCaliforniaLayers() {
	map.addSource('california', {
		type: 'geojson',
		data: california,
	});

	map.addLayer({
		id: 'california-fill',
		type: 'fill',
		source: 'california',
		paint: {
			'fill-color': '#bc6c25',
			'fill-opacity': 0.18,
		},
	});

	map.addLayer({
		id: 'california-outline',
		type: 'line',
		source: 'california',
		paint: {
			'line-color': '#bc6c25',
			'line-opacity': 0.45,
			'line-width': 1.5,
		},
	});
}

function addMexicoCityLayers() {
	map.addSource('mexico-city', {
		type: 'geojson',
		data: MEXICO_CITY,
	});

	map.addLayer({
		id: 'mexico-city-halo',
		type: 'circle',
		source: 'mexico-city',
		paint: {
			'circle-radius': [
				'interpolate',
				['linear'],
				['zoom'],
				4, 10,
				8, 14,
				12, 18,
			],
			'circle-color': '#e9c46a',
			'circle-opacity': 0.25,
			'circle-stroke-width': 0,
		},
	});

	map.addLayer({
		id: 'mexico-city-dot',
		type: 'circle',
		source: 'mexico-city',
		paint: {
			'circle-radius': [
				'interpolate',
				['linear'],
				['zoom'],
				4, 4,
				8, 6,
				12, 8,
			],
			'circle-color': '#e9c46a',
			'circle-stroke-color': '#fff',
			'circle-stroke-width': 2,
			'circle-opacity': 1,
		},
	});

	map.addLayer({
		id: 'mexico-city-label',
		type: 'symbol',
		source: 'mexico-city',
		minzoom: 4,
		layout: {
			'text-field': ['get', 'name'],
			'text-size': 12,
			'text-offset': [0, 1.2],
			'text-anchor': 'top',
			'text-letter-spacing': 0.02,
		},
		paint: {
			'text-color': '#e9c46a',
			'text-halo-color': '#1a1a1c',
			'text-halo-width': 1.5,
		},
	});
}

function setupMexicoCityInteractions() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	map.on('mouseenter', 'mexico-city-dot', function() {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', 'mexico-city-dot', function() {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});

	map.on('mousemove', 'mexico-city-dot', function(event) {
		popup
			.setLngLat(event.lngLat)
			.setHTML('<div class="mission-popup__name">Mexico City</div>')
			.addTo(map);
	});
}

var missions;
var california;
var map;
var minYear = 1683;
var maxYear = 1834;
var selectedYear = maxYear;

function syncYearRange() {
	if (!missions || !missions.features.length) return;

	var years = missions.features
		.map(function(feature) { return feature.properties.year; })
		.filter(function(year) { return typeof year === 'number' && !isNaN(year); });

	if (!years.length) return;

	minYear = Math.min.apply(null, years);
	maxYear = Math.max.apply(null, years);
	if (selectedYear > maxYear) selectedYear = maxYear;
	if (selectedYear < minYear) selectedYear = minYear;

	var slider = document.getElementById('timeline__range');
	if (slider) {
		slider.min = String(minYear);
		slider.max = String(maxYear);
		slider.value = String(selectedYear);
	}
}

function applyMissions(data) {
	missions = data;
	syncYearRange();
	updateMissionData();
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
			},
			geometry: {
				type: 'Point',
				coordinates: [
					parseFloat(cells[5].textContent.trim()),
					parseFloat(cells[6].textContent.trim()),
				],
			},
		};

		var idText = cells[7].textContent.trim();
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
	return JSON.stringify(collectMissionsGeojsonFromTable(), null, 2) + '\n';
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

function openDataModal() {
	var modal = document.getElementById('data-modal');
	if (!modal) return;

	populateMissionsTable();
	modal.classList.add('is-open');
	modal.setAttribute('aria-hidden', 'false');
}

function closeDataModal() {
	var modal = document.getElementById('data-modal');
	if (!modal || !modal.classList.contains('is-open')) return;

	applyMissions(collectMissionsGeojsonFromTable());
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
	var exportBtn = document.getElementById('missions-export-btn');
	var downloadBtn = document.getElementById('missions-download-btn');

	if (closeBtn) closeBtn.addEventListener('click', closeDataModal);
	if (exportBtn) exportBtn.addEventListener('click', exportMissionsGeojson);
	if (downloadBtn) downloadBtn.addEventListener('click', downloadMissionsGeojson);

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

function orderColorExpression() {
	return [
		'match',
		['get', 'order'],
		'Jesuit', ORDER_COLORS.Jesuit,
		'Franciscan', ORDER_COLORS.Franciscan,
		'Dominican', ORDER_COLORS.Dominican,
		'#888',
	];
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

function buildPopupHtml(props) {
	return (
		'<div class="mission-popup__name">' + props.name + '</div>' +
		'<div class="mission-popup__detail">' + props.location + '</div>' +
		'<div class="mission-popup__detail">' + props.year + ' · ' + props.order + '</div>'
	);
}

function updateTimelineUi() {
	var label = document.getElementById('timeline__label');
	var meta = document.getElementById('timeline__meta');
	var count = getVisibleFeatures().length;

	if (label) label.textContent = String(selectedYear);
	if (meta) {
		meta.textContent = count + (count === 1 ? ' mission' : ' missions');
	}
}

function updateMissionData() {
	if (!map || !map.getSource('missions')) return;

	map.getSource('missions').setData(getVisibleGeojson());
	updateTimelineUi();
}

function fitMapToMissions() {
	var features = getVisibleFeatures();
	if (!features.length || !map) return;

	var bounds = new mapboxgl.LngLatBounds();
	features.forEach(function(feature) {
		bounds.extend(feature.geometry.coordinates);
	});

	map.fitBounds(bounds, {
		padding: { top: 60, bottom: 100, left: 40, right: 40 },
		maxZoom: 7,
		duration: 600,
	});
}

function setupTimeline() {
	var slider = document.getElementById('timeline__range');
	if (!slider) return;

	slider.min = String(minYear);
	slider.max = String(maxYear);
	slider.value = String(selectedYear);

	slider.addEventListener('input', function() {
		selectedYear = Number(slider.value);
		updateMissionData();
	});

	slider.addEventListener('change', fitMapToMissions);
	updateTimelineUi();
}

function setupMissionInteractions() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	map.on('mouseenter', 'missions-circles', function() {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', 'missions-circles', function() {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});

	map.on('mousemove', 'missions-circles', function(event) {
		if (!event.features || !event.features.length) return;
		var props = event.features[0].properties;
		popup
			.setLngLat(event.lngLat)
			.setHTML(buildPopupHtml(props))
			.addTo(map);
	});
}

function initMap() {
	map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/dark-v11',
		center: [-117.5, 32.5],
		zoom: 5,
	});

	map.addControl(new mapboxgl.NavigationControl(), 'top-right');

	map.on('load', function() {
		addCaliforniaLayers();

		map.addSource('missions', {
			type: 'geojson',
			data: getVisibleGeojson(),
		});

		map.addLayer({
			id: 'missions-circles',
			type: 'circle',
			source: 'missions',
			paint: {
				'circle-radius': [
					'interpolate',
					['linear'],
					['zoom'],
					4, 5,
					8, 8,
					12, 11,
				],
				'circle-color': orderColorExpression(),
				'circle-stroke-color': '#fff',
				'circle-stroke-width': 2,
				'circle-opacity': 0.92,
			},
		});

		map.addLayer({
			id: 'missions-labels',
			type: 'symbol',
			source: 'missions',
			minzoom: 7,
			layout: {
				'text-field': ['get', 'name'],
				'text-size': 12,
				'text-offset': [0, 1.1],
				'text-anchor': 'top',
				'text-max-width': 14,
				'text-optional': true,
			},
			paint: {
				'text-color': '#e8e8e8',
				'text-halo-color': '#1a1a1c',
				'text-halo-width': 1.5,
			},
		});

		addMexicoCityLayers();

		setupMissionInteractions();
		setupMexicoCityInteractions();
		setupTimeline();
		fitMapToMissions();
	});
}

Promise.all([
	fetch('./missions.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load missions.geojson');
		return response.json();
	}),
	fetch('./california.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load california.geojson');
		return response.json();
	}),
]).then(function(results) {
	missions = results[0];
	california = results[1];
	syncYearRange();
	initMap();
	setupDataModal();
}).catch(function(error) {
	console.error(error);
});
