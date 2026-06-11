mapboxgl.accessToken = window.MAPBOX_ACCESS_TOKEN || '';

var isMobile;
$(window).width() <= 640 ? isMobile = true : isMobile = false;

var map;


var trips_straight;
var events;
var locations;
var basemapStyle;
var people = {
	"Pingzhi": {
		"name": "林平之"
	},
	"Yilin": {
		"name": "仪琳"
	},
	"Chong": {
		"name": "令狐冲"
	},
	"Lingshan": {
		"name": "岳灵珊"
	},
	"Yingying": {
		"name": "任盈盈"
	},
	"Narrator": {
		"name": "旁白"
	}
};
var empty = {
	"type": "FeatureCollection",
	"features": []
};
var trips = {
	"type": "FeatureCollection",
	"features": []
};
var eventArcs = {
	"type": "FeatureCollection",
	"features": []
};
var tripActive = {};

var idActive;
var animationID;

var segmentNumber = 10;
var defaultLocationType = 'countryside';
var locationIconWidth = 48;

function eventChapterSegSortKey(feature) {
	var props = feature.properties;
	var chapter = parseInt(props.chapter, 10) || 0;
	var seg = props.segIndex;
	if (seg == null && props.segID) {
		seg = parseInt(String(props.segID).replace('seg', ''), 10);
	}
	if (isNaN(seg)) seg = 0;
	return chapter * 1000 + seg;
}

function buildEventArcCoords(from, to) {
	var line = turf.lineString([from, to]);
	var distance = turf.length(line, { units: 'kilometers' });
	if (distance < 0.5) return null;

	var midPoint = turf.along(line, distance / 2, { units: 'kilometers' });
	var bearing = turf.bearing(turf.point(from), turf.point(to));
	var curveOffset = Math.min(Math.max(distance * 0.12, 8), 100);
	var control = turf.destination(midPoint, curveOffset, bearing + 90, { units: 'kilometers' });
	var curved = turf.bezierSpline(
		turf.lineString([from, control.geometry.coordinates, to]),
		{ sharpness: 0.85, resolution: 10000 }
	);

	return curved.geometry.coordinates;
}

function buildEventArcs() {
	if (eventArcs.features.length) return;

	var sortedEvents = events.features.slice().sort(function(a, b) {
		return eventChapterSegSortKey(a) - eventChapterSegSortKey(b);
	});

	for (var i = 0; i < sortedEvents.length - 1; i++) {
		var fromFeature = sortedEvents[i];
		var toFeature = sortedEvents[i + 1];
		var arcCoords = buildEventArcCoords(
			fromFeature.geometry.coordinates,
			toFeature.geometry.coordinates
		);
		if (!arcCoords) continue;

		eventArcs.features.push({
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: arcCoords,
			},
			properties: {
				fromEventId: fromFeature.id,
				toEventId: toFeature.id,
				segIndex: fromFeature.properties.segIndex,
			},
		});
	}
}

function createTripArcs() {
	if (trips.features.length) return;

	trips_straight.features.forEach(function(trip) {
		var properties = {
			segIndex: trip.properties.segID,
			segID: 'seg' + trip.properties.segID,
			vehicle: trip.properties.vehicle,
		};

		var route = {
			type: 'FeatureCollection',
			features: [{
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: trip.geometry.coordinates[0],
				},
				properties: properties,
			}],
		};

		var lineLength = turf.length(route.features[0], { units: 'kilometers' });
		var arc = [];

		for (var i = 0; i <= segmentNumber; i++) {
			var segment = turf.along(route.features[0], i * lineLength / segmentNumber, { units: 'kilometers' });
			arc.push(segment.geometry.coordinates);
		}

		route.features[0].geometry.coordinates = arc;
		trips.features.push(route.features[0]);
	});

	events.features.forEach(function(event) {
		event.properties.segIndex = parseInt(event.properties.segID.slice(3), 10);
	});
}

function filterBasemapLabels() {
	var keepLayers = basemapStyle.symbolLayers && basemapStyle.symbolLayers.keep;
	var keepSet = keepLayers ? new Set(keepLayers) : null;

	map.getStyle().layers.forEach(function(layer) {
		if (layer.type !== 'symbol') return;
		if (keepSet && keepSet.has(layer.id)) return;
		map.setLayoutProperty(layer.id, 'visibility', 'none');
	});
}

function hasUrlMapView() {
	var params = new URLSearchParams(window.location.search);
	var lat = parseFloat(params.get('lat'));
	var lon = parseFloat(params.get('lon'));
	return !isNaN(lat) && !isNaN(lon);
}

function getInitialMapView() {
	var params = new URLSearchParams(window.location.search);
	var lat = parseFloat(params.get('lat'));
	var lon = parseFloat(params.get('lon'));
	var zoom = parseFloat(params.get('zoom'));
	var center = basemapStyle.center.slice();
	var viewZoom = basemapStyle.zoom;

	if (!isNaN(lon) && !isNaN(lat)) {
		center = [lon, lat];
	}
	if (!isNaN(zoom)) {
		viewZoom = zoom;
	}
	if (basemapStyle.maxZoom != null && viewZoom > basemapStyle.maxZoom) {
		viewZoom = basemapStyle.maxZoom;
	}

	return { center: center, zoom: viewZoom };
}

function syncMapViewToUrl() {
	if (!map) return;

	var center = map.getCenter();
	var zoom = map.getZoom();
	var params = new URLSearchParams(window.location.search);

	params.set('lat', center.lat.toFixed(5));
	params.set('lon', center.lng.toFixed(5));
	params.set('zoom', zoom.toFixed(2));

	var query = params.toString();
	var newUrl = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
	window.history.replaceState(null, '', newUrl);
}

function setupMapViewUrlSync() {
	map.on('moveend', function() {
		window.clearTimeout(map._urlSyncTimer);
		map._urlSyncTimer = window.setTimeout(syncMapViewToUrl, 200);
	});
	syncMapViewToUrl();
}

var locationByPointId = {};

function isKeyLocation(feature) {
	return feature.properties.key === true;
}

function getLocationByPointId(pointID) {
	return locationByPointId[pointID] || null;
}

function getSchoolsGeojson() {
	return {
		type: 'FeatureCollection',
		features: locations.features.filter(isKeyLocation),
	};
}

var animationEndpointPointIds = null;

function setAnimationEndpointPointIds(fromFeature, toFeature) {
	animationEndpointPointIds = new Set();
	[fromFeature, toFeature].forEach(function(feature) {
		if (!feature) return;
		var pointID = feature.properties.pointID;
		if (pointID != null) animationEndpointPointIds.add(pointID);
	});
}

function clearAnimationEndpointPointIds() {
	animationEndpointPointIds = null;
}

function isLocationMarkerVisible(pointID) {
	if (pointID == null) return false;

	var location = getLocationByPointId(pointID);
	if (!location) return true;
	if (isKeyLocation(location)) return true;
	if (map && map.getZoom() > 6) return true;
	if (animationEndpointPointIds && animationEndpointPointIds.has(pointID)) return true;
	return false;
}

function getVisibleEventsGeojson() {
	if (!events) return empty;

	return {
		type: 'FeatureCollection',
		features: events.features.filter(function(feature) {
			return isLocationMarkerVisible(feature.properties.pointID);
		}),
	};
}

function locationsOverlapInPixels(featureA, featureB, radiusPx) {
	if (!map) return false;

	var coordsA = featureA.geometry && featureA.geometry.coordinates;
	var coordsB = featureB.geometry && featureB.geometry.coordinates;
	if (!coordsA || !coordsB) return false;

	var pointA = map.project(coordsA);
	var pointB = map.project(coordsB);
	var dx = pointA.x - pointB.x;
	var dy = pointA.y - pointB.y;

	return (dx * dx + dy * dy) <= radiusPx * radiusPx;
}

