var style331 = 'mapbox://styles/yunjieli/ciu7h63gy00052inrtutrxnfp';
var styleDark = 'mapbox://styles/mapbox/dark-v9';

mapboxgl.accessToken = 'pk.eyJ1IjoieXVuamllbGkiLCJhIjoiY2lxdmV5MG5rMDAxNmZta3FlNGhyMmpicSJ9.CTEQgAyZGROcpJouZuzJyA';
var map = new mapboxgl.Map({
    container: 'map',
    style: style331,
    center: [-73.9326112917397, 40.75449452681676],
    zoom: 10.7,
    pitch: 60
});

map.fitBounds([[-74.09692544272578, 40.609614478818855],[-73.77487016324935, 40.846999364699144]]);

// disable scroll if it's embedded in a blog post
if (window.location.search.indexOf('embed') !== -1 ) {
    map.scrollZoom.disable();
};


// global constants, other candidates include , #9ee0f5
var colorStops = ["#151515", "#222", "#ffc300", "#ff8d19", "#ff5733", "#ff2e00"];
var heightStop = 5000;
var colorActive = "#3cc";
var typeList = ["total", "noise", "establishment", "poisoning", "drinking", "smoking", "others"];
// for DDS threshholds, [total, density]
var max = {
    "businesses": 46,
    "total": 283,
    "noise": 278,
    "establishment": 60,
    "poisoning": 15,
    "drinking": 8,
    "smoking": 10,
    "others": 9,
    "totalDensity": 141.5,
    "noiseDensity": 139,
    "establishmentDensity": 20,
    "poisoningDensity": 8,
    "drinkingDensity": 5,
    "smokingDensity": 10,
    "othersDensity": 1.3,
};

var empty = {
    "type": "FeatureCollection",
    "features": []
};

var gridActive = {
    "type": "FeatureCollection",
    "features": []
};
var pointActive = {
    "type": "FeatureCollection",
    "features": []
};
var previousCamera = {};

// active filter for each of the filter session
var activeCamera = "hexbin";
var activeType = "total";
// result data field of camera, type, method combined
var activeDDS = "totalDensity";
var maxColor = max[activeDDS];
var maxHeight = max["totalDensity"];

// preprocessing data
gridsRaw.features.forEach(function(grid) {
    // calclulate density
    typeList.forEach( function(type) {
        //in case businesses == 0
        var density;
        if ( grid.properties.businesses>0 ) {
            density = grid.properties[type]/grid.properties.businesses;
            // keep 1 decimal
            density = Math.round(density*10) / 10;
        } else {
            density = "";
        };
        grid.properties[type+"Density"] = density;
    });

});

var grids = gridsRaw;

