mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN || '';

var ORDER_HQ = {
	Jesuit: 'Nuestra Señora de Loreto Conchó',
	Franciscan: 'San Carlos Borromeo de Carmelo',
	Dominican: 'San Vicente Ferrer',
};

var MISSION_ORDERS = ['Jesuit', 'Franciscan', 'Dominican'];
var missionIconWidth = 36;
var missionHqIconWidth = 72;

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

function getNewSpainGeojson() {
	return selectedYear >= NEW_SPAIN_BOUNDARY_YEAR ? newSpain1819 : newSpain1794;
}

function updateNewSpainData() {
	if (!map || !map.getSource('new-spain')) return;
	map.getSource('new-spain').setData(getNewSpainGeojson());
}

function addNewSpainLayers() {
	map.addSource('new-spain', {
		type: 'geojson',
		data: getNewSpainGeojson(),
	});

	map.addLayer({
		id: 'new-spain-fill',
		type: 'fill',
		source: 'new-spain',
		paint: {
			'fill-color': '#e9c46a',
			'fill-opacity': 0.12,
		},
	});

	map.addLayer({
		id: 'new-spain-outline',
		type: 'line',
		source: 'new-spain',
		paint: {
			'line-color': '#e9c46a',
			'line-opacity': 0.4,
			'line-width': 1.5,
		},
	});
}

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
var newSpain1794;
var newSpain1819;
var NEW_SPAIN_BOUNDARY_YEAR = 1819;
var map;
var minYear = 1683;
var maxYear = 1834;
var selectedYear = maxYear;
var timelinePlaying = false;
var timelineAnimationId = null;
var timelineStepMs = 150;

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
	renderTimelineTicks();
	updatePlayButtonState();
}

function applyMissions(data) {
	missions = normalizeMissions(data);
	syncYearRange();
	updateMissionData();
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

function getMissionIconId(order, isHq) {
	return 'mission-' + String(order || '').toLowerCase() + (isHq ? '-hq' : '');
}

function getMissionIconImageExpression() {
	return [
		'case',
		isHqExpression(),
		[
			'match',
			['get', 'order'],
			'Jesuit', 'mission-jesuit-hq',
			'Franciscan', 'mission-franciscan-hq',
			'Dominican', 'mission-dominican-hq',
			'mission-jesuit-hq',
		],
		[
			'match',
			['get', 'order'],
			'Jesuit', 'mission-jesuit',
			'Franciscan', 'mission-franciscan',
			'Dominican', 'mission-dominican',
			'mission-jesuit',
		],
	];
}

function rasterizeMissionIcon(img, width) {
	width = width || missionIconWidth;
	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = width;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, width);
	return ctx.getImageData(0, 0, width, width);
}

function loadMissionIconImages(callback) {
	var icons = [];
	MISSION_ORDERS.forEach(function(order) {
		icons.push({ order: order, isHq: false, width: missionIconWidth });
		icons.push({ order: order, isHq: true, width: missionHqIconWidth });
	});

	var pending = icons.length;
	if (!pending) {
		callback();
		return;
	}

	icons.forEach(function(icon) {
		var iconId = getMissionIconId(icon.order, icon.isHq);
		var img = new Image();

		img.onload = function() {
			if (!map.hasImage(iconId)) {
				map.addImage(iconId, rasterizeMissionIcon(img, icon.width), { pixelRatio: 1 });
			}
			pending -= 1;
			if (pending === 0) callback();
		};
		img.onerror = function() {
			console.error('Failed to load mission icon:', iconId);
			pending -= 1;
			if (pending === 0) callback();
		};
		img.src = './assets/' + iconId + '.svg';
	});
}