function nonKeyOverlapsKeyLocation(feature) {
	return locations.features.some(function(keyFeature) {
		if (!isKeyLocation(keyFeature)) return false;
		return locationsOverlapInPixels(feature, keyFeature, locationIconWidth * 0.75);
	});
}

function getVisibleNonKeyLocationsGeojson() {
	if (!locations) return empty;

	return {
		type: 'FeatureCollection',
		features: locations.features.filter(function(feature) {
			if (isKeyLocation(feature)) return false;
			if (!isLocationMarkerVisible(feature.properties.pointID)) return false;
			return !nonKeyOverlapsKeyLocation(feature);
		}),
	};
}

function updateLocationMarkersVisibility() {
	if (!map) return;
	if (map.getSource('events')) {
		map.getSource('events').setData(getVisibleEventsGeojson());
	}
	if (map.getSource('locations-non-key')) {
		map.getSource('locations-non-key').setData(getVisibleNonKeyLocationsGeojson());
	}
}

function setupLocationMarkersVisibility() {
	updateLocationMarkersVisibility();
	map.on('zoom', updateLocationMarkersVisibility);
}

function getLocationTypes() {
	var types = {};

	locations.features.forEach(function(feature) {
		var type = feature.properties.type;
		if (type) types[type] = true;
	});

	types[defaultLocationType] = true;
	return Object.keys(types);
}

function getLocationIconId(type) {
	return 'location-' + (type || defaultLocationType);
}

function getLocationIconImageExpression() {
	return [
		'concat',
		'location-',
		['coalesce', ['get', 'type'], defaultLocationType],
	];
}

function rasterizeLocationIcon(img) {
	var aspect = img.naturalWidth / img.naturalHeight || 1;
	var width = locationIconWidth;
	var height = Math.round(width / aspect);
	var canvas = document.createElement('canvas');

	canvas.width = width;
	canvas.height = height;
	var ctx = canvas.getContext('2d');
	ctx.drawImage(img, 0, 0, width, height);
	return ctx.getImageData(0, 0, width, height);
}

function loadLocationIconImages(callback) {
	var types = getLocationTypes();
	var pending = types.length;

	if (!pending) {
		callback();
		return;
	}

	types.forEach(function(type) {
		var iconId = getLocationIconId(type);
		var img = new Image();

		img.onload = function() {
			if (!map.hasImage(iconId)) {
				map.addImage(iconId, rasterizeLocationIcon(img), { pixelRatio: 1 });
			}
			pending -= 1;
			if (pending === 0) callback();
		};
		img.onerror = function() {
			console.error('Failed to load location icon for type:', type);
			pending -= 1;
			if (pending === 0) callback();
		};
		img.src = './assets/location-' + type + '.svg';
	});
}

var keyLocationLabelColor = '#286972';
var nonKeyLocationLabelColor = '#56524B';
var locationLabelFont = ['Open Sans Regular', 'Arial Unicode MS Regular'];

function getLocationIconLayout(overrides) {
	var layout = {
		'icon-image': getLocationIconImageExpression(),
		'icon-size': 1,
		'icon-anchor': 'bottom',
		'icon-allow-overlap': true,
		'icon-ignore-placement': true,
	};

	if (overrides) {
		Object.keys(overrides).forEach(function(key) {
			layout[key] = overrides[key];
		});
	}

	return layout;
}

function getKeyLocationLabelAnchorExpression() {
	return [
		'match',
		['get', 'name'],
		'洛阳', 'right',
		'少林', 'top',
		'嵩山', 'left',
		'top',
	];
}

function getKeyLocationLabelOffsetExpression() {
	return [
		'match',
		['get', 'name'],
		'洛阳', ['literal', [-0.55, 0]],
		'少林', ['literal', [0, 0.3]],
		'嵩山', ['literal', [0.55, 0]],
		['literal', [0, 0.3]],
	];
}

function getKeyLocationLayerLayout() {
	return getLocationIconLayout({
		'text-field': ['get', 'name'],
		'text-size': 20,
		'text-offset': getKeyLocationLabelOffsetExpression(),
		'text-anchor': getKeyLocationLabelAnchorExpression(),
		'text-font': locationLabelFont,
		'icon-allow-overlap': true,
		'icon-ignore-placement': true,
		'text-allow-overlap': true,
		'text-ignore-placement': true,
		'text-optional': false,
		'symbol-sort-key': 200,
	});
}

function getNonKeyLocationLayerLayout() {
	return {
		'icon-image': getLocationIconImageExpression(),
		'icon-size': 1,
		'icon-anchor': 'bottom',
		'icon-allow-overlap': false,
		'icon-ignore-placement': false,
		'text-field': ['get', 'name'],
		'text-size': 16,
		'text-offset': [0, 0.25],
		'text-anchor': 'top',
		'text-font': locationLabelFont,
		'text-allow-overlap': false,
		'text-ignore-placement': false,
		'text-optional': true,
		'symbol-sort-key': 100,
	};
}

function ensureLocationLayersOnTop() {
	if (!map.getLayer('schools') || !map.getLayer('locations-non-key')) return;

	var beforeId = map.getLayer('play-event-labels') ? 'play-event-labels' : undefined;
	map.moveLayer('locations-non-key', beforeId);
	map.moveLayer('schools', beforeId);
}

function syncEventsWithLocations() {
	locationByPointId = {};

	locations.features.forEach(function(feature) {
		if (feature.properties.pointID == null) return;
		locationByPointId[feature.properties.pointID] = feature;
	});

	events.features.forEach(function(event) {
		var location = locationByPointId[event.properties.pointID];
		if (!location) return;
		event.properties.name = location.properties.name;
		event.geometry.coordinates = location.geometry.coordinates.slice();
		if (location.properties.type) {
			event.properties.type = location.properties.type;
		}
	});
}