map.on('load', function() {

    map.addControl(new mapboxgl.NavigationControl({position: 'top-right'}));
    // addCustomControl();

    addLayers();

    // custom control in navigation control
    $("#control-pitch").click(function() {
        $(this).toggleClass('pitch');

        var pitch = $(this).hasClass('pitch')? 60 : 0;
        map.setPitch(pitch);
    });

    map.on("zoom", function() {
        if (activeCamera !== "inspector") {
            var zoom = map.getZoom();
            activeCamera = zoom>14 ? "dotted" : "hexbin";
            setLayers();
        };
    });

    // reset height/color if toggle normalization
    $("#density").click(function() {
        activeDDS = $(this).is(":checked")? activeType+'Density' : activeType;
        setDDS();
    });

    // filter type
    $("#types .btn").click(function() {
        $("#types .btn").removeClass('active');

        if (this.id === activeType) {
            // click again to clear filter
            activeType = "total";
        } else {
            activeType = this.id;
            $(this).addClass('active');
        };

        // for hexbin
        activeDDS = $("#density").is(":checked")? activeType+"Density" : activeType;
        setDDS();

        // for dotted
        var filter = activeType === "total" ? ["has", "Complaint Type"] : ["in", "Complaint Type"].concat(types[activeType]["values"]);
        map.setFilter("points-complaints", filter);
    });

    // Create a popup, but don't add it to the map yet.
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'top',
    });
    // tooltip
    map.on("mousemove", function(e) {
        var coordinates = [e.lngLat.lng, e.lngLat.lat];
        var html = "";
        map.on("zoom", function() {
            return;
        });
        if (activeCamera==="hexbin") {
            var query = map.queryRenderedFeatures( e.point, {layers: ["grids-3d"]} );
            if (query.length) {
                html = query[0].properties.total + " complaints here with " + query[0].properties.businesses + " restaurants/cafes/bars. ";
                html = activeType==="total"? html : html + query[0].properties[activeType] + " of them are about " + activeType + ". ";
                html += "Click to see the incidents.";

                gridActive.features = [query[0]];
                map.getSource('grid-active').setData(gridActive);
            } else {
                map.getSource('grid-active').setData(gridActive);
            }; 
        // else: "dotted" or "inspector"
        } else {
            var queryComplaints = map.queryRenderedFeatures( e.point, {layers: ["points-complaints"]} );
            if (queryComplaints.length) {
                html += "<h2>" + queryComplaints.length + " complaint(s):</h2>";

                // show top 5 and hide the others
                var max = 3;
                var length = queryComplaints.length<= max ? queryComplaints.length : max;
                var i;
                for (i=0; i<length; i++) {
                    var complaint = "<p>" + queryComplaints[0].properties["Complaint Type"] + " : " 
                        + queryComplaints[0].properties["Descriptor"] + "</p>";
                    html += complaint;
                };
                if (queryComplaints.length > max) {
                    html += "<p>...</p>";
                }

                pointActive.features = queryComplaints;
                map.getSource('point-active').setData(pointActive);
            } else {
                map.getSource('point-active').setData(empty);
            };     
        };

        if (html==="") {
            popup.remove();
            $(".mapboxgl-canvas-container").css("cursor","-webkit-grab");
        } else {
            $(".mapboxgl-canvas-container").css("cursor","none");
            popup.setLngLat(coordinates)
                .setHTML(html)
                .addTo(map);            
        };
    });

    // drill down a hexbin
    map.on('click', function(e) {
        if (activeCamera==="hexbin") {
            var query = map.queryRenderedFeatures( e.point, {layers: ["grids-3d"]} );
            // it's the same hexbin as the current highlight
            if (query.length && query[0].properties.id === gridActive.features[0].properties.id) {
                // UI changes
                $("#back").show();

                // prepare layers
                activeCamera = "inspector";
                setLayers();

                // Camera
                getCamera();
                var center = turf.center(gridActive);
                map.flyTo({center: center.geometry.coordinates, zoom: 15, pitch: 0});                  
            }; 
        };
    });
    // resume to overview
    $("#back").click(function() {
        
        activeCamera = "hexbin"; 
        // exception: only for inspector > hexbin case
        map.setPaintProperty('grid-active', 'fill-extrusion-height', {
            property: activeDDS,
            stops: [
                [0, 0],
                [maxHeight, heightStop]
            ]
        });       
        setLayers();

        map.flyTo(previousCamera);
        
        $(this).hide();
    });

    // mobile menu toggle
    $(".show-more").click(function() {
        $(".session").toggle();
        $("#title").show();
        $(".session.style").hide();
        $("#style-"+activeCamera).show();

        // toggle show-less and show-more
        $(".mobile-btn").toggle();

        $("#sidebar").css('height', '50vh');
        $("#map").css('height', 'calc(100% - 50vh');
        $("#map").css('top', '50vh');
    });
    $(".show-less").click(function() {
        $(".session").toggle();
        $("#title").show();
        $(".session.style").hide();

        // toggle show-less and show-more
        $(".mobile-btn").toggle();
        $("#sidebar").css('height', '30vh');
        $("#map").css('height', 'calc(100% - 30vh');
        $("#map").css('top', '30vh');
    });    

    function addLayers() {

        map.addSource("grids", {
            "type": "geojson",
            "data": grids
        });
        // grid-3d
        map.addLayer({
            "id": "grids-3d",
            "type": "fill-extrusion",
            "source": "grids",
            "paint": {
                "fill-extrusion-color": {
                    property: activeDDS,
                    stops: [
                        [0, colorStops[1]],
                        [maxColor*.2, colorStops[2]],
                        [maxColor*.5, colorStops[3]],
                        [maxColor*.8, colorStops[4]],
                        [maxColor, colorStops[5]]
                    ]
                },
                // "fill-extrusion-opacity": .6,
                "fill-extrusion-height": {
                    property: activeDDS,
                    stops: [
                        [0, 0],
                        [maxHeight, heightStop]
                    ]
                },
                "fill-extrusion-opacity": .9,
                "fill-extrusion-height-transition": { duration: 1000 },
                "fill-extrusion-color-transition": { duration:1000 }
            }
        }, "admin-2-boundaries-dispute");


        map.addSource("grid-active", {
            "type": "geojson",
            "data": gridActive
        });
        // add highlight
        map.addLayer({
            "id": "grid-active",
            "type": "fill-extrusion",
            "source": "grid-active",
            "paint": {
                "fill-extrusion-color": colorActive,
                "fill-extrusion-opacity": .6,
                "fill-extrusion-height": {
                    property: activeDDS,
                    stops: [
                        [0, 0],
                        [maxHeight, heightStop]
                    ]
                },
                "fill-extrusion-height-transition": { duration: 1500 },
                "fill-extrusion-color-transition": { duration:1500 }
            }
        }, "admin-2-boundaries-dispute");

       // addd complaints from tileset
        map.addSource("points-complaints", {
            "type": "vector",
            "url": "mapbox://yunjieli.7l1fqjio"
        });
        map.addLayer({
            "id": "points-complaints",
            "type": "circle",
            "source": "points-complaints",
            "source-layer": "data_complaints-1emuz6",
            "paint": {
                "circle-radius": {
                    stops: [
                        [12, 1],
                        [15, 5]
                    ]
                },
                "circle-color": colorStops[2],
                "circle-opacity": 0
            }
        }, "admin-2-boundaries-dispute");

        // add businesses from tileset
        map.addSource("points-businesses", {
            "type": "vector",
            "url": "mapbox://yunjieli.3i12h479"
        });
        map.addLayer({
            "id": "points-businesses",
            "type": "circle",
            "source": "points-businesses",
            "source-layer": "data_businesses-0lvzk6",
            "paint": {
                "circle-radius": {
                    stops: [
                        [12, 3],
                        [15, 8]
                    ]
                },
                "circle-color": colorStops[5],
                "circle-opacity": 0
            },
        }, "admin-2-boundaries-dispute");

        // subtle labels to show count by grid for 2D
        map.addLayer({
            "id": "grids-count",
            "type": "symbol",
            "source": "grids",
            "layout": {
                "text-field": "{"+ activeDDS + "}",
                "text-size": 14
            },
            "paint": {
                "text-color": colorStops[2],
                "text-opacity": 0
            }
        })

        map.addSource("point-active", {
            "type": "geojson",
            "data": pointActive
        });
        map.addLayer({
            "id": "point-active",
            "type": "circle",
            "source": "point-active",
            // "layout": {
            //     "icon-image": "highlight",
            //     "icon-rotation-alignment": "map"
            // },
            "paint": {
                "circle-radius": 15,
                "circle-color": colorStops[2],
                "circle-opacity": .3,
                "circle-blur": 1
            }
        }, "points-businesses");
    };

    function setLayers() {
        popup.remove();
        if (activeCamera === "hexbin") {
            map.setPaintProperty('points-complaints', 'circle-opacity', 0);
            map.setPaintProperty('points-businesses', 'circle-opacity', 0);
            map.setPaintProperty('grids-3d', 'fill-extrusion-opacity', 0.6);
            map.setPaintProperty('grid-active', 'fill-extrusion-opacity', 0.6);
            map.setPaintProperty('grids-count', 'text-opacity', 0);
            map.getSource('point-active').setData(empty);
        } else if (activeCamera === "dotted") {
            map.setPaintProperty('points-complaints', 'circle-opacity', 0.3);
            map.setPaintProperty('points-businesses', 'circle-opacity', .2);
            map.setPaintProperty('grids-3d', 'fill-extrusion-opacity', 0);
            map.setPaintProperty('grid-active', 'fill-extrusion-opacity', 0);
            map.setPaintProperty('grids-count', 'text-opacity', 0.8);
            // map.getSource('grid-active').setData(empty);
        } else if (activeCamera === "inspector") {
            map.setPaintProperty('points-complaints', 'circle-opacity', 0.3);
            map.setPaintProperty('points-businesses', 'circle-opacity', .2);
            map.setPaintProperty('grids-3d', 'fill-extrusion-opacity', 0);
            map.setPaintProperty('grid-active', 'fill-extrusion-opacity', 0.2);
            map.setPaintProperty('grid-active', 'fill-extrusion-height', 0);
            map.setPaintProperty('grids-count', 'text-opacity', 0.8);
        };

        // set legend
        // if it's dotted, it's the same as dotted
        var camera = activeCamera==="inspector" ? "dotted" : activeCamera;
        $(".session.style").hide();
        $("#style-"+camera).show();
    };

    function setDDS () { 

        maxColor = max[activeDDS];
        maxHeight = $("#density").is(":checked")? max["totalDensity"] : max["total"];

        map.setPaintProperty('grids-3d', 'fill-extrusion-color', {
                property: activeDDS,
                stops: [
                    [0, colorStops[1]],
                    [maxColor*.2, colorStops[2]],
                    [maxColor*.5, colorStops[3]],
                    [maxColor*.8, colorStops[4]],
                    [maxColor, colorStops[5]]
                ]
            });
        map.setPaintProperty('grids-3d', 'fill-extrusion-height', {
                property: activeDDS,
                stops: [
                    [0, 0],
                    [maxHeight, heightStop]
                ]
            });
        map.setLayoutProperty('grids-count', 'text-field', '{'+activeDDS+'}');

        // if inside inspector, don't change height
        if (activeCamera==="hexbin") {
            map.setPaintProperty('grid-active', 'fill-extrusion-height', {
                property: activeDDS,
                stops: [
                    [0, 0],
                    [maxHeight, heightStop]
                ]
            });        
        };

        // update max number in legend
        $(".label.max").html(maxColor);
    };

    function getCamera () {
        // if pitch==0, don't update Camera
        if (map.getPitch()) {
            previousCamera.center = map.getCenter();
            previousCamera.zoom = map.getZoom();
            previousCamera.pitch = map.getPitch();
            previousCamera.bearing = map.getBearing();
        };
    };
});
