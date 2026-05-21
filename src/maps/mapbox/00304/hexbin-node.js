var radius = 0.25;  //mile
var outputName = "grids";
var grids = {};
var points = {};

// "Complaint Type"
var types = {
    "noise": {
        "values": ["Noise - Commercial"],
        "count": 20813,
        "max": 0
    },
    "establishment": {
        "values": ["Food Establishment"],
        "count": 8354,
        "max": 0
    },
    "poisoning": {
        "values": ["Food Poisoning"],
        "count": 2433,
        "max": 0
    },
    "drinking": {
        "values": ["Drinking"],
        "count": 453,
        "max": 0
    },
    "smoking": {
        "values": ["Smoking"],
        "count": 310,
        "max": 0
    },
    "others": {
        "values": ["Bottled Water", "Calorie Labeling", "Indoor Air Quality", "Urinating in Public"],
        "count": 121,
        "max": 0
    }
};
var maxBusinesses = 0;
var maxComplaints = 0;

var turf = require('@turf/turf');

// get events.geojson
var fs = require('fs');

// data: all "noise - typename" complaint incidents to NYPD in year 2015 from NYC open data website
// raw data not included in /bites
fs.readFile('./data_complaints.geojson', 'utf8', function(err1, data_complaints) {
        if (err1) {
        return console.log(err);
    };
    fs.readFile('./data_businesses.geojson', 'utf8', function(err2, data_businesses) {
        if (err2) {
            return console.log(err);
        };

        var complaints = JSON.parse(data_complaints);
        var businesses = JSON.parse(data_businesses);

        // bounding box for all points in [west, south, east, north]
        var bounds = turf.bbox(complaints);
        // create hexgrids to the data map extent, radius = 1/4 mile
        grids = turf.hexGrid(bounds, radius, "miles");

        grids.features.forEach(function(polygon, i){

            // wrap the grid in a feature collection
            var grid = turf.featureCollection([polygon]);

            // calculate businesses first
            var pointsIn = turf.within(businesses, grid);
            polygon.properties.businesses = pointsIn.features.length;
            // global max
            maxBusinesses = Math.max(pointsIn.features.length>maxBusinesses);

            // calculate complaints, and by category
            var pointsIn = turf.within(complaints, grid);
            polygon.properties.total = pointsIn.features.length;
            // global max
            maxBusinesses = Math.max(pointsIn.features.length>maxBusinesses);

            for (type in types) {
                polygon.properties[type] = 0;

                pointsIn.features.forEach(function(point){
                    if (types[type]["values"].indexOf( point.properties["Complaint Type"] ) !== -1 ) {
                        polygon.properties[type] += 1;
                    };
                });
                // max per subtype
                types[type]["max"] = Math.max( types[type]["max"], polygon.properties[type] );
            };
        });

        // remove empty elements    
        for (var i = 0; i < grids.features.length; i++) {

            if ( grids.features[i].properties.total === 0 ) { 
                // remove empty features        
                grids.features.splice(i, 1);
                i--;
            } else {
                // else add index to properties
                grids.features[i].properties.index = i;
            }
        };

        // output grids
        var output = "var gridsRaw =" + JSON.stringify(grids) + 
            ";var types =" + JSON.stringify(types) + ";";
        // write file to local
        fs.writeFile("./" + outputName + "25_all.js", output, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    });
});
