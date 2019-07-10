mapboxgl.accessToken = 'pk.eyJ1IjoieXVuamllbGkiLCJhIjoiY2lxdmV5MG5rMDAxNmZta3FlNGhyMmpicSJ9.CTEQgAyZGROcpJouZuzJyA';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yunjieli/cituj60bv002l2inxxd8ru3l0',
    zoom: 10.3,
    center: [-122.4119423627503, 37.76523655844528]
});

// for each layout/paint property, [0] as ungreenified/before and [1] as greenified/after
var steps = {
    "L1": {
        "text": "non-park land uses",
        "paint": [
            [
                ["hospital"], "fill-color", ["#ded9d3", "#fab7ce"]
            ],
            [
                ["school"], "fill-color", ["#ded9d3", "#e6ed64"]
            ],
            [
                ["industrial"], "fill-color", ["#cbc8c8", "#adebe0"]
            ],
            [
                ["cemetery"], "fill-color", ["#dbdbdb", "#ccf5d4"]
            ]
        ],
        "layout": []
    },
    "L2": {
        "text": "Parks brown to green, cracking healing",
        "paint": [
            [
                ["park", "national_park"], "fill-color", ["#dbd4cd", "#9cd87d"]
            ],
            [
                ["pitch"], "fill-color", ["#CFC1B0","#7FC959"]
            ],
            [
                ["park-pattern", "national_park-pattern"], "fill-pattern", ["desert_dots", "desert_hash"]
            ],
            [
                ["background-pattern"], "background-pattern", ["desert_crack", "desert_crack-xs"]
            ],
            [
                ["water"], "fill-color", ["#a49b8e", "#AFAEA9"]
            ]
        ],
        "layout": []
    },
    "L3": {
        "text": "all roads to purple, water less gray, cracking healed",
        "paint": [
            [
                ["road-motorway", "road-trunk", "road-motorway_link", "road-trunk_link", "tunnel-motorway", "tunnel-trunk", "tunnel-motorway_link", "tunnel-trunk_link"],
                "line-color", ["#a6a5a7", "#d794e0"]
            ],
            [
                ["bridge-motorway", "bridge-trunk", "bridge-motorway_link", "bridge-trunk_link", "bridge-motorway-2", "bridge-trunk-2", "bridge-motorway_link-2", "bridge-trunk_link-2"],
                "line-color", ["#9a989a", "#f29cf2"]
            ],
            [
                ["background-pattern"], "background-opacity", [1, 0]
            ],
            [
                ["water"], "fill-color", ["#AFAEA9", "#bac2c4"]
            ]
        ],
        "layout": []
    },    
    "L4": {
        "text": "water from brown to gray; city icon to chimney, landcover",
        "paint": [
            [
                ["water"], "fill-color", ["#bac2c4", "#B1D5E1"]
            ],
            [
                ["water-shadow"], "fill-color", ["#776E6B", "#909da2"]
            ],
            [
                ["landcover_crop", "landcover_grass", "landcover_scrub", "landcover_wood"], "fill-color", ["#D9D2C9", "#DEEDB1"]
            ], 
            [
                ["background"], "background-color", ["#edebe8", "#E5EBD8"]
            ]
        ],
        "layout": [
            [
                ["place-city-lg-n","place-city-lg-s","place-city-md-n","place-city-md-s"], "icon-image", ["icon_skull","icon_chimney"]
            ]
        ]
    },
    "L5": {
        "text": "water/waterways turn blue, buildings, hillshading, city icon to tree, bg less gray",
        "paint": [
            [
                ["water"], "fill-color", ["#B1D5E1", "#a8e8ff"]
            ],
            [
                ["water-shadow"], "fill-color", ["#909da2", "#6ea5f2"]
            ],
            [
                ["waterway-small","waterway-river-canal"], "line-color", ["#909da2", "#6ea5f2"]
            ],
            [
                ["water-pattern"], "fill-pattern", ["desert_waveb", "desert_wave"]
            ],
            [
                ["building"], "fill-color", ["#D7CFC6", "#F5D6ED"]
            ],
            [
                ["building"], "fill-outline-color", ["#C7BBAE", "#F896D2"]
            ],
            [
                ["hillshade_shadow_extreme","hillshade_shadow_dark","hillshade_shadow_med","hillshade_shadow_faint"], "fill-color", ["#593B17", "#595517"]
            ],
            [
                ["background"], "background-color", ["#E5EBD8", "#d0edab"]
            ]
        ],
        "layout": [
            [
                ["place-city-lg-n","place-city-lg-s","place-city-md-n","place-city-md-s"], "icon-image", ["icon_chimney","icon_tree"]
            ]
        ]
    }
};


window.onload = function() {

    // load steps to sidebar
    var html = "";
    for (step in steps) {
        html = "<div class='step keyline-bottom' id=" + step 
        	+ "><h1>" + step + "</h1><p>" 
        	+ steps[step]["text"] + "</p></div>"
        $("#console").append(html);
    }
};

map.on('load', function() {

	// shorten attribution for mobile
	var attribution = '<a href="https://www.mapbox.com/about/maps/" target="_blank">© Mapbox</a> <a href="http://www.openstreetmap.org/about/" target="_blank">© OpenStreetMap</a> <a class="icon info" href="https://www.mapbox.com/map-feedback/#/-122.46480247176717/37.750219573134345/12" target="_blank"></a>';
    $(".mapboxgl-ctrl-attrib").html(attribution);

    $(".step").click(function(){
    	Greenify(this.id);
    });

});

function Greenify( id ) {

	steps[id]["paint"].forEach(function(property){
		property[0].forEach(function(layer){
			// greenify or ungreenify ?
			var klass = $("#"+id).hasClass("greenified") ? 0 : 1;

			// console.log(layer, property[1], property[2][klass]);
			map.setPaintProperty(layer, property[1], property[2][klass]);
		});
	});
    steps[id]["layout"].forEach(function(property){
        property[0].forEach(function(layer){
            // same as paint
            var klass = $("#"+id).hasClass("greenified") ? 0 : 1;
            map.setLayoutProperty(layer, property[1], property[2][klass]);
        });
    });    

	$("#"+id).toggleClass("greenified");
}