function initMap() {
	var initialView = getInitialMapView();
	var mapOptions = {
		container: 'map',
		style: basemapStyle.style,
		center: initialView.center,
		zoom: initialView.zoom
	};

	if (basemapStyle.language) mapOptions.language = basemapStyle.language;
	if (basemapStyle.worldview) mapOptions.worldview = basemapStyle.worldview;
	if (basemapStyle.maxZoom != null) mapOptions.maxZoom = basemapStyle.maxZoom;

	map = new mapboxgl.Map(mapOptions);

	map.on('load', function() {
	if (basemapStyle.language && map.setLanguage) {
		map.setLanguage(basemapStyle.language);
	}
	filterBasemapLabels();
	setupMapViewUrlSync();
	createTripArcs();
	buildEventArcs();

	loadLocationIconImages(addLayers);

	function addLayers() {

		var dds_color = {
					property: "vehicle",
					type: "categorical",
					stops: [
						["water", "#8bb"],
						["short", "#ba8"],
						["long", "#b88"],
						["walk", "#ab8"],
						["abrupt", "#666"]
					]
				};

		map.addSource("schools", {
			"type": "geojson",
			"data": getSchoolsGeojson()
		});
		map.addSource("trips-static", {
			"type": "geojson",
			"data": trips
		});
		map.addSource("trips-active", {
			"type": "geojson",
			"data": empty
		});
		map.addSource("event-arcs", {
			"type": "geojson",
			"data": eventArcs
		});
		map.addSource("events", {
			"type": "geojson",
			"data": empty
		});

		//trips-all
		map.addLayer({
			"id": "trips-all",
			"type": "line",
			"source": "trips-static",
			"paint": {
				"line-color": "#9CBFAF",
				"line-opacity": 0.6,
				"line-width": 2
			}
		});
		//trips-static (completed trip segments)
		map.addLayer({
			"id": "trips-static",
			"type": "line",
			"source": "trips-static",
			"paint": {
				"line-color": "#286972",
				"line-opacity": 0.6,
				"line-width": 4
			}
		});
		map.setFilter('trips-static', ['==', 'segIndex', -1]);
		//trips-active (completed portion of in-progress animation)
		map.addLayer({
			"id": "trips-active",
			"type": "line",
			"source": "trips-active",
			"layout": {
				"visibility": "none",
				"line-cap": "round",
				"line-join": "round"
			},
			"paint": {
				"line-color": "#286972",
				"line-opacity": 0.6,
				"line-width": 4
			}
		});
		// arcs between consecutive events
		map.addLayer({
			"id": "event-arcs",
			"type": "line",
			"source": "event-arcs",
			"layout": {
				"visibility": "none",
				"line-cap": "round",
				"line-join": "round"
			},
			"paint": {
				"line-color": "#d68",
				"line-opacity": 0.45,
				"line-width": 2
			}
		});
		map.addLayer({
			"id": "events",
			"type": "symbol",
			"source": "events",
			"layout": getLocationIconLayout(),
			"paint": {
				"icon-opacity": 0.85,
			}
		});
		map.addSource("locations-non-key", {
			"type": "geojson",
			"data": empty
		});
		map.addLayer({
			"id": "schools",
			"type": "symbol",
			"source": "schools",
			"layout": getKeyLocationLayerLayout(),
			"paint": {
				"text-color": keyLocationLabelColor,
			}
		});
		map.addLayer({
			"id": "locations-non-key",
			"type": "symbol",
			"source": "locations-non-key",
			"layout": getNonKeyLocationLayerLayout(),
			"paint": {
				"icon-opacity": 0.85,
				"text-color": nonKeyLocationLabelColor,
			}
		});
		map.addSource("play-event-labels", {
			"type": "geojson",
			"data": empty
		});
		map.addLayer({
			"id": "play-event-labels",
			"type": "symbol",
			"source": "play-event-labels",
			"layout": {
				"visibility": "none",
				"text-field": ["get", "name"],
				"text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
				"text-size": 14,
				"text-offset": [
					"case",
					["==", ["get", "role"], "next"],
					["literal", [0, 2.4]],
					["literal", [0, 1.2]]
				],
				"text-anchor": "top",
				"text-allow-overlap": true,
				"text-ignore-placement": true,
				"text-optional": false,
				"symbol-sort-key": [
					"case",
					["==", ["get", "role"], "next"],
					2,
					1
				]
			},
			"paint": {
				"text-color": [
					"case",
					["==", ["get", "role"], "next"],
					"#333",
					"#c45"
				],
				"text-halo-color": "#fff",
				"text-halo-width": 2.5
			}
		});

		ensureLocationLayersOnTop();
		setupLocationMarkersVisibility();
		setupEventTooltips();
		initializeActiveEvent();
	};

	$(".slide").hover(function() {
		if (this.id !== idActive) {
			idActive = this.id;
			// animateJourney(idActive);
		}
	});
	});
}

Promise.all([
	fetch('./events.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load events.geojson');
		return response.json();
	}),
	fetch('./locations.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load locations.geojson');
		return response.json();
	}),
	fetch('./trips.geojson').then(function(response) {
		if (!response.ok) throw new Error('Failed to load trips.geojson');
		return response.json();
	}),
	fetch('./basemap-style.json').then(function(response) {
		if (!response.ok) throw new Error('Failed to load basemap-style.json');
		return response.json();
	}),
]).then(function(results) {
	events = results[0];
	locations = results[1];
	trips_straight = results[2];
	basemapStyle = results[3];
	syncEventsWithLocations();
	initMap();
	setupEventsDataModal();
	setupEventPanel();
}).catch(function(error) {
	console.error(error);
});

function parseEventPeopleKeys(peopleProp) {
	var keys = peopleProp;
	if (typeof peopleProp === 'string') {
		try {
			keys = JSON.parse(peopleProp);
		} catch (error) {
			keys = [];
		}
	}
	return Array.isArray(keys) ? keys : [];
}

function formatEventPeople(peopleProp) {
	return parseEventPeopleKeys(peopleProp).map(function(key) {
		return (people[key] && people[key].name) || key;
	}).join('、');
}

function peopleAvatarSrc(key) {
	if (key === 'Narrator') return './assets/people_narrator.svg';
	return './assets/people_' + key + '.svg';
}

function buildEventPeopleAvatarsHtml(peopleProp) {
	var keys = parseEventPeopleKeys(peopleProp);
	if (!keys.length) return '';

	return (
		'<div class="event-item__people">' +
			keys.map(function(key) {
				var name = (people[key] && people[key].name) || key;
				return (
					'<img class="event-item__avatar" src="' + peopleAvatarSrc(key) + '" ' +
						'alt="' + name + '" title="' + name + '" width="32" height="32" />'
				);
			}).join('') +
		'</div>'
	);
}

function buildEventTooltipHtml(props) {
	var peopleLabel = formatEventPeople(props.people);
	return (
		'<div class="event-tooltip__inner">' +
			'<div class="event-tooltip__name">' + props.name + '</div>' +
			'<div class="event-tooltip__event">' + props.event + '</div>' +
			'<div class="event-tooltip__meta">第' + props.chapter + '回' +
				(peopleLabel ? ' · ' + peopleLabel : '') +
			'</div>' +
		'</div>'
	);
}

function buildEventListItemHtml(props) {
	return (
		'<div class="event-item__name">' + props.name + '</div>' +
		'<div class="event-item__event">' + props.event + '</div>' +
		buildEventPeopleAvatarsHtml(props.people)
	);
}

function groupEventsByChapter(sortedEvents) {
	var groups = [];
	var groupByChapter = {};

	sortedEvents.forEach(function(feature) {
		var chapter = String(feature.properties.chapter);
		if (!groupByChapter[chapter]) {
			groupByChapter[chapter] = [];
		}
		groupByChapter[chapter].push(feature);
	});

	Object.keys(groupByChapter).sort(function(a, b) {
		return (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0);
	}).forEach(function(chapter) {
		groups.push({
			chapter: chapter,
			features: groupByChapter[chapter],
		});
	});

	return groups;
}

function appendEventItem(listEl, feature) {
	var item = document.createElement('article');
	item.className = 'event-item';
	item.dataset.eventId = feature.id;
	item.innerHTML = buildEventListItemHtml(feature.properties);

	item.addEventListener('click', function() {
		panelScrollFlyLocked = true;
		item.scrollIntoView({ block: 'center', behavior: 'smooth' });
		flyToEvent(feature.id, { force: true });
		window.setTimeout(function() {
			panelScrollFlyLocked = false;
		}, 700);
	});

	listEl.appendChild(item);
	return item;
}

function eventSortKey(feature) {
	return eventChapterSegSortKey(feature);
}

var activePanelEventId = null;
var panelScrollFlyLocked = false;
var selectedEventMarker = null;
var selectedPathTipMarker = null;
var sortedPanelEvents = [];
var playAnimationInProgress = false;
var playAnimationId = null;

function getEventFeatureById(eventId) {
	return events.features.find(function(item) {
		return item.id === eventId;
	});
}

function getActivePanelEventIndex() {
	if (!activePanelEventId) return -1;
	return sortedPanelEvents.findIndex(function(feature) {
		return feature.id === activePanelEventId;
	});
}

function getEventPeopleKeys(feature) {
	return parseEventPeopleKeys(feature.properties.people);
}