function getMissionSymbolLayout() {
	return {
		'icon-image': getMissionIconImageExpression(),
		'icon-size': 0.75,
		'icon-anchor': 'center',
		'icon-allow-overlap': true,
		'icon-ignore-placement': true,
		'symbol-sort-key': [
			'case',
			isHqExpression(),
			1,
			0,
		],
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

function buildPopupHtml(props) {
	var hqLabel = isHqProperty(props.hq) ? ' · HQ' : '';
	return (
		'<div class="mission-popup__name">' + props.name + '</div>' +
		'<div class="mission-popup__detail">' + props.location + '</div>' +
		'<div class="mission-popup__detail">' + props.year + ' · ' + props.order + hqLabel + '</div>'
	);
}

function updateTimelineUi() {
	var label = document.getElementById('timeline__label');
	if (label) label.textContent = String(selectedYear);
	updatePlayButtonState();
}

function getDecadeTickYears() {
	var first = Math.floor(minYear / 20) * 20;
	var years = [];
	for (var year = first; year <= maxYear; year += 20) {
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
		tick.className = 'timeline-tick';
		tick.style.left = ((year - minYear) / span * 100) + '%';

		var mark = document.createElement('span');
		mark.className = 'timeline-tick__mark';
		tick.appendChild(mark);

		ticksEl.appendChild(tick);
	});
}

function setTimelineYear(year) {
	selectedYear = Math.min(Math.max(year, minYear), maxYear);
	var slider = document.getElementById('timeline__range');
	if (slider) slider.value = String(selectedYear);
	updateMissionData();
}

function updatePlayButtonState() {
	var playBtn = document.getElementById('timeline__play');
	if (!playBtn) return;

	if (timelinePlaying) {
		playBtn.textContent = '❚❚';
		playBtn.setAttribute('aria-label', 'Pause timeline');
		playBtn.disabled = false;
		return;
	}

	playBtn.textContent = '▶';
	playBtn.setAttribute('aria-label', 'Play timeline');
	playBtn.disabled = selectedYear >= maxYear && minYear >= maxYear;
}

function stopTimelineAnimation() {
	timelinePlaying = false;
	if (timelineAnimationId) {
		cancelAnimationFrame(timelineAnimationId);
		timelineAnimationId = null;
	}
	updatePlayButtonState();
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
	setTimelineYear(minYear);
	updatePlayButtonState();

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
	if (!map || !map.getSource('missions')) return;

	map.getSource('missions').setData(getVisibleGeojson());
	updateNewSpainData();
	updateTimelineUi();
}

function fitMapToMissions(options) {
	if (!map || !missions || !missions.features.length) return;

	options = options || {};
	var bounds = new mapboxgl.LngLatBounds();
	missions.features.forEach(function(feature) {
		bounds.extend(feature.geometry.coordinates);
	});

	map.fitBounds(bounds, {
		padding: { top: 48, bottom: 96, left: 48, right: 48 },
		duration: options.duration != null ? options.duration : 600,
	});
}

function setupTimeline() {
	var slider = document.getElementById('timeline__range');
	var playBtn = document.getElementById('timeline__play');
	if (!slider) return;

	slider.min = String(minYear);
	slider.max = String(maxYear);
	slider.value = String(selectedYear);
	renderTimelineTicks();

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

	updateTimelineUi();
}

function setupMissionInteractions() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		offset: 12,
		className: 'mission-popup',
	});

	map.on('mouseenter', 'missions-symbols', function() {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mouseleave', 'missions-symbols', function() {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});

	map.on('mousemove', 'missions-symbols', function(event) {
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
		addNewSpainLayers();
		addCaliforniaLayers();

		map.addSource('missions', {
			type: 'geojson',
			data: getVisibleGeojson(),
		});

		loadMissionIconImages(function() {
			map.addLayer({
				id: 'missions-symbols',
				type: 'symbol',
				source: 'missions',
				layout: getMissionSymbolLayout(),
				paint: {
					'icon-opacity': 0.95,
				},
			});

			addMexicoCityLayers();
			setupMissionInteractions();
			setupMexicoCityInteractions();
			setupTimeline();
			map.once('idle', function() {
				fitMapToMissions({ duration: 0 });
			});
		});
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
	fetch('./new-spain-1794.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load new-spain-1794.geojson');
		return response.json();
	}),
	fetch('./new-spain-1819.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load new-spain-1819.geojson');
		return response.json();
	}),
]).then(function(results) {
	missions = normalizeMissions(results[0]);
	california = results[1];
	newSpain1794 = results[2];
	newSpain1819 = results[3];
	syncYearRange();
	initMap();
	setupDataModal();
}).catch(function(error) {
	console.error(error);
});