function getDefaultTripPeopleKeysFromEvents(tripSegID) {
	var eventsList = getEventsForTripSync();
	var keys = [];
	var fromEvent = eventsList.find(function(feature) {
		return getEventSegIndex(feature) === tripSegID - 1;
	});
	var toEvent = eventsList.find(function(feature) {
		return getEventSegIndex(feature) === tripSegID;
	});

	[fromEvent, toEvent].forEach(function(feature) {
		if (!feature) return;
		getEventPeopleKeys(feature).forEach(function(key) {
			if (keys.indexOf(key) === -1) keys.push(key);
		});
	});

	return keys;
}

function syncTripsFromTable() {
	var tbody = document.getElementById('trips-table__body');
	if (!tbody || !tbody.childElementCount) return;
	trips_straight = collectTripsGeojsonFromTable();
}

function getTripFeatureBySegID(tripSegID) {
	if (tripSegID == null || isNaN(tripSegID)) return null;
	return trips_straight.features.find(function(feature) {
		return feature.properties.segID === tripSegID;
	}) || null;
}

function getTripPeopleKeys(tripSegID) {
	var trip = getTripFeatureBySegID(tripSegID);
	if (!trip) return [];
	return parseEventPeopleKeys(trip.properties.people);
}

function tripPeopleKeysEqual(tripSegIDA, tripSegIDB) {
	var keysA = getTripPeopleKeys(tripSegIDA);
	var keysB = getTripPeopleKeys(tripSegIDB);
	if (keysA.length !== keysB.length) return false;
	for (var i = 0; i < keysA.length; i++) {
		if (keysA[i] !== keysB[i]) return false;
	}
	return true;
}

function clearEventMarkers() {
	if (selectedEventMarker) {
		selectedEventMarker.remove();
		selectedEventMarker = null;
	}
}

function clearPathTipMarker() {
	if (selectedPathTipMarker) {
		selectedPathTipMarker.remove();
		selectedPathTipMarker = null;
	}
}

function clearPlayTravelMarkers() {
	clearEventMarkers();
	clearPathTipMarker();
}

function ensurePathTipMarker(coords) {
	if (!selectedPathTipMarker) {
		var el = document.createElement('div');
		el.className = 'event-path-tip';
		selectedPathTipMarker = new mapboxgl.Marker({
			element: el,
			anchor: 'center',
		});
	}

	selectedPathTipMarker
		.setLngLat(coords)
		.addTo(map);
}

function buildEventMarkerElement(keys) {
	var el = document.createElement('div');
	el.className = 'event-character-marker';

	keys.forEach(function(key) {
		var name = (people[key] && people[key].name) || key;
		var img = document.createElement('img');
		img.className = 'event-character-marker__avatar';
		img.src = peopleAvatarSrc(key);
		img.alt = name;
		img.title = name;
		el.appendChild(img);
	});

	return el;
}

function cancelPlayAnimation() {
	if (playAnimationId) {
		cancelAnimationFrame(playAnimationId);
		playAnimationId = null;
	}
	clearUpcomingTripPath();
	restoreTripsStaticForActiveEvent();
	clearAnimationEndpointPointIds();
	updateLocationMarkersVisibility();
	playAnimationInProgress = false;
}

function updatePlayButtonState() {
	var playBtn = document.getElementById('event-play-btn');
	if (!playBtn) return;
	var activeIndex = getActivePanelEventIndex();
	playBtn.disabled = playAnimationInProgress || activeIndex < 0 || activeIndex >= sortedPanelEvents.length - 1;
}

function updateCompletedTripsForEvent(feature) {
	if (!map.getLayer('trips-static')) return;

	var segIndex = feature.properties.segIndex;
	if (segIndex == null || isNaN(segIndex) || segIndex <= 0) {
		map.setFilter('trips-static', ['==', 'segIndex', -1]);
		return;
	}
	map.setFilter('trips-static', ['<=', 'segIndex', segIndex]);
}

function beginPlayTripAnimation(fromFeature) {
	if (map.getLayer('event-arcs')) {
		map.setLayoutProperty('event-arcs', 'visibility', 'none');
	}
	updateCompletedTripsForEvent(fromFeature);
	initActiveTripPath();
}

function endPlayTripAnimation(feature) {
	if (map.getLayer('trips-static')) {
		map.setLayoutProperty('trips-static', 'visibility', 'visible');
	}
	if (feature) {
		updateCompletedTripsForEvent(feature);
	}
}

function restoreTripsStaticForActiveEvent() {
	if (!map.getLayer('trips-static')) return;

	map.setLayoutProperty('trips-static', 'visibility', 'visible');
	var feature = activePanelEventId ? getEventFeatureById(activePanelEventId) : null;
	if (feature) {
		updateCompletedTripsForEvent(feature);
	} else {
		map.setFilter('trips-static', ['==', 'segIndex', -1]);
	}
}

function getTripsBetweenEvents(fromFeature, toFeature) {
	var fromSeg = fromFeature.properties.segIndex;
	var toSeg = toFeature.properties.segIndex;
	return trips.features.filter(function(trip) {
		var seg = trip.properties.segIndex;
		return seg > fromSeg && seg <= toSeg;
	}).sort(function(a, b) {
		return a.properties.segIndex - b.properties.segIndex;
	});
}

function initActiveTripPath() {
	map.setLayoutProperty('trips-active', 'visibility', 'visible');
	map.getSource('trips-active').setData(empty);
}

function slicePathCoordsToProgress(pathCoords, progress) {
	if (pathCoords.length < 2) return pathCoords.slice();
	if (progress >= 1) return pathCoords.slice();
	if (progress <= 0) {
		return [pathCoords[0].slice(), pathCoords[0].slice()];
	}

	var line = turf.lineString(pathCoords);
	var totalLength = turf.length(line, { units: 'kilometers' });
	if (totalLength === 0) {
		return [pathCoords[0].slice(), pathCoords[0].slice()];
	}

	var targetDist = progress * totalLength;
	var sliced = turf.lineSlice(
		turf.point(pathCoords[0]),
		turf.along(line, targetDist, { units: 'kilometers' }),
		line
	);

	return sliced.geometry.coordinates;
}

function updateActiveTripPathFromCoords(pathCoords) {
	if (!map.getSource('trips-active')) return;

	map.setLayoutProperty('trips-active', 'visibility', 'visible');
	map.getSource('trips-active').setData({
		type: 'FeatureCollection',
		features: [{
			type: 'Feature',
			geometry: {
				type: 'LineString',
				coordinates: pathCoords,
			},
			properties: {},
		}],
	});
}

function clearUpcomingTripPath() {
	map.getSource('trips-active').setData(empty);
	map.setLayoutProperty('trips-active', 'visibility', 'none');
	clearPathTipMarker();
}

function buildPlayEventLabelsGeoJSON(currentFeature, nextFeature) {
	return {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: currentFeature.geometry.coordinates,
				},
				properties: {
					name: currentFeature.properties.name,
					role: 'current',
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: nextFeature.geometry.coordinates,
				},
				properties: {
					name: nextFeature.properties.name,
					role: 'next',
				},
			},
		],
	};
}

function showPlayEventLabels(currentFeature, nextFeature) {
	if (!map.getSource('play-event-labels')) return;

	map.getSource('play-event-labels').setData(
		buildPlayEventLabelsGeoJSON(currentFeature, nextFeature)
	);
	map.setLayoutProperty('play-event-labels', 'visibility', 'visible');
}

function clearPlayEventLabels() {
	if (!map.getSource('play-event-labels')) return;

	map.getSource('play-event-labels').setData(empty);
	map.setLayoutProperty('play-event-labels', 'visibility', 'none');
}

function waitForUpcomingPathRender(callback) {
	if (!callback) return;

	var finished = false;
	function finish() {
		if (finished) return;
		finished = true;
		callback();
	}

	map.once('idle', function() {
		window.setTimeout(finish, 400);
	});
	window.setTimeout(finish, 1200);
}

function flyToEventPair(fromFeature, toFeature, callback) {
	var from = fromFeature.geometry.coordinates;
	var to = toFeature.geometry.coordinates;
	var moveDuration = 1200;
	var finished = false;

	function finish() {
		if (finished) return;
		finished = true;
		if (callback) callback();
	}

	map.once('moveend', finish);
	window.setTimeout(finish, moveDuration + 150);

	if (from[0] === to[0] && from[1] === to[1]) {
		map.flyTo({
			center: to,
			zoom: isMobile ? 5.5 : 6,
			duration: moveDuration,
			essential: true,
		});
		return;
	}

	var pair = turf.featureCollection([
		turf.point(from),
		turf.point(to),
	]);
	var bbox = turf.bbox(pair);

	map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], {
		padding: isMobile ? 30 : 60,
		duration: moveDuration,
		essential: true,
	});
}

function coordsNearlyEqual(a, b, epsilon) {
	if (!a || !b) return false;
	epsilon = epsilon || 1e-5;
	return Math.abs(a[0] - b[0]) < epsilon && Math.abs(a[1] - b[1]) < epsilon;
}

function appendPathCoord(coords, coord) {
	var last = coords[coords.length - 1];
	if (!last) {
		coords.push(coord.slice());
		return;
	}
	if (coordsNearlyEqual(last, coord)) {
		if (last[0] !== coord[0] || last[1] !== coord[1]) {
			coords[coords.length - 1] = coord.slice();
		}
		return;
	}
	coords.push(coord.slice());
}

function buildTripPathBetweenEvents(fromFeature, toFeature) {
	var segments = getTripsBetweenEvents(fromFeature, toFeature);
	var coords = [fromFeature.geometry.coordinates.slice()];

	segments.forEach(function(trip, i) {
		var tripCoords = trip.geometry.coordinates;
		var start = i === 0 ? 1 : 1;
		for (var j = start; j < tripCoords.length; j++) {
			appendPathCoord(coords, tripCoords[j]);
		}
	});

	appendPathCoord(coords, toFeature.geometry.coordinates);

	if (segments.length === 0 && coords.length < 2) {
		var from = fromFeature.geometry.coordinates;
		if (from[0] !== end[0] || from[1] !== end[1]) {
			return [from.slice(), end.slice()];
		}
	}

	return coords;
}

function getPathAnimationDuration(pathCoords) {
	if (pathCoords.length < 2) return 0;
	var line = turf.lineString(pathCoords);
	var km = turf.length(line, { units: 'kilometers' });
	return Math.min(Math.max(km * 600, 1500), 5000);
}

function ensureEventMarker(feature, coords) {
	var keys = getEventPeopleKeys(feature);
	if (!keys.length) {
		clearEventMarkers();
		return;
	}

	clearEventMarkers();
	selectedEventMarker = new mapboxgl.Marker({
		element: buildEventMarkerElement(keys),
		anchor: 'center',
	})
		.setLngLat(coords || feature.geometry.coordinates)
		.addTo(map);
}

function ensureTripMarker(tripSegID, coords) {
	var keys = getTripPeopleKeys(tripSegID);
	if (!keys.length) {
		clearEventMarkers();
		return;
	}

	clearEventMarkers();
	selectedEventMarker = new mapboxgl.Marker({
		element: buildEventMarkerElement(keys),
		anchor: 'center',
	})
		.setLngLat(coords)
		.addTo(map);
}

function setMarkerLngLat(coords) {
	if (selectedEventMarker) {
		selectedEventMarker.setLngLat(coords);
	}
}

function animateTripProgress(pathCoords, duration, hasAvatar, onComplete) {
	if (pathCoords.length === 0) {
		if (onComplete) onComplete();
		return;
	}

	var tipCoords = pathCoords[pathCoords.length - 1];

	if (pathCoords.length === 1 || duration === 0) {
		updateActiveTripPathFromCoords(pathCoords);
		if (hasAvatar) {
			setMarkerLngLat(tipCoords);
		} else {
			clearEventMarkers();
			ensurePathTipMarker(tipCoords);
		}
		if (onComplete) onComplete();
		return;
	}

	updateActiveTripPathFromCoords(slicePathCoordsToProgress(pathCoords, 0));
	if (hasAvatar) {
		clearPathTipMarker();
		setMarkerLngLat(pathCoords[0]);
	} else {
		clearEventMarkers();
		ensurePathTipMarker(pathCoords[0]);
	}

	var startTime = null;

	function frame(timestamp) {
		if (!startTime) startTime = timestamp;
		var progress = Math.min((timestamp - startTime) / duration, 1);
		var partialCoords;

		try {
			partialCoords = slicePathCoordsToProgress(pathCoords, progress);
		} catch (error) {
			console.error(error);
			playAnimationId = null;
			if (onComplete) onComplete();
			return;
		}

		var tip = partialCoords[partialCoords.length - 1];

		updateActiveTripPathFromCoords(partialCoords);

		if (hasAvatar) {
			setMarkerLngLat(tip);
		} else {
			ensurePathTipMarker(tip);
		}

		if (progress < 1) {
			playAnimationId = requestAnimationFrame(frame);
		} else {
			playAnimationId = null;
			if (onComplete) onComplete();
		}
	}

	playAnimationId = requestAnimationFrame(frame);
}

function finishPlayAdvance(currentFeature, nextFeature) {
	var nextItem = document.querySelector('.event-item[data-event-id="' + nextFeature.id + '"]');

	ensureEventMarker(nextFeature);

	activePanelEventId = nextFeature.id;
	document.querySelectorAll('.event-item').forEach(function(item) {
		item.classList.toggle('is-active', item.dataset.eventId === nextFeature.id);
	});

	endPlayTripAnimation(nextFeature);

	if (nextItem) {
		nextItem.scrollIntoView({ block: 'center', behavior: 'smooth' });
	}

	clearAnimationEndpointPointIds();
	updateLocationMarkersVisibility();
	playAnimationInProgress = false;
	panelScrollFlyLocked = false;
	clearPlayEventLabels();
	updatePlayButtonState();
}

function setActivePanelEvent(eventId) {
	if (!eventId) return;

	var feature = getEventFeatureById(eventId);
	if (!feature) return;

	activePanelEventId = eventId;

	document.querySelectorAll('.event-item').forEach(function(item) {
		item.classList.toggle('is-active', item.dataset.eventId === eventId);
	});

	updateSelectedEventMarker(feature);
	clearUpcomingTripPath();
	clearPlayEventLabels();
	if (!playAnimationInProgress) {
		restoreTripsStaticForActiveEvent();
	}
	updatePlayButtonState();
}

function playNextEvent() {
	if (playAnimationInProgress) return;

	syncTripsFromTable();

	var activeIndex = getActivePanelEventIndex();
	if (activeIndex < 0 || activeIndex >= sortedPanelEvents.length - 1) return;

	var currentFeature = sortedPanelEvents[activeIndex];
	var nextFeature = sortedPanelEvents[activeIndex + 1];
	var tripSegID = getEventSegIndex(nextFeature);

	setAnimationEndpointPointIds(currentFeature, nextFeature);
	updateLocationMarkersVisibility();

	playAnimationInProgress = true;
	panelScrollFlyLocked = true;
	updatePlayButtonState();

	var hasAvatar = getTripPeopleKeys(tripSegID).length > 0;
	if (hasAvatar) {
		ensureTripMarker(tripSegID, currentFeature.geometry.coordinates);
	} else {
		clearPlayTravelMarkers();
	}

	beginPlayTripAnimation(currentFeature);
	showPlayEventLabels(currentFeature, nextFeature);

	flyToEventPair(currentFeature, nextFeature, function() {
		waitForUpcomingPathRender(function() {
			var pathCoords = buildTripPathBetweenEvents(currentFeature, nextFeature);
			var duration = getPathAnimationDuration(pathCoords);

			if (pathCoords.length < 2) {
				clearUpcomingTripPath();
				restoreTripsStaticForActiveEvent();
				finishPlayAdvance(currentFeature, nextFeature);
				return;
			}

			animateTripProgress(pathCoords, duration, hasAvatar, function() {
				clearUpcomingTripPath();
				finishPlayAdvance(currentFeature, nextFeature);
			});
		});
	});
}

function resetEventPanel() {
	if (!sortedPanelEvents.length) return;

	cancelPlayAnimation();

	var listEl = document.getElementById('event-list');
	var firstFeature = sortedPanelEvents[0];
	var firstItem = document.querySelector('.event-item[data-event-id="' + firstFeature.id + '"]');

	panelScrollFlyLocked = true;
	if (listEl) listEl.scrollTop = 0;
	if (firstItem) {
		firstItem.scrollIntoView({ block: 'center', behavior: 'auto' });
	}

	setActivePanelEvent(firstFeature.id);
	clearUpcomingTripPath();
	clearPlayEventLabels();
	map.flyTo({
		center: firstFeature.geometry.coordinates,
		zoom: isMobile ? 5.5 : 6,
		duration: 1200,
		essential: true,
	});

	window.setTimeout(function() {
		panelScrollFlyLocked = false;
	}, 700);
}

function updateSelectedEventMarker(feature) {
	ensureEventMarker(feature);
}

function flyToEvent(eventId, options) {
	if (!eventId || (activePanelEventId === eventId && !(options && options.force))) return;

	var feature = getEventFeatureById(eventId);
	if (!feature) return;

	setActivePanelEvent(eventId);

	map.flyTo({
		center: feature.geometry.coordinates,
		zoom: isMobile ? 5.5 : 6,
		duration: 1200,
		essential: true,
	});
}

function getCenteredEventItem(listEl) {
	var items = listEl.querySelectorAll('.event-item');
	if (!items.length) return null;

	var centerY = listEl.scrollTop + listEl.clientHeight / 2;
	var closest = null;
	var closestDistance = Infinity;

	items.forEach(function(item) {
		var itemCenter = item.offsetTop + item.offsetHeight / 2;
		var distance = Math.abs(itemCenter - centerY);
		if (distance < closestDistance) {
			closestDistance = distance;
			closest = item;
		}
	});

	return closest;
}

function getEventCountByPointId() {
	var countByPointId = {};

	events.features.forEach(function(feature) {
		var pointID = feature.properties.pointID;
		if (pointID == null) return;
		countByPointId[pointID] = (countByPointId[pointID] || 0) + 1;
	});

	return countByPointId;
}

function getLocationRowsForTable() {
	var countByPointId = getEventCountByPointId();

	return locations.features.slice().sort(function(a, b) {
		var aPoint = a.properties.pointID;
		var bPoint = b.properties.pointID;
		if (aPoint == null && bPoint == null) {
			return String(a.properties.name).localeCompare(String(b.properties.name), 'zh');
		}
		if (aPoint == null) return 1;
		if (bPoint == null) return -1;
		return aPoint - bPoint;
	}).map(function(feature) {
		var pointID = feature.properties.pointID;
		return {
			id: feature.id,
			pointID: pointID,
			name: feature.properties.name || '',
			confidence: feature.properties.confidence || '',
			key: feature.properties.key === true,
			type: feature.properties.type || '',
			coordinates: feature.geometry && feature.geometry.coordinates
				? feature.geometry.coordinates
				: [],
			eventCount: pointID == null ? '' : (countByPointId[pointID] || 0),
		};
	});
}

function formatEventPeopleForTable(peopleProp) {
	var keys = parseEventPeopleKeys(peopleProp);
	return keys.join(', ');
}

function appendTableCell(row, text, options) {
	options = options || {};
	var td = document.createElement('td');
	td.textContent = text != null ? String(text) : '';
	if (options.className) td.className = options.className;
	if (options.editable) {
		td.contentEditable = 'true';
		td.classList.add('events-table__cell--editable');
	} else {
		td.classList.add('events-table__cell--readonly');
	}
	row.appendChild(td);
	return td;
}

function buildEventsTableRow(feature) {
	var props = feature.properties;
	var coords = feature.geometry && feature.geometry.coordinates ? feature.geometry.coordinates : [];
	var row = document.createElement('tr');
	row.dataset.eventId = feature.id || '';

	appendTableCell(row, props.chapter, { editable: true });
	appendTableCell(row, props.name, { editable: true });
	appendTableCell(row, props.event, { editable: true, className: 'events-table__event' });
	appendTableCell(row, formatEventPeopleForTable(props.people), { editable: true });
	appendTableCell(row, props.segID, { editable: true });
	appendTableCell(row, props.pointID != null ? props.pointID : '', { editable: true });
	appendTableCell(row, coords[0] != null ? coords[0] : '', { editable: true });
	appendTableCell(row, coords[1] != null ? coords[1] : '', { editable: true });
	appendTableCell(row, feature.id, { className: 'events-table__id' });

	return row;
}

function buildLocationsTableRow(location) {
	var row = document.createElement('tr');
	row.dataset.locationId = location.id || '';

	appendTableCell(row, location.pointID != null ? location.pointID : '', { editable: true });
	appendTableCell(row, location.name, { editable: true });
	appendTableCell(row, location.coordinates[0] != null ? location.coordinates[0] : '', { editable: true });
	appendTableCell(row, location.coordinates[1] != null ? location.coordinates[1] : '', { editable: true });
	appendTableCell(row, location.confidence, { editable: true });
	appendTableCell(row, location.key ? 'TRUE' : '', { editable: true });
	appendTableCell(row, location.type, { editable: true });
	appendTableCell(row, location.eventCount);

	return row;
}

function populateEventsTable() {
	var tbody = document.getElementById('events-table__body');
	if (!tbody) return;
	tbody.innerHTML = '';

	var sortedEvents = events.features.slice().sort(function(a, b) {
		return eventSortKey(a) - eventSortKey(b);
	});

	sortedEvents.forEach(function(feature) {
		tbody.appendChild(buildEventsTableRow(feature));
	});
}

function populateLocationsTable() {
	var tbody = document.getElementById('locations-table__body');
	if (!tbody) return;
	tbody.innerHTML = '';

	getLocationRowsForTable().forEach(function(location) {
		tbody.appendChild(buildLocationsTableRow(location));
	});
}

function parsePeopleCell(text) {
	if (!text) return [];
	if (text.charAt(0) === '[') {
		try {
			return parseEventPeopleKeys(JSON.parse(text));
		} catch (error) {
			return [];
		}
	}
	return text.split(',').map(function(item) {
		return item.trim();
	}).filter(Boolean);
}

function collectEventsGeojsonFromTable() {
	var rows = document.querySelectorAll('#events-table__body tr');
	var features = [];

	Array.prototype.forEach.call(rows, function(row) {
		var cells = row.cells;
		var pointID = parseInt(cells[5].textContent.trim(), 10);
		var feature = {
			type: 'Feature',
			id: cells[8].textContent.trim(),
			properties: {
				name: cells[1].textContent.trim(),
				event: cells[2].textContent.trim(),
				chapter: cells[0].textContent.trim(),
				segID: cells[4].textContent.trim(),
				people: parsePeopleCell(cells[3].textContent.trim()),
			},
			geometry: {
				type: 'Point',
				coordinates: [
					parseFloat(cells[6].textContent.trim()),
					parseFloat(cells[7].textContent.trim()),
				],
			},
		};

		if (!isNaN(pointID)) feature.properties.pointID = pointID;
		features.push(feature);
	});

	return {
		type: 'FeatureCollection',
		features: features,
	};
}

function parseKeyCell(text) {
	var value = String(text || '').trim().toLowerCase();
	return value === 'true' || value === '1' || value === 'yes';
}

function collectLocationsGeojsonFromTable() {
	var rows = document.querySelectorAll('#locations-table__body tr');
	var features = [];

	Array.prototype.forEach.call(rows, function(row) {
		var cells = row.cells;
		var pointIDText = cells[0].textContent.trim();
		var pointID = pointIDText === '' ? null : parseInt(pointIDText, 10);
		var properties = {
			name: cells[1].textContent.trim(),
			confidence: cells[4].textContent.trim(),
		};
		var type = cells[6].textContent.trim();

		if (!isNaN(pointID) && pointIDText !== '') properties.pointID = pointID;
		if (properties.confidence === '') delete properties.confidence;
		if (parseKeyCell(cells[5].textContent)) properties.key = true;
		if (type) properties.type = type;

		var feature = {
			type: 'Feature',
			properties: properties,
			geometry: {
				type: 'Point',
				coordinates: [
					parseFloat(cells[2].textContent.trim()),
					parseFloat(cells[3].textContent.trim()),
				],
			},
		};

		if (row.dataset.locationId) feature.id = row.dataset.locationId;
		features.push(feature);
	});

	return {
		type: 'FeatureCollection',
		features: features.sort(function(a, b) {
			var aPoint = a.properties.pointID;
			var bPoint = b.properties.pointID;
			if (aPoint == null && bPoint == null) {
				return String(a.properties.name).localeCompare(String(b.properties.name), 'zh');
			}
			if (aPoint == null) return 1;
			if (bPoint == null) return -1;
			return aPoint - bPoint;
		}),
	};
}

function copyGeojsonToClipboard(data, button) {
	var text = JSON.stringify(data, null, 2) + '\n';
	var label = button ? button.textContent : '';

	function showCopied() {
		if (!button) return;
		button.textContent = '已复制';
		window.setTimeout(function() {
			button.textContent = label;
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

function exportEventsGeojson() {
	var button = document.getElementById('events-export-btn');
	copyGeojsonToClipboard(collectEventsGeojsonFromTable(), button);
}

function exportLocationsGeojson() {
	var button = document.getElementById('locations-export-btn');
	copyGeojsonToClipboard(collectLocationsGeojsonFromTable(), button);
}

function getEventSegIndex(feature) {
	if (!feature) return null;
	var idx = feature.properties.segIndex;
	if (idx == null && feature.properties.segID) {
		idx = parseInt(String(feature.properties.segID).replace('seg', ''), 10);
	}
	return isNaN(idx) ? null : idx;
}

function getEventsForTripSync() {
	var tbody = document.getElementById('events-table__body');
	if (tbody && tbody.childElementCount > 0) {
		return collectEventsGeojsonFromTable().features;
	}
	return events.features;
}

function getLocationsForTripSync() {
	var tbody = document.getElementById('locations-table__body');
	if (tbody && tbody.childElementCount > 0) {
		return collectLocationsGeojsonFromTable().features;
	}
	return locations.features;
}

function getLocationNameForEvent(feature, locationsList) {
	if (!feature) return '';
	var pointID = feature.properties.pointID;
	if (pointID != null) {
		var location = locationsList.find(function(item) {
			return item.properties.pointID === pointID;
		});
		if (location) return location.properties.name;
	}
	return feature.properties.name || '';
}

function getTripSegmentContext(tripSegID) {
	var eventsList = getEventsForTripSync();
	var locationsList = getLocationsForTripSync();
	var fromEvent = eventsList.find(function(feature) {
		return getEventSegIndex(feature) === tripSegID - 1;
	});
	var toEvent = eventsList.find(function(feature) {
		return getEventSegIndex(feature) === tripSegID;
	});

	return {
		fromName: getLocationNameForEvent(fromEvent, locationsList),
		toName: getLocationNameForEvent(toEvent, locationsList),
		chapter: toEvent ? toEvent.properties.chapter : (fromEvent ? fromEvent.properties.chapter : ''),
	};
}

function getTripPeopleKeysForDisplay(tripFeature) {
	var keys = parseEventPeopleKeys(tripFeature.properties.people);
	if (keys.length) return keys;
	return getDefaultTripPeopleKeysFromEvents(tripFeature.properties.segID);
}

function getTripPointCount(feature) {
	var coords = feature.geometry && feature.geometry.coordinates;
	if (!coords || !coords.length || !coords[0]) return 0;
	return coords[0].length;
}

function formatTripCoordinatesForTable(feature) {
	return JSON.stringify(feature.geometry.coordinates);
}

function buildTripsTableRow(feature) {
	var props = feature.properties;
	var context = getTripSegmentContext(props.segID);
	var row = document.createElement('tr');

	appendTableCell(row, props.segID != null ? props.segID : '', { editable: true });
	appendTableCell(row, context.fromName);
	appendTableCell(row, context.toName);
	appendTableCell(row, context.chapter);
	appendTableCell(row, formatEventPeopleForTable(getTripPeopleKeysForDisplay(feature)), { editable: true });
	appendTableCell(row, props.vehicle || '', { editable: true });
	appendTableCell(row, getTripPointCount(feature));
	appendTableCell(row, formatTripCoordinatesForTable(feature), {
		editable: true,
		className: 'events-table__coordinates',
	});

	return row;
}

function populateTripsTable() {
	var tbody = document.getElementById('trips-table__body');
	if (!tbody) return;
	tbody.innerHTML = '';

	trips_straight.features.slice().sort(function(a, b) {
		return (a.properties.segID || 0) - (b.properties.segID || 0);
	}).forEach(function(feature) {
		tbody.appendChild(buildTripsTableRow(feature));
	});
}

function parseTripCoordinatesCell(text) {
	var parsed = JSON.parse(text);
	if (!Array.isArray(parsed)) throw new Error('coordinates must be an array');
	return parsed;
}

function collectTripsGeojsonFromTable() {
	var rows = document.querySelectorAll('#trips-table__body tr');
	var features = [];

	Array.prototype.forEach.call(rows, function(row) {
		var cells = row.cells;
		var segID = parseInt(cells[0].textContent.trim(), 10);
		var feature = {
			type: 'Feature',
			geometry: {
				type: 'MultiLineString',
				coordinates: parseTripCoordinatesCell(cells[7].textContent.trim()),
			},
			properties: {
				vehicle: cells[5].textContent.trim(),
				people: parsePeopleCell(cells[4].textContent.trim()),
			},
		};

		if (!isNaN(segID)) feature.properties.segID = segID;
		if (!feature.properties.people.length) delete feature.properties.people;
		features.push(feature);
	});

	return {
		type: 'FeatureCollection',
		features: features.sort(function(a, b) {
			return (a.properties.segID || 0) - (b.properties.segID || 0);
		}),
	};
}

function exportTripsGeojson() {
	var button = document.getElementById('trips-export-btn');
	try {
		copyGeojsonToClipboard(collectTripsGeojsonFromTable(), button);
	} catch (error) {
		console.error(error);
		if (button) button.textContent = 'coordinates 无效';
		window.setTimeout(function() {
			button.textContent = '复制 trips.geojson';
		}, 1500);
	}
}

function setEventsModalTab(tabName) {
	var tabs = [
		{ name: 'events', tabId: 'events-modal__tab-events', panelId: 'events-modal__panel-events' },
		{ name: 'locations', tabId: 'events-modal__tab-locations', panelId: 'events-modal__panel-locations' },
		{ name: 'trips', tabId: 'events-modal__tab-trips', panelId: 'events-modal__panel-trips' },
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

function openEventsModal() {
	var modal = document.getElementById('events-modal');
	if (!modal) return;

	try {
		populateEventsTable();
		populateLocationsTable();
		populateTripsTable();
	} catch (error) {
		console.error(error);
		return;
	}

	setEventsModalTab('events');
	modal.classList.add('is-open');
	modal.setAttribute('aria-hidden', 'false');
}

function closeEventsModal() {
	var modal = document.getElementById('events-modal');
	if (!modal) return;
	modal.classList.remove('is-open');
	modal.setAttribute('aria-hidden', 'true');
}

function shouldIgnorePlayShortcut(event) {
	var modal = document.getElementById('events-modal');
	if (modal && modal.classList.contains('is-open')) return true;

	var target = event.target;
	if (!target) return false;

	var tag = target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return true;
	if (target.isContentEditable) return true;

	return false;
}

function setupPlayKeyboardShortcut() {
	document.addEventListener('keydown', function(event) {
		if (event.code !== 'Space' && event.key !== ' ') return;
		if (shouldIgnorePlayShortcut(event)) return;

		var playBtn = document.getElementById('event-play-btn');
		if (!playBtn || playBtn.disabled) return;

		event.preventDefault();
		playNextEvent();
	});
}

var eventsDataModalReady = false;

function setupEventsDataModal() {
	if (eventsDataModalReady) return;

	var menuBtn = document.getElementById('event-menu-btn');
	var closeBtn = document.getElementById('events-modal__close');
	var eventsTab = document.getElementById('events-modal__tab-events');
	var locationsTab = document.getElementById('events-modal__tab-locations');
	var tripsTab = document.getElementById('events-modal__tab-trips');
	var eventsExportBtn = document.getElementById('events-export-btn');
	var locationsExportBtn = document.getElementById('locations-export-btn');
	var tripsExportBtn = document.getElementById('trips-export-btn');
	var modal = document.getElementById('events-modal');
	if (!menuBtn || !modal) return;

	eventsDataModalReady = true;
	menuBtn.addEventListener('click', openEventsModal);
	if (closeBtn) closeBtn.addEventListener('click', closeEventsModal);
	if (eventsTab) eventsTab.addEventListener('click', function() { setEventsModalTab('events'); });
	if (locationsTab) locationsTab.addEventListener('click', function() { setEventsModalTab('locations'); });
	if (tripsTab) tripsTab.addEventListener('click', function() {
		syncTripsFromTable();
		populateTripsTable();
		setEventsModalTab('trips');
	});
	if (eventsExportBtn) eventsExportBtn.addEventListener('click', exportEventsGeojson);
	if (locationsExportBtn) locationsExportBtn.addEventListener('click', exportLocationsGeojson);
	if (tripsExportBtn) tripsExportBtn.addEventListener('click', exportTripsGeojson);

	document.addEventListener('keydown', function(e) {
		if (e.key === 'Escape' && modal.classList.contains('is-open')) {
			closeEventsModal();
		}
	});
}

function setupEventPanel() {
	var listEl = document.getElementById('event-list');
	if (!listEl) return;

	var sortedEvents = events.features.slice().sort(function(a, b) {
		return eventSortKey(a) - eventSortKey(b);
	});
	sortedPanelEvents = sortedEvents;

	var chapterGroups = groupEventsByChapter(sortedEvents);

	chapterGroups.forEach(function(group) {
		var section = document.createElement('section');
		section.className = 'event-chapter';
		section.dataset.chapter = group.chapter;

		var header = document.createElement('h3');
		header.className = 'event-chapter__header';
		header.textContent = '第' + group.chapter + '回';
		section.appendChild(header);

		group.features.forEach(function(feature) {
			appendEventItem(section, feature);
		});

		listEl.appendChild(section);
	});

	var syncMapToScroll = function() {
		if (panelScrollFlyLocked) return;
		var centeredItem = getCenteredEventItem(listEl);
		if (centeredItem) flyToEvent(centeredItem.dataset.eventId);
	};

	listEl.addEventListener('scroll', function() {
		window.clearTimeout(listEl._scrollSyncTimer);
		listEl._scrollSyncTimer = window.setTimeout(syncMapToScroll, 120);
	}, { passive: true });

	var playBtn = document.getElementById('event-play-btn');
	var resetBtn = document.getElementById('event-reset-btn');
	if (playBtn) playBtn.addEventListener('click', playNextEvent);
	if (resetBtn) resetBtn.addEventListener('click', resetEventPanel);
	setupPlayKeyboardShortcut();
}

function initializeActiveEvent() {
	if (!sortedPanelEvents.length) return;

	var firstEvent = sortedPanelEvents[0];
	if (!firstEvent) return;

	if (hasUrlMapView()) {
		setActivePanelEvent(firstEvent.id);
		return;
	}

	flyToEvent(firstEvent.id, { force: true });
}

function setupEventTooltips() {
	var popup = new mapboxgl.Popup({
		closeButton: false,
		closeOnClick: false,
		maxWidth: isMobile ? '220px' : '280px',
		offset: 12,
		className: 'event-tooltip',
	});

	map.on('mouseenter', 'events', function() {
		map.getCanvas().style.cursor = 'pointer';
	});

	map.on('mousemove', 'events', function(e) {
		if (!e.features || e.features.length === 0) return;
		var props = e.features[0].properties;
		popup
			.setLngLat(e.lngLat)
			.setHTML(buildEventTooltipHtml(props))
			.addTo(map);
	});

	map.on('mouseleave', 'events', function() {
		map.getCanvas().style.cursor = '';
		popup.remove();
	});
}

function animateJourney(idActive) {

	// cancel the current animation if any
	cancelAnimationFrame(animationID);
	tripActive = {
		"type": "FeatureCollection",
		"features": []
	};

    var tripIndex;
    // get the index of the given segID in trips; and prepare tripActive properties
    trips.features.forEach(function(trip, i) {
        if (trip.properties.segID === idActive) {
            tripIndex = i;
	        tripActive.features.push( JSON.parse(JSON.stringify(trip)) );
	        tripActive.features[0].geometry.coordinates = [];
	    };
    });

	// update the background static layers
	updateStatic();
	function updateStatic() {
		var segIndex = trips.features[tripIndex].properties.segIndex;
		map.setFilter('trips-static', ['<=', 'segIndex', segIndex]);
		clearUpcomingTripPath();
	};

    flytoTrip();
    function flytoTrip(){
	    // fly to this trip
	    var radius = Math.min(turf.length(trips.features[tripIndex], { units: 'kilometers' }) * 0.2, 20);
	    var bbox = turf.bbox(turf.buffer(trips.features[tripIndex], radius, { units: 'kilometers' }));
	    map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 40, duration: 1200 });
	};

	var counter = 0;
    map.on('zoomend', function(){

		// recursively animate each round of animation
		animate();

		function animate() {
			// if the last segment, end animation
			if (counter === segmentNumber+1 ) {
				cancelAnimationFrame(animationID);
				// console.log("end");
			} else {
				tripActive.features[0].geometry.coordinates.push(trips.features[tripIndex].geometry.coordinates[counter]);
				// Update the source with this new data.
				map.getSource('trips-active').setData(tripActive);

				animationID = requestAnimationFrame(animate);
				counter++;
				// console.log(counter);
			};
		};
	});
};
