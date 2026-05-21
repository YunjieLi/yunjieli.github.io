mapboxgl.accessToken = 'pk.eyJ1IjoieXVuamllbGkiLCJhIjoiY2lxdmV5MG5rMDAxNmZta3FlNGhyMmpicSJ9.CTEQgAyZGROcpJouZuzJyA';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/yunjieli/cisunnfd8004u2woxxisl0bjx', //stylesheet location
    // center: [-34.25101668854893, 24.006689383052304], // starting position
    // zoom: 1.5, // starting zoom,
});

var isMobile;
$(window).width() <= 640 ? isMobile = true : isMobile = false;

// if it's embedded in a blog post
var isBlog;
window.location.search.indexOf('embed') !== -1 ? isBlog = true : isBlog = false;
isBlog ? map.scrollZoom.disable() : null;

map.fitBounds([[-99.7271739343309,-53.92925094590435],[64.17503977479461,73.29371813020106]]);

// new timeline
var timeline2 = [
    {
        "eventID": 1,
        "name": "Yonas Kinde",
        "year": 1980,
        "event": "was born in Ethiopia.",
        "eventShort": "was born",
        "lineID": "",
        "id": "yonas",
        "start": "Ethiopia",
        "end": "",
        "zoom": "overview",
        "homeCountry": "Ethiopia"
    }, {
        "eventID": 2,
        "name": "Yolande Mabika",
        "year": 1987,
        "event": "was born in Bukavu area of the Democratic Republic of the Congo.",
        "eventShort": "was born",
        "lineID": "",
        "id": "yolande",
        "start": "Bukavu area",
        "end": "",
        "zoom": "sudan",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 3,
        "name": "Ibrahim Al Hussein",
        "year": 1988,
        "event": "was born in Deir ez-Zor, Syria.",
        "eventShort": "was born",
        "lineID": "",
        "id": "ibrahim",
        "start": "Deir ez-Zor",
        "end": "",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 4,
        "name": "Rami Anis",
        "year": 1991,
        "event": "was born in Aleppo, Syria.",
        "eventShort": "was born",
        "lineID": "",
        "id": "rami",
        "start": "Aleppo",
        "end": "",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 6,
        "name": "Popole Misenga",
        "year": 1992,
        "event": "was born in Bukavu area of the Democratic Republic of the Congo.",
        "eventShort": "was born",
        "lineID": "",
        "id": "popole",
        "start": "Bukavu area",
        "end": "",
        "zoom": "congo",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 7,
        "name": "James Chiengjiek",
        "year": 1992,
        "event": "was born in Nasir, South Sudan.",
        "eventShort": "was born",
        "lineID": "",
        "id": "james",
        "start": "Nasir",
        "end": "",
        "zoom": "congo",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 5,
        "name": "Paulo Lokoro",
        "year": 1992,
        "event": "was born in Bentiu, South Sudan.",
        "eventShort": "was born",
        "lineID": "",
        "id": "paulo",
        "start": "Bentiu",
        "end": "",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 8,
        "name": "Anjelina Lohalith",
        "year": 1993,
        "event": "was born in South Sudan.",
        "eventShort": "was born",
        "lineID": "",
        "id": "anjelina",
        "start": "South Sudan",
        "end": "",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 10,
        "name": "Rose Lokonyen",
        "year": 1995,
        "event": "was born in South Sudan.",
        "eventShort": "was born",
        "lineID": "",
        "id": "rose",
        "start": "South Sudan",
        "end": "",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 9,
        "name": "Yiech Biel",
        "year": 1995,
        "event": "was born in Nasir, South Sudan.",
        "eventShort": "was born",
        "lineID": "",
        "id": "yiech",
        "start": "Nasir",
        "end": "",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 12,
        "name": "Yolande Mabika",
        "year": 1998,
        "event": "was evacuated to Kinshasa at the age of 11.",
        "eventShort": "left home",
        "lineID": "DRC1",
        "id": "yolande",
        "start": "Bukavu area",
        "end": "Kinshasa",
        "zoom": "congo",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 11,
        "name": "Yusra Mardini",
        "year": 1998,
        "event": "was born in Damascus, Syria.",
        "eventShort": "was born",
        "lineID": "",
        "id": "yusra",
        "start": "Damascus",
        "end": "",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 13,
        "name": "Popole Misenga",
        "year": 2001,
        "event": "was evacuated to Kinshasa at the age of 11.",
        "eventShort": "left home",
        "lineID": "DRC1",
        "id": "popole",
        "start": "Bukavu area",
        "end": "Kinshasa",
        "zoom": "congo",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 14,
        "name": "Anjelina Lohalith",
        "year": 2002,
        "event": "fled to Kakuma refugee camp at the age of 9.",
        "eventShort": "left home",
        "lineID": "SS1",
        "id": "anjelina",
        "start": "South Sudan",
        "end": "Kakuma refugee camp",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 15,
        "name": "Rose Lokonyen",
        "year": 2002,
        "event": "fled to Kakuma refugee camp at the age of 7.",
        "eventShort": "left home",
        "lineID": "SS1",
        "id": "rose",
        "start": "South Sudan",
        "end": "Kakuma refugee camp",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 16,
        "name": "James Chiengjiek",
        "year": 2005,
        "event": "fled to Kakuma refugee camp at the age of 13.",
        "eventShort": "left home",
        "lineID": "SS4",
        "id": "james",
        "start": "Nasir",
        "end": "Kakuma refugee camp",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 17,
        "name": "Yiech Biel",
        "year": 2005,
        "event": "fled to Kakuma refugee camp at the age of 10.",
        "eventShort": "left home",
        "lineID": "SS5",
        "id": "yiech",
        "start": "Nasir",
        "end": "Kakuma refugee camp",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 18,
        "name": "Paulo Lokoro",
        "year": 2006,
        "event": "fled to Kakuma refugee camp at the age of 14.",
        "eventShort": "left home",
        "lineID": "SS5",
        "id": "paulo",
        "start": "Bentiu",
        "end": "Kakuma refugee camp",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 19,
        "name": "Rami Anis",
        "year": 2011,
        "event": "left Syria to live in Istanbul at the age of 20.",
        "eventShort": "left home",
        "lineID": "S1",
        "id": "rami",
        "start": "Aleppo",
        "end": "Istanbul",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 20,
        "name": "Yonas Kinde",
        "year": 2012,
        "event": "left Ethiopia at the age of 32 and migrated to Luxembourg.",
        "eventShort": "left home",
        "lineID": "E1",
        "id": "yonas",
        "start": "Ethiopia",
        "end": "Luxembourg",
        "zoom": "overview",
        "homeCountry": "Ethiopia"
    }, {
        "eventID": 23,
        "name": "Popole Misenga",
        "year": 2013,
        "event": "escaped mistreatment at the 2013 World Judo Championship in Rio.",
        "eventShort": "escaped",
        "lineID": "DRC2",
        "id": "popole",
        "start": "Kinshasa",
        "end": "Rio",
        "zoom": "rio",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 24,
        "name": "Yolande Mabika",
        "year": 2013,
        "event": "escaped mistreatment at the 2013 World Judo Championship in Rio.",
        "eventShort": "escaped",
        "lineID": "DRC2",
        "id": "yolande",
        "start": "Kinshasa",
        "end": "Rio",
        "zoom": "rio",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 22,
        "name": "James Chiengjiek",
        "year": 2013,
        "event": "was selected by Tegla Loroupe Foundation.",
        "eventShort": "became athlete",
        "lineID": "SS2",
        "id": "james",
        "start": "Kakuma refugee camp",
        "end": "Nairobi",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 21,
        "name": "Ibrahim Al Hussein",
        "year": 2013,
        "event": "lost one leg to a bombing and fled Syria at 25.",
        "eventShort": "left home",
        "lineID": "S8",
        "id": "ibrahim",
        "start": "Deir ez-Zor",
        "end": "Turkey",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 25,
        "name": "Ibrahim Al Hussein",
        "year": 2014,
        "event": "lived in Athens, Greece ever since.",
        "eventShort": "settled down",
        "lineID": "S10",
        "id": "ibrahim",
        "start": "Turkey",
        "end": "Samos Island",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 26,
        "name": "Ibrahim Al Hussein",
        "year": 2014,
        "event": "reached Samos Island of Greece on a dinghy boat.",
        "eventShort": "dinghy boat",
        "lineID": "S9",
        "id": "ibrahim",
        "start": "Samos Island",
        "end": "Athens",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 27,
        "name": "Anjelina Lohalith",
        "year": 2015,
        "event": "was selected by Tegla Loroupe Foundation.",
        "eventShort": "became athlete",
        "lineID": "SS2",
        "id": "anjelina",
        "start": "Kakuma refugee camp",
        "end": "Nairobi",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 28,
        "name": "Paulo Lokoro",
        "year": 2015,
        "event": "was selected by Tegla Loroupe Foundation.",
        "eventShort": "became athlete",
        "lineID": "SS2",
        "id": "paulo",
        "start": "Kakuma refugee camp",
        "end": "Nairobi",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 31,
        "name": "Rose Lokonyen",
        "year": 2015,
        "event": "was selected by Tegla Loroupe Foundation.",
        "eventShort": "became athlete",
        "lineID": "SS2",
        "id": "rose",
        "start": "Kakuma refugee camp",
        "end": "Nairobi",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 32,
        "name": "Yiech Biel",
        "year": 2015,
        "event": "was selected by Tegla Loroupe Foundation.",
        "eventShort": "became athlete",
        "lineID": "SS2",
        "id": "yiech",
        "start": "Kakuma refugee camp",
        "end": "Nairobi",
        "zoom": "sudan",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 29,
        "name": "Rami Anis",
        "year": 2015,
        "event": "reached Samos Island of Greece on a dinghy boat.",
        "eventShort": "dinghy boat",
        "lineID": "S2",
        "id": "rami",
        "start": "Istanbul",
        "end": "Samos Island",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 30,
        "name": "Rami Anis",
        "year": 2015,
        "event": "eventually reached Gent, Belgium.",
        "eventShort": "settled down",
        "lineID": "S3",
        "id": "rami",
        "start": "Samos Island",
        "end": "Gent",
        "zoom": "overview",
        "homeCountry": "Syria"
    }, {
        "eventID": 33,
        "name": "Yusra Mardini",
        "year": 2015,
        "event": "reached Lesbos Island of Greece on a dinghy boat.",
        "eventShort": "dinghy boat",
        "lineID": "S5",
        "id": "yusra",
        "start": "Damascus",
        "end": "Lesbos Island",
        "zoom": "mediterranean",
        "homeCountry": "Syria"
    }, {
        "eventID": 34,
        "name": "Yusra Mardini",
        "year": 2015,
        "event": "finally reached Berlin, Germany.",
        "eventShort": "settled down",
        "lineID": "S6",
        "id": "yusra",
        "start": "Lesbos Island",
        "end": "Berlin",
        "zoom": "overview",
        "homeCountry": "Syria"
    }, {
        "eventID": 38,
        "name": "Popole Misenga",
        "year": 2016,
        "event": "competed in judo in Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "DRC3",
        "id": "popole",
        "start": "Rio",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 42,
        "name": "Yolande Mabika",
        "year": 2016,
        "event": "competed in judo in Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "DRC3",
        "id": "yolande",
        "start": "Rio",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "DR Congo"
    }, {
        "eventID": 43,
        "name": "Yonas Kinde",
        "year": 2016,
        "event": "competed in track and field in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "E2",
        "id": "yonas",
        "start": "Luxembourg",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "Ethiopia"
    }, {
        "eventID": 35,
        "name": "Anjelina Lohalith",
        "year": 2016,
        "event": "competed in track and field in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "SS3",
        "id": "anjelina",
        "start": "Nairobi",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 36,
        "name": "James Chiengjiek",
        "year": 2016,
        "event": "competed in track and field in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "SS3",
        "id": "james",
        "start": "Nairobi",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 37,
        "name": "Paulo Lokoro",
        "year": 2016,
        "event": "competed in track and field in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "SS3",
        "id": "paulo",
        "start": "Nairobi",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 40,
        "name": "Rose Lokonyen",
        "year": 2016,
        "event": "competed in track and field in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "SS3",
        "id": "rose",
        "start": "Nairobi",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 46,
        "name": "Shahrad Nasajpour",
        "year": 2016,
        "event": "competed in track and field in the Rio Paralympics.",
        "eventShort": "Paralympics",
        "lineID": "I2",
        "id": "shahrad",
        "start": "USA",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "Iran"
    }, {
        "eventID": 41,
        "name": "Yiech Biel",
        "year": 2016,
        "event": "competed in track and field in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "SS3",
        "id": "yiech",
        "start": "Nairobi",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "South Sudan"
    }, {
        "eventID": 45,
        "name": "Ibrahim Al Hussein",
        "year": 2016,
        "event": "competed in swimming in the Rio Paralympics.",
        "eventShort": "Paralympics",
        "lineID": "S11",
        "id": "ibrahim",
        "start": "Athens",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "Syria"
    }, {
        "eventID": 39,
        "name": "Rami Anis",
        "year": 2016,
        "event": "competed in swimming in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "S4",
        "id": "rami",
        "start": "Gent",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "Syria"
    }, {
        "eventID": 44,
        "name": "Yusra Mardini",
        "year": 2016,
        "event": "competed in swimming in the Rio Olympics.",
        "eventShort": "Olympics",
        "lineID": "S7",
        "id": "yusra",
        "start": "Berlin",
        "end": "Rio",
        "zoom": "stadium",
        "homeCountry": "Syria"
            // }, {
            //     "eventID": 47,
            //     "name": "Shahrad Nasajpour",
            //     "year": 9999,
            //     "event": "left Iran and moved to the US.",
            //     "eventShort": "",
            //     "lineID": "I1",
            //     "id": "shahrad",
            //     "start": "Iran",
            //     "end": "USA",
            //     "zoom": "usa",
            //     "homeCountry": "Iran"
    }
];
// geojson of all points
var points = {
    "features": [{
        "type": "Feature",
        "properties": {
            "name": "Rio",
            "location": 1,
            "anchor": "right",
            "homeCountry": "DR Congo"
        },
        "geometry": {
            "coordinates": [-43.230123, -22.912101],
            "type": "Point"
        },
        "id": "e3ac8d68186b40a4b53a5f9ffd9b6888"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Lesbos Island",
            "place_name": "Lesvos, Βορειο Αιγαιο, Greece",
            "location": 1,
            "year": 2015,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                26.550874,
                39.099872
            ],
            "type": "Point"
        },
        "id": "16cf2956c18220f90279b0e05b2e8afd"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Iran",
            "birthplace": 1,
            "homeCountry": "Iran",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                54.301374,
                32.565838
            ],
            "type": "Point"
        },
        "id": "1cf64ff7b3c2097fc64dc11b7617b901"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Berlin",
            "location": 1,
            "year": 2015,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                13.3893,
                52.517106
            ],
            "type": "Point"
        },
        "id": "2a2b6dd46ea7d3b5111933c4c4d2b1cc"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Kinshasa",
            "location": 1,
            "homeCountry": "DR Congo",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                15.312037, -4.325354
            ],
            "type": "Point"
        },
        "id": "418d3a68b0807d2b1129adc7697c7831"
    }, {
        "type": "Feature",
        "properties": {
            "birthplace": 1,
            "name": "Aleppo",
            "annotation": 1,
            "year": 1991,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                37.18409,
                36.201446
            ],
            "type": "Point"
        },
        "id": "512c4d2f60c0bab2572d836e2591616d"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Bukavu area",
            "birthplace": 1,
            "homeCountry": "DR Congo",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                28.859884, -2.507307
            ],
            "type": "Point"
        },
        "id": "577e2cd24a3c239d75b87c79b224abc1"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Ethiopia",
            "birthplace": 1,
            "homeCountry": "Ethiopia",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                38.759098,
                9.017082
            ],
            "type": "Point"
        },
        "id": "62a3b0351807f4c4b625d47a700eb37e"
    }, {
        "type": "Feature",
        "properties": {
            "place_name": "Dayr Az Zawr, Syria",
            "name": "Deir ez-Zor",
            "birthplace": 1,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                40.257134,
                35.307897
            ],
            "type": "Point"
        },
        "id": "656d1e69d78f2ed94fdc91d2b61b4305"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Istanbul",
            "location": 1,
            "year": 2011,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                28.966761,
                41.008246
            ],
            "type": "Point"
        },
        "id": "67bebd0a927c4f3be8232420b1cb97ce"
    }, {
        "type": "Feature",
        "properties": {
            "name": "USA",
            "location": 1,
            "homeCountry": "Iran",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [-97.922211,
                39.381266
            ],
            "type": "Point"
        },
        "id": "847dbcb889ea3d85d5a94b32631b022c"
    }, {
        "type": "Feature",
        "properties": {
            "birthplace": 1,
            "name": "Damascus",
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                36.285234,
                33.509224
            ],
            "type": "Point"
        },
        "id": "900566b0d970ac2a14232d39bf36e417"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Turkey",
            "location": 1,
            "year": 2013,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                35.179593,
                39.060481
            ],
            "type": "Point"
        },
        "id": "96473695c07c5d34d2dc86b1691bac88"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Athens",
            "location": 1,
            "year": 2014,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                23.728098,
                37.984263
            ],
            "type": "Point"
        },
        "id": "a23dfe5dd9ed4ad819a96f6875567960"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Luxembourg",
            "location": 1,
            "year": 2012,
            "homeCountry": "Ethiopia",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                6.131759,
                49.603575
            ],
            "type": "Point"
        },
        "id": "bbc7545bafa451057b4aeb9cf3e95441"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Gent",
            "location": 1,
            "year": 2015,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                3.724583,
                51.053365
            ],
            "type": "Point"
        },
        "id": "d16553d4e005637c283ffd4d20397712"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Kakuma refugee camp",
            "location": 1,
            "homeCountry": "South Sudan",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                34.82662,
                3.753923
            ],
            "type": "Point"
        },
        "id": "e74822251d8f12bf3da61422eb841c81"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Nasir",
            "birthplace": 1,
            "homeCountry": "South Sudan",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                33.062019,
                8.622465
            ],
            "type": "Point"
        },
        "id": "e84e8c74ba42c58bf896ed2e7ef21d6c"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Nairobi",
            "location": 1,
            "annotation": 1,
            "homeCountry": "South Sudan",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                36.819952, -1.279686
            ],
            "type": "Point"
        },
        "id": "e9a8fcc9afef07ae958faa7c7d683cee"
    }, {
        "type": "Feature",
        "properties": {
            "name": "South Sudan",
            "birthplace": 1,
            "homeCountry": "South Sudan",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                30.604206,
                6.883792
            ],
            "type": "Point"
        },
        "id": "f19899be28eeeb5d5d775a11c7a0c59b"
    }, {
        "type": "Feature",
        "properties": {
            "place_name": "Samos, Βορειο Αιγαιο, Greece",
            "name": "Samos Island",
            "location": 1,
            "year": 2014,
            "homeCountry": "Syria",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                26.993872,
                37.708185
            ],
            "type": "Point"
        },
        "id": "f700be02bc9db88e7ee4670a53f40bdd"
    }, {
        "type": "Feature",
        "properties": {
            "name": "Bentiu",
            "birthplace": 1,
            "homeCountry": "South Sudan",
            "anchor": "right"
        },
        "geometry": {
            "coordinates": [
                29.810942,
                9.266912
            ],
            "type": "Point"
        },
        "id": "fd51a0d3f61b9d2526694b59888b8747"
    }],
    "type": "FeatureCollection"
};
// dictionary of all point locations involved
var locations = {
    "Bentiu": [29.810942, 9.266912],
    "Aleppo": [37.18409, 36.201446],
    "Nairobi": [36.819952, -1.279686],
    "Athens": [23.728098, 37.984263],
    "Samos Island": [26.993872, 37.708185],
    "Ethiopia": [38.759098, 9.017082],
    "Kakuma refugee camp": [34.82662, 3.753923],
    "South Sudan": [30.604206, 6.883792],
    "Istanbul": [28.966761, 41.008246],
    "Deir ez-Zor": [40.257134, 35.307897],
    "Gent": [3.724583, 51.053365],
    "Damascus": [36.285234, 33.509224],
    "Nasir": [33.062019, 8.622465],
    "Bukavu area": [28.859884, -2.507307],
    "Bras de Pina, Rio": [-43.293022, -22.830461],
    "Luxembourg": [6.131759, 49.603575],
    "Kinshasa": [15.312037, -4.325354],
    "USA": [-97.922211, 39.381266],
    "Turkey": [35.179593, 39.060481],
    "Lesbos Island": [26.550874, 39.099872],
    "Rio": [-43.230123, -22.912101],
    "Berlin": [13.3893, 52.517106],
    "Iran": [54.301374, 32.565838]
};
var countries = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "properties": {
            "homeCountry": "Iran"
        },
        "geometry": {
            "coordinates": [
                [
                    [
                        48.814332,
                        38.334317
                    ],
                    [
                        48.442147,
                        38.604901
                    ],
                    [
                        48.069961,
                        38.874468
                    ],
                    [
                        48.335808,
                        39.019198
                    ],
                    [
                        48.123131,
                        39.246033
                    ],
                    [
                        48.362393,
                        39.390002
                    ],
                    [
                        48.043377,
                        39.67705
                    ],
                    [
                        47.245836,
                        39.369453
                    ],
                    [
                        46.687558,
                        38.874468
                    ],
                    [
                        45.517832,
                        38.977877
                    ],
                    [
                        45.119061,
                        39.328337
                    ],
                    [
                        44.667122,
                        39.758846
                    ],
                    [
                        44.42786,
                        39.595157
                    ],
                    [
                        44.348106,
                        39.390002
                    ],
                    [
                        44.002505,
                        39.431081
                    ],
                    [
                        44.108844,
                        39.163632
                    ],
                    [
                        44.215182,
                        38.417682
                    ],
                    [
                        44.42786,
                        38.355167
                    ],
                    [
                        44.268352,
                        37.999899
                    ],
                    [
                        44.534198,
                        37.769098
                    ],
                    [
                        44.667122,
                        37.474306
                    ],
                    [
                        44.986138,
                        36.625622
                    ],
                    [
                        45.305154,
                        36.347761
                    ],
                    [
                        45.464662,
                        35.982904
                    ],
                    [
                        45.916602,
                        35.853726
                    ],
                    [
                        46.235618,
                        35.789057
                    ],
                    [
                        45.969771,
                        35.659563
                    ],
                    [
                        46.235618,
                        35.161222
                    ],
                    [
                        45.863433,
                        35.05248
                    ],
                    [
                        45.544416,
                        34.484689
                    ],
                    [
                        45.491247,
                        33.979167
                    ],
                    [
                        46.182449,
                        33.22634
                    ],
                    [
                        46.129279,
                        32.981377
                    ],
                    [
                        46.634388,
                        32.847473
                    ],
                    [
                        47.139497,
                        32.399666
                    ],
                    [
                        47.405344,
                        32.399666
                    ],
                    [
                        47.830699,
                        31.791589
                    ],
                    [
                        47.72436,
                        31.315855
                    ],
                    [
                        47.697776,
                        30.997356
                    ],
                    [
                        47.990207,
                        30.974565
                    ],
                    [
                        48.016792,
                        30.517607
                    ],
                    [
                        48.654824,
                        29.943378
                    ],
                    [
                        49.000425,
                        30.173472
                    ],
                    [
                        49.02701,
                        30.40303
                    ],
                    [
                        49.532119,
                        30.1045
                    ],
                    [
                        50.063812,
                        30.173472
                    ],
                    [
                        50.808184,
                        29.273096
                    ],
                    [
                        51.313293,
                        28.083633
                    ],
                    [
                        51.712063,
                        27.848831
                    ],
                    [
                        52.323511,
                        27.660623
                    ],
                    [
                        52.748865,
                        27.283233
                    ],
                    [
                        53.413483,
                        26.975656
                    ],
                    [
                        53.812253,
                        26.643478
                    ],
                    [
                        54.583209,
                        26.595944
                    ],
                    [
                        55.912443,
                        27.046711
                    ],
                    [
                        56.444136,
                        27.11772
                    ],
                    [
                        56.97583,
                        26.904557
                    ],
                    [
                        57.3746,
                        25.856666
                    ],
                    [
                        58.969681,
                        25.545256
                    ],
                    [
                        60.644516,
                        25.449274
                    ],
                    [
                        61.62815,
                        25.136805
                    ],
                    [
                        61.734488,
                        25.760934
                    ],
                    [
                        61.947166,
                        26.214968
                    ],
                    [
                        62.292767,
                        26.3818
                    ],
                    [
                        62.558613,
                        26.595944
                    ],
                    [
                        63.170061,
                        26.595944
                    ],
                    [
                        63.2764,
                        27.188684
                    ],
                    [
                        62.797876,
                        27.306858
                    ],
                    [
                        62.82446,
                        27.825323
                    ],
                    [
                        62.744706,
                        28.294517
                    ],
                    [
                        62.239597,
                        28.504984
                    ],
                    [
                        61.840827,
                        28.598391
                    ],
                    [
                        61.255964,
                        29.41214
                    ],
                    [
                        60.804024,
                        29.874245
                    ],
                    [
                        61.814242,
                        30.860529
                    ],
                    [
                        61.761073,
                        31.270421
                    ],
                    [
                        61.57498,
                        31.429345
                    ],
                    [
                        60.857194,
                        31.542698
                    ],
                    [
                        60.830609,
                        32.197423
                    ],
                    [
                        60.644516,
                        32.802793
                    ],
                    [
                        60.671101,
                        33.137341
                    ],
                    [
                        60.883778,
                        33.537124
                    ],
                    [
                        60.564762,
                        33.669976
                    ],
                    [
                        60.511593,
                        34.067302
                    ],
                    [
                        60.72427,
                        34.331156
                    ],
                    [
                        61.123041,
                        35.030715
                    ],
                    [
                        61.282549,
                        35.616352
                    ],
                    [
                        61.202795,
                        36.390574
                    ],
                    [
                        61.149625,
                        36.646955
                    ],
                    [
                        60.3255,
                        36.668281
                    ],
                    [
                        60.059653,
                        37.05115
                    ],
                    [
                        59.581129,
                        37.135972
                    ],
                    [
                        59.368452,
                        37.432097
                    ],
                    [
                        58.889927,
                        37.663949
                    ],
                    [
                        57.932879,
                        37.853109
                    ],
                    [
                        57.42777,
                        37.978947
                    ],
                    [
                        57.188508,
                        38.292599
                    ],
                    [
                        56.869491,
                        38.20909
                    ],
                    [
                        56.390967,
                        38.271731
                    ],
                    [
                        56.364382,
                        37.999899
                    ],
                    [
                        55.673181,
                        38.083648
                    ],
                    [
                        55.194656,
                        37.937025
                    ],
                    [
                        54.795886,
                        37.684991
                    ],
                    [
                        54.795886,
                        37.495401
                    ],
                    [
                        54.397116,
                        37.326472
                    ],
                    [
                        53.918592,
                        37.36874
                    ],
                    [
                        54.02493,
                        36.966234
                    ],
                    [
                        53.971761,
                        36.753529
                    ],
                    [
                        53.466652,
                        36.902485
                    ],
                    [
                        52.057664,
                        36.604284
                    ],
                    [
                        51.446216,
                        36.668281
                    ],
                    [
                        50.701845,
                        36.881223
                    ],
                    [
                        50.223321,
                        37.178347
                    ],
                    [
                        50.170151,
                        37.432097
                    ],
                    [
                        49.611873,
                        37.495401
                    ],
                    [
                        49.239687,
                        37.453205
                    ],
                    [
                        48.920671,
                        37.895079
                    ],
                    [
                        48.814332,
                        38.334317
                    ]
                ]
            ],
            "type": "Polygon"
        }
    }, {
        "type": "Feature",
        "properties": {
            "name": "Syria",
            "homeCountry": 1,
            "birthcount": 2
        },
        "geometry": {
            "coordinates": [
                [
                    [
                        35.916014,
                        35.951244
                    ],
                    [
                        36.186318,
                        35.819845
                    ],
                    [
                        36.240379,
                        35.962184
                    ],
                    [
                        36.402562,
                        36.180666
                    ],
                    [
                        36.672866,
                        36.246092
                    ],
                    [
                        36.551229,
                        36.420295
                    ],
                    [
                        36.60529,
                        36.670027
                    ],
                    [
                        36.713412,
                        36.832461
                    ],
                    [
                        37.064807,
                        36.72421
                    ],
                    [
                        37.172929,
                        36.659186
                    ],
                    [
                        37.470264,
                        36.637499
                    ],
                    [
                        37.645961,
                        36.735042
                    ],
                    [
                        38.227116,
                        36.929756
                    ],
                    [
                        38.551481,
                        36.854093
                    ],
                    [
                        38.740694,
                        36.713377
                    ],
                    [
                        39.010998,
                        36.72421
                    ],
                    [
                        39.267787,
                        36.702541
                    ],
                    [
                        40.10573,
                        36.843278
                    ],
                    [
                        40.41658,
                        37.016137
                    ],
                    [
                        40.943674,
                        37.113198
                    ],
                    [
                        41.227493,
                        37.080858
                    ],
                    [
                        41.592404,
                        37.123975
                    ],
                    [
                        42.065437,
                        37.177836
                    ],
                    [
                        42.200589,
                        37.317696
                    ],
                    [
                        42.30871,
                        37.210134
                    ],
                    [
                        42.349256,
                        37.05929
                    ],
                    [
                        41.849193,
                        36.594107
                    ],
                    [
                        41.34913,
                        36.539833
                    ],
                    [
                        41.268039,
                        36.202481
                    ],
                    [
                        41.281554,
                        35.984059
                    ],
                    [
                        41.389676,
                        35.775997
                    ],
                    [
                        41.362645,
                        35.655291
                    ],
                    [
                        41.254524,
                        35.391297
                    ],
                    [
                        41.213978,
                        35.104326
                    ],
                    [
                        41.200463,
                        34.771945
                    ],
                    [
                        40.970704,
                        34.393623
                    ],
                    [
                        40.592278,
                        34.304356
                    ],
                    [
                        37.686507,
                        32.74965
                    ],
                    [
                        37.402688,
                        32.635908
                    ],
                    [
                        37.105353,
                        32.487828
                    ],
                    [
                        36.835049,
                        32.293818
                    ],
                    [
                        36.362016,
                        32.373756
                    ],
                    [
                        36.145773,
                        32.522022
                    ],
                    [
                        35.95656,
                        32.670046
                    ],
                    [
                        35.753831,
                        32.761017
                    ],
                    [
                        35.861953,
                        32.988034
                    ],
                    [
                        35.780862,
                        33.327469
                    ],
                    [
                        36.037651,
                        33.507962
                    ],
                    [
                        35.98359,
                        33.643086
                    ],
                    [
                        36.132257,
                        33.845374
                    ],
                    [
                        36.334986,
                        33.890262
                    ],
                    [
                        36.375531,
                        34.047184
                    ],
                    [
                        36.564744,
                        34.125537
                    ],
                    [
                        36.578259,
                        34.304356
                    ],
                    [
                        36.483653,
                        34.493934
                    ],
                    [
                        36.348501,
                        34.516209
                    ],
                    [
                        36.429592,
                        34.660853
                    ],
                    [
                        36.199833,
                        34.660853
                    ],
                    [
                        35.970075,
                        34.638616
                    ],
                    [
                        35.916014,
                        34.927224
                    ],
                    [
                        35.888984,
                        35.093268
                    ],
                    [
                        35.943044,
                        35.2369
                    ],
                    [
                        35.888984,
                        35.446367
                    ],
                    [
                        35.780862,
                        35.556395
                    ],
                    [
                        35.780862,
                        35.666271
                    ],
                    [
                        35.848438,
                        35.797924
                    ],
                    [
                        35.916014,
                        35.951244
                    ]
                ]
            ],
            "type": "Polygon"
        }
    }, {
        "type": "Feature",
        "properties": {
            "homeCountry": "Ethiopia"
        },
        "geometry": {
            "coordinates": [
                [
                    [
                        34.07355,
                        9.517227
                    ],
                    [
                        34.261158,
                        10.071845
                    ],
                    [
                        34.373722,
                        10.256508
                    ],
                    [
                        34.279918,
                        10.62551
                    ],
                    [
                        34.56133,
                        10.920392
                    ],
                    [
                        34.842742,
                        10.736124
                    ],
                    [
                        34.992828,
                        10.957231
                    ],
                    [
                        35.105393,
                        11.729785
                    ],
                    [
                        35.27424,
                        11.950125
                    ],
                    [
                        35.705737,
                        12.591747
                    ],
                    [
                        36.080953,
                        12.738181
                    ],
                    [
                        36.324843,
                        13.432574
                    ],
                    [
                        36.474929,
                        13.760804
                    ],
                    [
                        36.474929,
                        13.997573
                    ],
                    [
                        36.643776,
                        14.37953
                    ],
                    [
                        37.056513,
                        14.288646
                    ],
                    [
                        37.169078,
                        14.45221
                    ],
                    [
                        37.337925,
                        14.434042
                    ],
                    [
                        37.506772,
                        14.179537
                    ],
                    [
                        37.863227,
                        14.851524
                    ],
                    [
                        38.369767,
                        14.670108
                    ],
                    [
                        38.444811,
                        14.415873
                    ],
                    [
                        38.988873,
                        14.543027
                    ],
                    [
                        39.120198,
                        14.670108
                    ],
                    [
                        39.289045,
                        14.434042
                    ],
                    [
                        39.626739,
                        14.597499
                    ],
                    [
                        40.13328,
                        14.506705
                    ],
                    [
                        40.733625,
                        14.215913
                    ],
                    [
                        40.977515,
                        14.015776
                    ],
                    [
                        41.183884,
                        13.633213
                    ],
                    [
                        41.615382,
                        13.414326
                    ],
                    [
                        42.009358,
                        12.884531
                    ],
                    [
                        42.196966,
                        12.793072
                    ],
                    [
                        42.403334,
                        12.481866
                    ],
                    [
                        41.953076,
                        11.839977
                    ],
                    [
                        41.727946,
                        11.564415
                    ],
                    [
                        41.765468,
                        11.049311
                    ],
                    [
                        42.196966,
                        10.957231
                    ],
                    [
                        42.665985,
                        11.104545
                    ],
                    [
                        42.928636,
                        11.030897
                    ],
                    [
                        42.703507,
                        10.699257
                    ],
                    [
                        42.834832,
                        10.256508
                    ],
                    [
                        43.435177,
                        9.424702
                    ],
                    [
                        44.204369,
                        8.943176
                    ],
                    [
                        46.849638,
                        8.07113
                    ],
                    [
                        47.281136,
                        7.996824
                    ],
                    [
                        47.994045,
                        7.996824
                    ],
                    [
                        44.9548,
                        4.958706
                    ],
                    [
                        44.110565,
                        4.940015
                    ],
                    [
                        43.153765,
                        4.753078
                    ],
                    [
                        42.928636,
                        4.360348
                    ],
                    [
                        42.140683,
                        4.17326
                    ],
                    [
                        41.896793,
                        3.948696
                    ],
                    [
                        41.615382,
                        3.948696
                    ],
                    [
                        41.108841,
                        3.986128
                    ],
                    [
                        40.696104,
                        4.285518
                    ],
                    [
                        39.908151,
                        3.967412
                    ],
                    [
                        39.570457,
                        3.461937
                    ],
                    [
                        38.519854,
                        3.686628
                    ],
                    [
                        38.050834,
                        3.686628
                    ],
                    [
                        37.056513,
                        4.322934
                    ],
                    [
                        36.812623,
                        4.472578
                    ],
                    [
                        35.987149,
                        4.472578
                    ],
                    [
                        35.893345,
                        4.696987
                    ],
                    [
                        35.738197,
                        5.394908
                    ],
                    [
                        35.233143,
                        5.432618
                    ],
                    [
                        34.904858,
                        5.985419
                    ],
                    [
                        34.993243,
                        6.449845
                    ],
                    [
                        34.412431,
                        6.87624
                    ],
                    [
                        33.730608,
                        7.665297
                    ],
                    [
                        33.023532,
                        7.84045
                    ],
                    [
                        33.23818,
                        8.340475
                    ],
                    [
                        33.755861,
                        8.440405
                    ],
                    [
                        34.109398,
                        8.727558
                    ],
                    [
                        34.07355,
                        9.517227
                    ]
                ]
            ],
            "type": "Polygon"
        }
    }, {
        "type": "Feature",
        "properties": {
            "homeCountry": "South Sudan"
        },
        "geometry": {
            "coordinates": [
                [
                    [
                        27.925287,
                        9.598142
                    ],
                    [
                        27.103301,
                        9.656029
                    ],
                    [
                        26.653165,
                        9.48234
                    ],
                    [
                        26.300885,
                        9.617439
                    ],
                    [
                        26.105174,
                        10.09949
                    ],
                    [
                        25.831179,
                        10.388377
                    ],
                    [
                        25.048335,
                        10.311366
                    ],
                    [
                        25.009193,
                        9.868193
                    ],
                    [
                        24.598199,
                        9.771772
                    ],
                    [
                        24.050209,
                        9.713905
                    ],
                    [
                        23.697929,
                        9.656029
                    ],
                    [
                        23.502218,
                        9.018743
                    ],
                    [
                        23.521789,
                        8.748035
                    ],
                    [
                        24.285062,
                        8.631956
                    ],
                    [
                        24.128493,
                        8.419053
                    ],
                    [
                        24.343775,
                        8.264141
                    ],
                    [
                        24.872195,
                        8.128541
                    ],
                    [
                        25.244046,
                        7.857209
                    ],
                    [
                        25.244046,
                        7.566298
                    ],
                    [
                        25.596326,
                        7.178112
                    ],
                    [
                        26.046461,
                        7.061591
                    ],
                    [
                        26.300885,
                        6.692416
                    ],
                    [
                        26.340028,
                        6.400764
                    ],
                    [
                        26.751021,
                        5.972708
                    ],
                    [
                        27.279441,
                        5.700133
                    ],
                    [
                        27.25987,
                        5.349491
                    ],
                    [
                        27.573007,
                        4.842655
                    ],
                    [
                        28.023143,
                        4.511055
                    ],
                    [
                        29.001698,
                        4.452521
                    ],
                    [
                        29.412691,
                        4.491544
                    ],
                    [
                        29.667115,
                        4.667121
                    ],
                    [
                        29.862826,
                        4.569584
                    ],
                    [
                        30.038966,
                        4.179303
                    ],
                    [
                        30.841381,
                        3.632587
                    ],
                    [
                        31.213232,
                        3.84741
                    ],
                    [
                        31.585083,
                        3.73024
                    ],
                    [
                        31.956934,
                        3.74977
                    ],
                    [
                        32.524496,
                        3.73024
                    ],
                    [
                        33.013773,
                        3.84741
                    ],
                    [
                        33.542194,
                        3.788827
                    ],
                    [
                        34.559891,
                        4.784149
                    ],
                    [
                        35.205737,
                        4.920655
                    ],
                    [
                        35.518875,
                        4.667121
                    ],
                    [
                        35.910297,
                        4.686627
                    ],
                    [
                        35.734157,
                        5.388461
                    ],
                    [
                        35.24488,
                        5.427429
                    ],
                    [
                        34.8926,
                        5.972708
                    ],
                    [
                        34.990455,
                        6.439661
                    ],
                    [
                        34.422893,
                        6.867324
                    ],
                    [
                        33.737905,
                        7.643894
                    ],
                    [
                        33.013773,
                        7.837821
                    ],
                    [
                        33.229056,
                        8.360968
                    ],
                    [
                        33.777047,
                        8.457771
                    ],
                    [
                        34.109756,
                        8.709346
                    ],
                    [
                        34.090185,
                        9.48234
                    ],
                    [
                        33.894474,
                        9.598142
                    ],
                    [
                        34.0119,
                        9.887474
                    ],
                    [
                        33.914045,
                        10.272854
                    ],
                    [
                        33.48348,
                        10.657764
                    ],
                    [
                        33.248627,
                        10.792368
                    ],
                    [
                        33.150772,
                        11.426109
                    ],
                    [
                        33.326912,
                        12.24976
                    ],
                    [
                        32.700636,
                        12.211507
                    ],
                    [
                        32.700636,
                        11.943576
                    ],
                    [
                        32.093932,
                        11.886128
                    ],
                    [
                        32.387499,
                        11.675381
                    ],
                    [
                        32.407069,
                        11.176618
                    ],
                    [
                        32.42664,
                        10.926913
                    ],
                    [
                        31.956934,
                        10.676997
                    ],
                    [
                        31.389372,
                        9.791058
                    ],
                    [
                        30.841381,
                        9.733195
                    ],
                    [
                        30.449959,
                        10.02241
                    ],
                    [
                        29.980253,
                        10.272854
                    ],
                    [
                        29.530118,
                        10.09949
                    ],
                    [
                        29.549689,
                        9.771772
                    ],
                    [
                        29.04084,
                        9.733195
                    ],
                    [
                        28.727702,
                        9.366498
                    ],
                    [
                        28.023143,
                        9.347187
                    ],
                    [
                        27.925287,
                        9.598142
                    ]
                ]
            ],
            "type": "Polygon"
        }
    }, {
        "type": "Feature",
        "properties": {
            "homeCountry": "DR Congo"
        },
        "geometry": {
            "coordinates": [
                [
                    [
                        12.207808, -5.778218
                    ],
                    [
                        12.31583, -5.745975
                    ],
                    [
                        12.521072, -5.735227
                    ],
                    [
                        12.499467, -5.05771
                    ],
                    [
                        13.125994, -4.637933
                    ],
                    [
                        13.396048, -4.874762
                    ],
                    [
                        13.666103, -4.670233
                    ],
                    [
                        13.774125, -4.422564
                    ],
                    [
                        13.882146, -4.497951
                    ],
                    [
                        14.368245, -4.336399
                    ],
                    [
                        14.476266, -4.487182
                    ],
                    [
                        14.335838, -4.562561
                    ],
                    [
                        14.422255, -4.896288
                    ],
                    [
                        14.681508, -4.874762
                    ],
                    [
                        14.994771, -4.627166
                    ],
                    [
                        15.239699, -4.318851
                    ],
                    [
                        15.434228, -4.256396
                    ],
                    [
                        15.522292, -4.087532
                    ],
                    [
                        15.591958, -4.030293
                    ],
                    [
                        15.891283, -3.94687
                    ],
                    [
                        16.215416, -3.215429
                    ],
                    [
                        16.172208, -2.201172
                    ],
                    [
                        17.014779, -1.078223
                    ],
                    [
                        17.653704, -0.620876
                    ],
                    [
                        17.754327,
                        0.083472
                    ],
                    [
                        17.955573,
                        0.410494
                    ],
                    [
                        17.842372,
                        0.989031
                    ],
                    [
                        18.068774,
                        1.630333
                    ],
                    [
                        18.119086,
                        2.27143
                    ],
                    [
                        18.609623,
                        3.188564
                    ],
                    [
                        18.584468,
                        3.753528
                    ],
                    [
                        18.634779,
                        4.04215
                    ],
                    [
                        18.57189,
                        4.318127
                    ],
                    [
                        19.188206,
                        4.995087
                    ],
                    [
                        19.565543,
                        5.132904
                    ],
                    [
                        20.068659,
                        4.919902
                    ],
                    [
                        20.445995,
                        4.656689
                    ],
                    [
                        20.559196,
                        4.418458
                    ],
                    [
                        21.07489,
                        4.355753
                    ],
                    [
                        21.993075,
                        4.24287
                    ],
                    [
                        22.320101,
                        4.167606
                    ],
                    [
                        22.508769,
                        4.267957
                    ],
                    [
                        22.936417,
                        4.832176
                    ],
                    [
                        23.414377,
                        4.644152
                    ],
                    [
                        24.068427,
                        4.907371
                    ],
                    [
                        24.470919,
                        5.082792
                    ],
                    [
                        24.697321,
                        4.970027
                    ],
                    [
                        25.30106,
                        5.095321
                    ],
                    [
                        25.401683,
                        5.29574
                    ],
                    [
                        25.628085,
                        5.358358
                    ],
                    [
                        25.879643,
                        5.245641
                    ],
                    [
                        26.206668,
                        5.283215
                    ],
                    [
                        26.533693,
                        5.095321
                    ],
                    [
                        27.15001,
                        5.195538
                    ],
                    [
                        27.376412,
                        5.120376
                    ],
                    [
                        27.527346,
                        4.869774
                    ],
                    [
                        27.967572,
                        4.531314
                    ],
                    [
                        28.998959,
                        4.443539
                    ],
                    [
                        29.401452,
                        4.493697
                    ],
                    [
                        29.678165,
                        4.656689
                    ],
                    [
                        29.8291,
                        4.581466
                    ],
                    [
                        30.030346,
                        4.217783
                    ],
                    [
                        30.810175,
                        3.640563
                    ],
                    [
                        30.923376,
                        3.439701
                    ],
                    [
                        30.785019,
                        3.088092
                    ],
                    [
                        30.885643,
                        2.874557
                    ],
                    [
                        30.72213,
                        2.472504
                    ],
                    [
                        31.313291,
                        2.145744
                    ],
                    [
                        30.420261,
                        1.215391
                    ],
                    [
                        30.193859,
                        1.077062
                    ],
                    [
                        30.105813,
                        0.787809
                    ],
                    [
                        29.715899, -0.130351
                    ],
                    [
                        29.577542, -1.362855
                    ],
                    [
                        29.338562, -1.513742
                    ],
                    [
                        29.099582, -1.878341
                    ],
                    [
                        29.099582, -2.242863
                    ],
                    [
                        28.885758, -2.381107
                    ],
                    [
                        28.885758, -2.619859
                    ],
                    [
                        29.225361, -3.059544
                    ],
                    [
                        29.303262, -3.888626
                    ],
                    [
                        29.454504, -4.391449
                    ],
                    [
                        29.278055, -4.919048
                    ],
                    [
                        29.580539, -5.621856
                    ],
                    [
                        29.530125, -6.148412
                    ],
                    [
                        29.756988, -6.674446
                    ],
                    [
                        30.210714, -6.999807
                    ],
                    [
                        30.538406, -7.724779
                    ],
                    [
                        30.765269, -8.273935
                    ],
                    [
                        28.899949, -8.423574
                    ],
                    [
                        28.899949, -8.747593
                    ],
                    [
                        28.496637, -9.295285
                    ],
                    [
                        28.673086, -10.536782
                    ],
                    [
                        28.345395, -11.674571
                    ],
                    [
                        29.252848, -12.414129
                    ],
                    [
                        29.807402, -12.192476
                    ],
                    [
                        29.756988, -13.445964
                    ],
                    [
                        29.378883, -13.249755
                    ],
                    [
                        29.025985, -13.372404
                    ],
                    [
                        28.244567, -12.438745
                    ],
                    [
                        27.337114, -12.093904
                    ],
                    [
                        27.236286, -11.699255
                    ],
                    [
                        26.959009, -11.723937
                    ],
                    [
                        26.480076, -11.970638
                    ],
                    [
                        25.572623, -11.649884
                    ],
                    [
                        25.244932, -11.501718
                    ],
                    [
                        25.34576, -11.229879
                    ],
                    [
                        24.539136, -11.452312
                    ],
                    [
                        24.236651, -11.304043
                    ],
                    [
                        24.287065, -11.056757
                    ],
                    [
                        23.833339, -10.908284
                    ],
                    [
                        22.699023, -11.032016
                    ],
                    [
                        22.295711, -11.155696
                    ],
                    [
                        22.295711, -10.710206
                    ],
                    [
                        22.119262, -10.090388
                    ],
                    [
                        21.867192, -9.32016
                    ],
                    [
                        21.917606, -8.149191
                    ],
                    [
                        21.791571, -7.774732
                    ],
                    [
                        21.816778, -7.32494
                    ],
                    [
                        20.556427, -7.299938
                    ],
                    [
                        20.632048, -6.874694
                    ],
                    [
                        19.548146, -7.074858
                    ],
                    [
                        19.422111, -8.04937
                    ],
                    [
                        17.607206, -8.04937
                    ],
                    [
                        16.876203, -6.949766
                    ],
                    [
                        16.47289, -5.822507
                    ],
                    [
                        13.170771, -5.872659
                    ],
                    [
                        12.437049, -6.05252
                    ],
                    [
                        12.207808, -5.778218
                    ]
                ]
            ],
            "type": "Polygon"
        }
    }]
};

// dictionary of all slides
var years = {
    "intro": {
        "i": 0,
        "url": "https://en.wikipedia.org/wiki/2016_Summer_Olympics#/media/File:2016_Summer_Olympics_opening_ceremony_1035301-05082016-_v9a2048_04.08.16.jpg",
        "heading": ["Team Refugee", "Rio 2016"],
        "caption": "Wikipedia /Agência Brasil",
        "text": "According to <a href='http://www.unhcr.org/uk/figures-at-a-glance.html'>UNHCR</a>, we are now witnessing the highest levels of displacement on record. There are more than <strong>21 million refugees</strong> scattered across the world.</p><p><strong>Meet twelve of them here</strong>: the refugee teams of the 2016 Summer Olympics and Paralympics.</p><br><p class='ps'>Scroll down to learn the stories of these refugee Olympians and hover over a line on the map to see details of their journeys.</p>",
        "paths": [
            [],
            [12],
            [13],
            [],
            [14, 15],
            [],
            [16, 17],
            [],
            [18],
            [],
            [19],
            [],
            [20],
            [],
            [21, 22, 23, 24],
            [25],
            [26],
            [],
            [27, 28, 29, 31, 32, 33],
            [30, 34],
            [],
            [35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
            [],
            [45, 46]
        ],
        "locations": [
            ["Bukavu area"],
            ["Kinshasa"],
            [],
            ["South Sudan"],
            ["Kakuma refugee camp"],
            ["Nasir"],
            [],
            ["Bentiu"],
            [],
            ["Aleppo"],
            ["Istanbul"],
            ["Ethiopia"],
            ["Luxembourg"],
            ["Deir ez-Zor"],
            ["Turkey", "Nairobi", "Rio"],
            ["Samos Island"],
            ["Athens"],
            ["Damascus"],
            ["Istanbul", "Lesbos Island"],
            ["Gent", "Berlin"],
            [],
            [],
            ["Iran", "USA"],
            []
        ],
        "center": [-34.25101668854893, 24.006689383052304],
        "zoom": 1.5,
        "bounds":[[-99.7271739343309,-53.92925094590435],[64.17503977479461,73.29371813020106]]
    },
    "y2001": {
        "i": 2,
        "url": "https://en.wikipedia.org/wiki/Allied_Democratic_Forces_insurgency#/media/File:Joint_MONUSCO-FARDC_operation_against_ADF_in_Beni_(13246946614).jpg",
        "heading": ["1998, 2001", "DR Congo"],
        "caption": "Wikipedia ©MONUSCO/Sylvain Liechti",
        "text": "At the age of 11, Yolande Mabika was rescued from the Congolese rainforest in 1998; the same year that Yusra Mardini, the youngest on the team, was born in Damascus.</p><p>In Kinshasa, Yolande took up judo at a center for displaced children. She was later joined by her teammate Popole Misenga who was also evacuated from the Bukavu area to the capital in 2001.",
        "year": 1998,
        "locations": [
            ["Bukavu area"],
            ["Kinshasa"]
        ],
        "paths": [
            [],
            [12, 13]
        ],
        "center": [19.840311121252284, -3.118798547442708],
        "zoom": 4,
        "country": "DR Congo",
        "bounds":[[9.522809266122636,-16.99762529164606],[32.69663520951832,11.197090064950672]]
    },
    "y2013": {
        "i": 3,
        "url": "https://pt.wikipedia.org/wiki/Penha_(bairro_do_Rio_de_Janeiro)#/media/File:Plano_Inclinado_da_Igreja_da_Penha.jpg",
        "heading": ["2013", "Rio de Janeiro"],
        "caption": "Wikipedia /Halley Pacheco de Oliveira",
        "text": "Popole and Yolande escaped mistreatment while competing at the 2013 World Judo Championship in the Rio and have lived in the city ever since.</p><p>Before joining the Rio judo school, Instituto Reação, Popole worked as a truck unloader, and Yolande worked in a textile factory.",
        "year": 2013,
        "locations": [
            ["Rio"]
        ],
        "paths": [
            [23, 24]
        ],
        "center": [-17.54580351854412, -7.756034842332625],
        "zoom": 2.5,
        "country": "DR Congo",
        "bounds":[[-50.390257520300736,-41.13576775823875],[34.216230601809855,50.64894080309497]]
    },
    "y2006": {
        "i": 4,
        "url": "https://www.flickr.com/photos/tomanddonna/22772257811/",
        "heading": ["2002-2006", "South Sudan"],
        "caption": "Flickr /tom albinson",
        "text": "In 2002, Anjelina Lohalith and Rose Lokonyen fled violence in South Sudan to the Kakuma refugee camp in Kenya. James Chiengjiek and Yiech Biel arrived in 2005, and Paulo Lokoro in 2006. Several of them began running while attending school there.</p><p>Today, with the South Sudanese Civil War ongoing, Kakuma is still home to <a href='http://www.africanews.com/2016/06/17/unhcr-expanding-kenya-s-kakuma-refugee-camp/'> nearly 200,000 refugees</a>.",
        "year": 2002,
        "locations": [
            ["South Sudan"],
            ["Kakuma refugee camp"],
            ["Nasir"],
            [],
            ["Bentiu"],
            []
        ],
        "paths": [
            [],
            [14, 15],
            [],
            [16, 17],
            [],
            [18]
        ],
        "center": [31.174520349433976, 5.807379854342258],
        "zoom": 4,
        "country": "South Sudan",
        "bounds":[[22.97034125787269,-1.9133698461875355],[37.15657301477219,15.358932507822573]]
    },
    "y2015": {
        "i": 5,
        "url": "https://www.flickr.com/photos/familymwr/5112333179/in/photolist-8ML3xv-9R4Cu3-ngsmEn-9R56kU-pD8zsQ-9R5BwA-9R5ZfA-9R4Suo-3K4ECx-9R5ACY-9R1Z1F-9R5DA9-9R2kZr-9R61GQ-9R1LkB-9R4BtW-9R32rP-9R2FKz-8MP9mL-8MLbRP-8MP85Q-8MPgfb-8MPgu5-9R5BHW-9R387z-9R4jnm-3K9Tvm-9R4ydy-9R5A73-9R3fCT-9R2yJa-9R1GYc-9R1Xvr-9R344p-9R2H5z-9R5CAd-9R33PB-9R5VqQ-9R2Kin-aAMtPX-9R2GR4-9R31Hk-9R5UDm-8MLdsx-8MP3gq-8ML9yT-8MLdKc-8MPhFh-8ML8ne-9R2xsc",
        "heading": ["2013, 2015", "Kenya"],
        "caption": "Flickr /U.S. Army",
        "text": "<a href='https://en.wikipedia.org/wiki/Tegla_Loroupe_Peace_Foundation'>The Tegla Loroupe Foundation</a> selected all five South Sudanese runners from the Kakuma refugee camp.</p><p>Based in Nairobi, Tegla Loroupe, a Kenyan world champion marathon runner, founded the foundation.</p>",
        "year": 2015,
        "locations": [
            ["Nairobi"]
        ],
        "paths": [
            [22, 27, 28, 31, 32]
        ],
        "center": [31.174520349433976, 5.807379854342258],
        "zoom": 4,
        "country": "South Sudan",
        "bounds":[[28.375876027792827,-4.205103386003088],[41.75715643957622,12.16787610156932]]
    },
    "y2012": {
        "i": 6,
        "url": "https://www.flickr.com/photos/flavouz/5659055020",
        "heading": ["2012", "Luxembourg"],
        "caption": "Flickr /Flavio Ensiki",
        "text": "Yonas Kinde left Ethiopia in 2012 and sought international protection in Luxembourg.</p><p>There, in addition to his training, the marathon runner also takes French lessons and works as a taxi driver.",
        "year": 2012,
        "locations": [
            ["Ethiopia"],
            ["Luxembourg"]
        ],
        "paths": [
            [],
            [20]
        ],
        "center": [24.582505499832337, 30.399731418928667],
        "zoom": 3,
        "country": "Ethiopia",
        "bounds":[[2.210162721740545,4.257093546761084],[47.091375782774094,51.01216846838736]]
    },
    "y2011": {
        "i": 7,
        "url": "https://www.flickr.com/photos/edbrambley/4262339430/",
        "heading": ["2011", "Syria"],
        "caption": "Flickr /Ed Brambley",
        "text": "In 2011 Rami Anis fled Aleppo to live with his brother in Istanbul.</p><p>The largest city in Syria and a World Heritage Site, <a href='https://en.wikipedia.org/wiki/Aleppo'>Aleppo</a> is one of the worst affected cities in the country's ongoing civil war.",
        "year": 2011,
        "locations": [
            ["Aleppo"],
            ["Istanbul"]
        ],
        "paths": [
            [],
            [19]
        ],
        "center": [32.788566373906974, 37.02931669350551],
        "zoom": 4,
        "country": "Syria",
        "bounds":[[23.08307663720771,28.017107678426356],[43.43088084159581,47.59024606412248]]
    },
    "y2014": {
        "i": 8,
        "url": "https://commons.wikimedia.org/wiki/File:Women_and_children_among_Syrian_refugees_striking_at_the_platform_of_Budapest_Keleti_railway_station._Refugee_crisis._Budapest,_Hungary,_Central_Europe,_4_September_2015.jpg",
        "heading": ["2014", "Eurasia"],
        "caption": "Wikipedia /Mstyslav Chernov",
        "text": "Ibrahim Al Hussein from Syria lost a leg to a bombing in 2013. Shortly after that, he left the country for Turkey seeking better medical treatment and later traveled to Greece on a rubber dinghy in 2014. </p><p>Al Hussein was also honored by carrying the Rio 2016 Olympic torch in Athens, an important stop for hundreds of thousands of refugees upon arrival in Europe.",
        "year": 2014,
        "locations": [
            ["Deir ez-Zor"],
            ["Turkey"],
            ["Samos Island"],
            ["Athens"]
        ],
        "paths": [
            [],
            [21],
            [25],
            [26]
        ],
        "center": [32.788566373906974, 37.02931669350551],
        "zoom": 4,
        "country": "Syria",
        "bounds":[[23.08307663720771,28.017107678426356],[43.43088084159581,47.59024606412248]]
    },
    "z2015": {
        "i": 9,
        "url": "https://en.wikipedia.org/wiki/European_migrant_crisis#/media/File:20151030_Syrians_and_Iraq_refugees_arrive_at_Skala_Sykamias_Lesvos_Greece_2.jpg",
        "heading": ["2015", "Eurasia"],
        "caption": "Wikipedia /Ggia",
        "text": "Yusra Mardini, with two other swimmers, <a href='https://en.wikipedia.org/wiki/Yusra_Mardini'>pushed a dinghy boat</a> with 17 people for over three hours until it reached the Greek island of Lesbos.</p><p>In 2015 Yusra, Rami Anis and 1,015,076 other refugees and immigrants <a href='http://data.unhcr.org/mediterranean/regional.php'> arrived in Europe by sea</a>.",
        "year": 2015,
        "locations": [
            ["Damascus"],
            ["Lesbos Island"],
            ["Gent", "Berlin"]
        ],
        "paths": [
            [],
            [29, 33],
            [30, 34]
        ],
        "center": [22.599532372893407, 43.31880161663574],
        "zoom": 3.5,
        "country": "Syria",
        "bounds":[[1.878276751335477,21.438282320837075],[43.5145065071936,58.85326032509562]]
    },
    // "x9999": {
    //     "i": 10,
    //     "url": "https://www.iaaf.org/news/preview/beijing-2015-discus-perkovic-caballero-perez",
    //     "heading": ["One day", "Iran"],
    //     "caption": "Iran",
    //     "text": "Born in Iran, Shahrad Nasajpour has chosen to keep her story private.</a>.",
    //     "year": 2015,
    //     "locations": [["USA"]],
    //     "paths": [
    //         [47]
    //     ],
    //     "center": [22.599532372893407,43.31880161663574],
    //     "zoom":3.5,
    //     "country": "Iran"
    // },
    "y2016": {
        "i": 11,
        "url": "https://www.flickr.com/photos/aibaboxing/28451200224/",
        "heading": ["2016", "Olympics"],
        "caption": "Flickr /Boxing AIBA",
        "text": "James Chiengjiek, Paulo Lokoro, Anjelina Lohalith, Yiech Biel, and Rose Lokonyen of South Sudan, Yonas Kinde of Ethiopia, Rami Anis and Yusra Mardini of Syria, and Popole Misenga and Yolande Mabika of the Democratic Republic of Congo competed together as a team at the 2016 Rio games. </p><p>They received a standing ovation when they marched onto the stage at the opening ceremony, united under the Olympic flag.",
        "year": 2016,
        "locations": [
            []
        ],
        "paths": [
            [35, 36, 37, 38, 39, 40, 41, 42, 43, 44]
        ],
        "center": [-26.688105312872636, 17.813788180020282],
        "zoom": 1.5,
        "bounds":[[-47.17951725025449,-38.68673733842083],[51.6635708773689,62.02661037829543]]
    },
    "z2016": {
        "i": 12,
        "url": "https://www.flickr.com/photos/piviso/29425416472",
        "heading": ["2016", "Paralympics"],
        "caption": "Flickr /piviso.com",
        "text": ["Syrian swimmer Ibrahim Al Hussein and Iranian-born discus thrower Shahrad Nasajpour formed the first refugee team at the Rio 2016 Paralympics. Shahrad Nasajpour now lives in the USA.<br><br>"],
        "year": 2016,
        "locations": [
            ["USA", "Iran"],
            []
        ],
        "paths": [
            [],
            [45, 46]
        ],
        "center": [-26.688105312872636, 17.813788180020282],
        "zoom": 1.5,
        "bounds": [[-99.7271739343309,-53.92925094590435],[64.17503977479461,73.29371813020106]]
    }
};
var idActive = "intro";
// all athletes
var people = {
    "yonas": {
        "athlete": "Yonas Kinde",
        "countryofOrigin": "Ethiopia",
        "hostNOC": "Luxembourg",
        "sport": "Athletics",
        "id": "yonas",
        "birthplace": "Ethiopia",
        "stops": "[\"Luxembourg\"]",
        "paths": "[\"E1\", \"E2\"]",
        "year": 1980,
        "round": 1
    },
    "yolande": {
        "athlete": "Yolande Mabika",
        "countryofOrigin": "DR Congo",
        "hostNOC": "Brazil",
        "sport": "Judo",
        "id": "yolande",
        "birthplace": "Bukavu area",
        "stops": "[\"Kinshasa\",\"Brás de Pina, Rio\"]",
        "paths": "[\"DRC1\", \"DRC2\", \"DRC3\"]",
        "year": 1987,
        "round": 1
    },
    "ibrahim": {
        "athlete": "Ibrahim Al Hussein",
        "countryofOrigin": "Syria",
        "hostNOC": "Greece",
        "sport": "Swimming (Paralympics)",
        "id": "ibrahim",
        "birthplace": "Deir ez-Zor",
        "stops": "[\"Samos Island\",\"Turkey\",\"Athens\"]",
        "paths": "[\"S8\",\"S9\",\"S10\",\"S11\"]",
        "year": 1988,
        "round": 1
    },
    "rami": {
        "athlete": "Rami Anis",
        "countryofOrigin": "Syria",
        "hostNOC": "Belgium",
        "sport": "Swimming",
        "id": "rami",
        "birthplace": "Aleppo",
        "stops": "[\"Istanbul\",\"Samos Island\",\"Gent\"]",
        "paths": "[\"S1\",\"S2\",\"S3\",\"S4\"]",
        "year": 1991,
        "round": 2
    },
    "popole": {
        "athlete": "Popole Misenga",
        "countryofOrigin": "DR Congo",
        "hostNOC": "Brazil",
        "sport": "Judo",
        "id": "popole",
        "birthplace": "Bukavu area",
        "stops": "[\"Kinshasa\",\"Brás de Pina, Rio\"]",
        "paths": "[\"DRC1\", \"DRC2\", \"DRC3\"]",
        "year": 1992,
        "round": 2
    },
    "james": {
        "athlete": "James Chiengjiek",
        "countryofOrigin": "South Sudan",
        "hostNOC": "Kenya",
        "sport": "Athletics",
        "id": "james",
        "birthplace": "Bentiu",
        "stops": "[\"Kakuma refugee camp\", \"Nairobi\"]",
        "paths": "[\"SS4\",\"SS2\",\"SS3\"]",
        "year": 1992,
        "round": 2
    },
    "paulo": {
        "athlete": "Paulo Lokoro",
        "countryofOrigin": "South Sudan",
        "hostNOC": "Kenya",
        "sport": "Athletics",
        "id": "paulo",
        "birthplace": "Nasir",
        "stops": "[\"Kakuma refugee camp\", \"Nairobi\"]",
        "paths": "[\"SS5\",\"SS2\",\"SS3\"]",
        "year": 1992,
        "round": 2
    },
    "anjelina": {
        "athlete": "Anjelina Lohalith",
        "countryofOrigin": "South Sudan",
        "hostNOC": "Kenya",
        "sport": "Athletics",
        "id": "anjelina",
        "birthplace": "South Sudan",
        "stops": "[\"Kakuma refugee camp\", \"Nairobi\"]",
        "paths": "[\"SS1\",\"SS2\",\"SS3\"]",
        "year": 1993,
        "round": 2
    },
    "yiech": {
        "athlete": "Yiech Biel",
        "countryofOrigin": "South Sudan",
        "hostNOC": "Kenya",
        "sport": "Athletics",
        "id": "yiech",
        "birthplace": "Nasir",
        "stops": "[\"Kakuma refugee camp\", \"Nairobi\"]",
        "paths": "[\"SS5\",\"SS2\",\"SS3\"]",
        "year": 1995,
        "round": 3
    },
    "rose": {
        "athlete": "Rose Lokonyen",
        "countryofOrigin": "South Sudan",
        "hostNOC": "Kenya",
        "sport": "Athletics",
        "id": "rose",
        "birthplace": "South Sudan",
        "stops": "[\"Kakuma refugee camp\", \"Nairobi\"]",
        "paths": "[\"SS1\",\"SS2\",\"SS3\"]",
        "year": 1995,
        "round": 3
    },
    "yusra": {
        "athlete": "Yusra Mardini",
        "countryofOrigin": "Syria",
        "hostNOC": "Germany",
        "sport": "Swimming",
        "id": "yusra",
        "birthplace": "Damascus",
        "stops": "[\"Lesbos Island\",\"Berlin\"]",
        "paths": "[\"S5\",\"S6\",\"S7\"]",
        "year": 1998,
        "round": 3
    },
    "shahrad": {
        "athlete": "Shahrad Nasajpour",
        "countryofOrigin": "Iran",
        "hostNOC": "USA",
        "sport": "Athletics (Paralympics)",
        "id": "shahrad",
        "birthplace": "Iran",
        "stops": "[]",
        "paths": "[]",
        "year": 9999,
        "round": 3
    }
};
var colors = {
    "DR Congo": "#732343",
    "Iran": "#C03844",
    "Syria": "#d18518",
    "Ethiopia": "#3D5E29",
    "South Sudan": "#2F7F7C"
};

// how many slices for each line?
var segmentNumber = 50;
// all arcs derived from timeline2+locations
var arcs = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [28.859884, -2.507307],
                [28.58939564376436, -2.545383866800597],
                [28.3188913169123, -2.5834040759655617],
                [28.04837080392724, -2.6213667766462705],
                [27.777833890684576, -2.6592711190783405],
                [27.50728036447059, -2.697116254598565],
                [27.23671001400133, -2.7349013356618834],
                [26.966122629441294, -2.772625515858358],
                [26.695518002422116, -2.8102879499301703],
                [26.424895926061073, -2.8478877937886464],
                [26.154256194979475, -2.8854242045312875],
                [25.883598605321016, -2.922896340458828],
                [25.612922954769942, -2.960303361092311],
                [25.342229042569173, -2.9976444271901803],
                [25.071516669538248, -3.034918700765391],
                [24.800785638091202, -3.0721253451025468],
                [24.53003575225432, -3.109263524775042],
                [24.25926681768374, -3.146332405662238],
                [23.988478641682995, -3.1833311549666443],
                [23.71767103322036, -3.2202589412311333],
                [23.44684380294616, -3.257114934356159],
                [23.175996763209884, -3.293898305617005],
                [22.905129728077217, -3.3306082276810467],
                [22.63424251334692, -3.367243874625035],
                [22.3633349365676, -3.403804421952395],
                [22.092406817054343, -3.440289046610545],
                [21.821457975905197, -3.4766969270082377],
                [21.550488236017582, -3.5130272430329113],
                [21.279497422104455, -3.5492791760680675],
                [21.00848536071049, -3.5854519090106622],
                [20.737451880227972, -3.621544626288515],
                [20.466396810912656, -3.6575565138777426],
                [20.195319984899427, -3.6934867593201974],
                [19.924221236217857, -3.7293345517409358],
                [19.653100400807592, -3.765099081865701],
                [19.381957316533594, -3.8007795420384136],
                [19.110791823201268, -3.8363751262386967],
                [18.839603762571397, -3.871885030099398],
                [18.568392978374963, -3.9073084509241456],
                [18.297159316327793, -3.9426445877049128],
                [18.02590262414508, -3.9778926411395945],
                [17.754622751555708, -4.013051813649607],
                [17.48331955031646, -4.048121309397502],
                [17.211992874226077, -4.083100334304595],
                [16.940642579139105, -4.117988096068599],
                [16.66926852297962, -4.1527838041813006],
                [16.39787056575481, -4.187486669946217],
                [16.126448569568357, -4.22209590649629],
                [15.855002398633651, -4.256610728811583],
                [15.583531919286905, -4.291030353736995],
                [15.312037, -4.325354]
            ]
        },
        "properties": {
            "eventID": 12,
            "name": "Yolande Mabika",
            "year": 1998,
            "event": "was evacuated to Kinshasa the capital at the age of 11.",
            "eventShort": "left home",
            "lineID": "DRC1",
            "id": "yolande",
            "start": "Bukavu area",
            "end": "Kinshasa",
            "zoom": "congo",
            "homeCountry": "DR Congo"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [28.859884, -2.507307],
                [28.58939564376436, -2.545383866800597],
                [28.3188913169123, -2.5834040759655617],
                [28.04837080392724, -2.6213667766462705],
                [27.777833890684576, -2.6592711190783405],
                [27.50728036447059, -2.697116254598565],
                [27.23671001400133, -2.7349013356618834],
                [26.966122629441294, -2.772625515858358],
                [26.695518002422116, -2.8102879499301703],
                [26.424895926061073, -2.8478877937886464],
                [26.154256194979475, -2.8854242045312875],
                [25.883598605321016, -2.922896340458828],
                [25.612922954769942, -2.960303361092311],
                [25.342229042569173, -2.9976444271901803],
                [25.071516669538248, -3.034918700765391],
                [24.800785638091202, -3.0721253451025468],
                [24.53003575225432, -3.109263524775042],
                [24.25926681768374, -3.146332405662238],
                [23.988478641682995, -3.1833311549666443],
                [23.71767103322036, -3.2202589412311333],
                [23.44684380294616, -3.257114934356159],
                [23.175996763209884, -3.293898305617005],
                [22.905129728077217, -3.3306082276810467],
                [22.63424251334692, -3.367243874625035],
                [22.3633349365676, -3.403804421952395],
                [22.092406817054343, -3.440289046610545],
                [21.821457975905197, -3.4766969270082377],
                [21.550488236017582, -3.5130272430329113],
                [21.279497422104455, -3.5492791760680675],
                [21.00848536071049, -3.5854519090106622],
                [20.737451880227972, -3.621544626288515],
                [20.466396810912656, -3.6575565138777426],
                [20.195319984899427, -3.6934867593201974],
                [19.924221236217857, -3.7293345517409358],
                [19.653100400807592, -3.765099081865701],
                [19.381957316533594, -3.8007795420384136],
                [19.110791823201268, -3.8363751262386967],
                [18.839603762571397, -3.871885030099398],
                [18.568392978374963, -3.9073084509241456],
                [18.297159316327793, -3.9426445877049128],
                [18.02590262414508, -3.9778926411395945],
                [17.754622751555708, -4.013051813649607],
                [17.48331955031646, -4.048121309397502],
                [17.211992874226077, -4.083100334304595],
                [16.940642579139105, -4.117988096068599],
                [16.66926852297962, -4.1527838041813006],
                [16.39787056575481, -4.187486669946217],
                [16.126448569568357, -4.22209590649629],
                [15.855002398633651, -4.256610728811583],
                [15.583531919286905, -4.291030353736995],
                [15.312037, -4.325354]
            ]
        },
        "properties": {
            "eventID": 13,
            "name": "Popole Misenga",
            "year": 2001,
            "event": "was evacuated to Kinshasa, the capital, at the age of 11.",
            "eventShort": "left home",
            "lineID": "DRC1",
            "id": "popole",
            "start": "Bukavu area",
            "end": "Kinshasa",
            "zoom": "congo",
            "homeCountry": "DR Congo"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [30.604206, 6.883792],
                [30.689115412595743, 6.821503457022328],
                [30.774002740928587, 6.75920007787889],
                [30.858868189075285, 6.696882003151315],
                [30.943711961098547, 6.634549373312395],
                [31.028534261047035, 6.572202328727091],
                [31.113335292955224, 6.509841009653517],
                [31.19811526084336, 6.447465556243943],
                [31.282874368717376, 6.385076108545786],
                [31.36761282056885, 6.322672806502617],
                [31.45233082037494, 6.2602557899551465],
                [31.537028572098333, 6.197825198642233],
                [31.621706279687217, 6.135381172201875],
                [31.706364147075234, 6.0729238501722165],
                [31.791002378181442, 6.010453371992538],
                [31.875621176910304, 5.947969877004266],
                [31.96022074715166, 5.885473504451968],
                [32.04480129278071, 5.822964393484355],
                [32.12936301765803, 5.760442683155284],
                [32.21390612562952, 5.697908512424758],
                [32.29843082052645, 5.63536202015993],
                [32.38293730616545, 5.572803345136109],
                [32.46742578634852, 5.510232626037755],
                [32.55189646486304, 5.4476500014594915],
                [32.63634954548181, 5.3850556099071],
                [32.72078523196309, 5.32244958979854],
                [32.80520372805056, 5.259832079464936],
                [32.88960523747345, 5.1972032171515945],
                [32.973989963946515, 5.134563141019005],
                [33.05835811117013, 5.071911989143848],
                [33.14270988283029, 5.009249899519999],
                [33.227045482598704, 4.946577010059543],
                [33.31136511413284, 4.883893458593765],
                [33.39566898107599, 4.821199382874178],
                [33.47995728705735, 4.758494920573513],
                [33.56423023569207, 4.695780209286742],
                [33.64848803058136, 4.633055386532071],
                [33.732730875312555, 4.570320589751963],
                [33.81695897345918, 4.507575956314142],
                [33.9011725285811, 4.444821623512594],
                [33.98537174422456, 4.3820577285685935],
                [34.06955682392229, 4.319284408631694],
                [34.15372797119364, 4.256501800780755],
                [34.237885389544644, 4.193710042024946],
                [34.32202928246817, 4.13090926930475],
                [34.406159853443995, 4.0680996194929895],
                [34.490277305938946, 4.005281229395825],
                [34.57438184340702, 3.9424542357537717],
                [34.6584736692895, 3.8796187752427103],
                [34.74255298701507, 3.816774984474903],
                [34.82662, 3.753923]
            ]
        },
        "properties": {
            "eventID": 14,
            "name": "Anjelina Lohalith",
            "year": 2002,
            "event": "fled to Kakuma refugee camp in Kenya at the age of 9.",
            "eventShort": "left home",
            "lineID": "SS1",
            "id": "anjelina",
            "start": "South Sudan",
            "end": "Kakuma refugee camp",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [30.604206, 6.883792],
                [30.689115412595743, 6.821503457022328],
                [30.774002740928587, 6.75920007787889],
                [30.858868189075285, 6.696882003151315],
                [30.943711961098547, 6.634549373312395],
                [31.028534261047035, 6.572202328727091],
                [31.113335292955224, 6.509841009653517],
                [31.19811526084336, 6.447465556243943],
                [31.282874368717376, 6.385076108545786],
                [31.36761282056885, 6.322672806502617],
                [31.45233082037494, 6.2602557899551465],
                [31.537028572098333, 6.197825198642233],
                [31.621706279687217, 6.135381172201875],
                [31.706364147075234, 6.0729238501722165],
                [31.791002378181442, 6.010453371992538],
                [31.875621176910304, 5.947969877004266],
                [31.96022074715166, 5.885473504451968],
                [32.04480129278071, 5.822964393484355],
                [32.12936301765803, 5.760442683155284],
                [32.21390612562952, 5.697908512424758],
                [32.29843082052645, 5.63536202015993],
                [32.38293730616545, 5.572803345136109],
                [32.46742578634852, 5.510232626037755],
                [32.55189646486304, 5.4476500014594915],
                [32.63634954548181, 5.3850556099071],
                [32.72078523196309, 5.32244958979854],
                [32.80520372805056, 5.259832079464936],
                [32.88960523747345, 5.1972032171515945],
                [32.973989963946515, 5.134563141019005],
                [33.05835811117013, 5.071911989143848],
                [33.14270988283029, 5.009249899519999],
                [33.227045482598704, 4.946577010059543],
                [33.31136511413284, 4.883893458593765],
                [33.39566898107599, 4.821199382874178],
                [33.47995728705735, 4.758494920573513],
                [33.56423023569207, 4.695780209286742],
                [33.64848803058136, 4.633055386532071],
                [33.732730875312555, 4.570320589751963],
                [33.81695897345918, 4.507575956314142],
                [33.9011725285811, 4.444821623512594],
                [33.98537174422456, 4.3820577285685935],
                [34.06955682392229, 4.319284408631694],
                [34.15372797119364, 4.256501800780755],
                [34.237885389544644, 4.193710042024946],
                [34.32202928246817, 4.13090926930475],
                [34.406159853443995, 4.0680996194929895],
                [34.490277305938946, 4.005281229395825],
                [34.57438184340702, 3.9424542357537717],
                [34.6584736692895, 3.8796187752427103],
                [34.74255298701507, 3.816774984474903],
                [34.82662, 3.753923]
            ]
        },
        "properties": {
            "eventID": 15,
            "name": "Rose Lokonyen",
            "year": 2002,
            "event": "fled to Kakuma refugee camp at the age of 7.",
            "eventShort": "left home",
            "lineID": "SS1",
            "id": "rose",
            "start": "South Sudan",
            "end": "Kakuma refugee camp",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [33.062019, 8.622465],
                [33.09767156064094, 8.525158714864027],
                [33.133305972915444, 8.42784917894061],
                [33.16892245549529, 8.330536431505502],
                [33.20452122665377, 8.233220511759201],
                [33.24010250427078, 8.135901458827915],
                [33.27566650583795, 8.03857931176452],
                [33.31121344846357, 7.941254109549541],
                [33.34674354887774, 7.843925891092076],
                [33.382257023437326, 7.74659469523079],
                [33.41775408813096, 7.649260560734827],
                [33.453234958584034, 7.551923526304776],
                [33.48869985006364, 7.454583630573622],
                [33.52414897748358, 7.357240912107669],
                [33.55958255540922, 7.259895409407481],
                [33.59500079806248, 7.1625471609088285],
                [33.6304039193267, 7.065196204983607],
                [33.665792132751555, 6.96784257994077],
                [33.701165651557915, 6.8704863240272545],
                [33.73652468864269, 6.7731274754288995],
                [33.77186945658374, 6.675766072271376],
                [33.80720016764462, 6.578402152621085],
                [33.84251703377951, 6.481035754486092],
                [33.8778202666379, 6.383666915817025],
                [33.9131100775695, 6.286295674507982],
                [33.948386677628925, 6.188922068397447],
                [33.98365027758054, 6.091546135269188],
                [34.01890108790316, 5.99416791285315],
                [34.05413931879484, 5.896787438826367],
                [34.089365180177566, 5.7994047508138475],
                [34.124578881702, 5.702019886389472],
                [34.15978063275218, 5.604632883076879],
                [34.19497064245024, 5.507243778350362],
                [34.23014911966103, 5.409852609635747],
                [34.265316272996884, 5.312459414311283],
                [34.3004723108222, 5.215064229708519],
                [34.33561744125815, 5.1176670931131865],
                [34.3707518721873, 5.020268041766075],
                [34.405875811258234, 4.9228671128639085],
                [34.44098946589019, 4.825464343560218],
                [34.47609304327768, 4.7280597709662135],
                [34.51118675039507, 4.630653432151654],
                [34.54627079400121, 4.533245364145709],
                [34.58134538064395, 4.435835603937837],
                [34.616410716664824, 4.338424188478633],
                [34.651467008203504, 4.241011154680703],
                [34.68651446120243, 4.143596539419519],
                [34.72155328141133, 4.046180379534276],
                [34.756583674391784, 3.9487627118287483],
                [34.79160584552172, 3.851343573072157],
                [34.82662, 3.753923]
            ]
        },
        "properties": {
            "eventID": 16,
            "name": "James Chiengjiek",
            "year": 2005,
            "event": "fled to Kakuma refugee camp at the age of 13.",
            "eventShort": "left home",
            "lineID": "SS4",
            "id": "james",
            "start": "Nasir",
            "end": "Kakuma refugee camp",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [33.062019, 8.622465],
                [33.09767156064094, 8.525158714864027],
                [33.133305972915444, 8.42784917894061],
                [33.16892245549529, 8.330536431505502],
                [33.20452122665377, 8.233220511759201],
                [33.24010250427078, 8.135901458827915],
                [33.27566650583795, 8.03857931176452],
                [33.31121344846357, 7.941254109549541],
                [33.34674354887774, 7.843925891092076],
                [33.382257023437326, 7.74659469523079],
                [33.41775408813096, 7.649260560734827],
                [33.453234958584034, 7.551923526304776],
                [33.48869985006364, 7.454583630573622],
                [33.52414897748358, 7.357240912107669],
                [33.55958255540922, 7.259895409407481],
                [33.59500079806248, 7.1625471609088285],
                [33.6304039193267, 7.065196204983607],
                [33.665792132751555, 6.96784257994077],
                [33.701165651557915, 6.8704863240272545],
                [33.73652468864269, 6.7731274754288995],
                [33.77186945658374, 6.675766072271376],
                [33.80720016764462, 6.578402152621085],
                [33.84251703377951, 6.481035754486092],
                [33.8778202666379, 6.383666915817025],
                [33.9131100775695, 6.286295674507982],
                [33.948386677628925, 6.188922068397447],
                [33.98365027758054, 6.091546135269188],
                [34.01890108790316, 5.99416791285315],
                [34.05413931879484, 5.896787438826367],
                [34.089365180177566, 5.7994047508138475],
                [34.124578881702, 5.702019886389472],
                [34.15978063275218, 5.604632883076879],
                [34.19497064245024, 5.507243778350362],
                [34.23014911966103, 5.409852609635747],
                [34.265316272996884, 5.312459414311283],
                [34.3004723108222, 5.215064229708519],
                [34.33561744125815, 5.1176670931131865],
                [34.3707518721873, 5.020268041766075],
                [34.405875811258234, 4.9228671128639085],
                [34.44098946589019, 4.825464343560218],
                [34.47609304327768, 4.7280597709662135],
                [34.51118675039507, 4.630653432151654],
                [34.54627079400121, 4.533245364145709],
                [34.58134538064395, 4.435835603937837],
                [34.616410716664824, 4.338424188478633],
                [34.651467008203504, 4.241011154680703],
                [34.68651446120243, 4.143596539419519],
                [34.72155328141133, 4.046180379534276],
                [34.756583674391784, 3.9487627118287483],
                [34.79160584552172, 3.851343573072157],
                [34.82662, 3.753923]
            ]
        },
        "properties": {
            "eventID": 17,
            "name": "Yiech Biel",
            "year": 2005,
            "event": "fled to Kakuma refugee camp at the age of 10.",
            "eventShort": "left home",
            "lineID": "SS5",
            "id": "yiech",
            "start": "Nasir",
            "end": "Kakuma refugee camp",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [29.810942, 9.266912],
                [29.91248737796784, 9.15720592837313],
                [30.013970082900258, 9.047471598262465],
                [30.115390900689995, 8.93770937115611],
                [30.21675061615872, 8.827919607783985],
                [30.318050013069435, 8.718102668127734],
                [30.419289874138958, 8.608258911430624],
                [30.520470981050384, 8.498388696207432],
                [30.62159411446566, 8.388492380254279],
                [30.722660054038077, 8.278570320658476],
                [30.823669578424855, 8.168622873808308],
                [30.924623465299778, 8.058650395402841],
                [31.025522491365777, 7.9486532404616606],
                [31.12636743236759, 7.8386317633346145],
                [31.227159063104434, 7.728586317711545],
                [31.327898157442725, 7.618517256631956],
                [31.42858548832873, 7.5084249324947185],
                [31.52922182780138, 7.398309697067686],
                [31.629807947004988, 7.288171901497358],
                [31.730344616202046, 7.178011896318477],
                [31.83083260478602, 7.067830031463621],
                [31.931272681294185, 6.9576266562727715],
                [32.031665613420444, 6.847402119502874],
                [32.13201216802821, 6.737156769337361],
                [32.232313111163286, 6.626890953395671],
                [32.33256920806674, 6.516605018742742],
                [32.43278122318785, 6.4062993118984854],
                [32.532949920197005, 6.295974178847252],
                [32.63307606199868, 6.185629965047256],
                [32.73316041074438, 6.0752670154400175],
                [32.83320372784564, 5.964885674459755],
                [32.93320677398701, 5.854486286042777],
                [33.033170309139045, 5.744069193636853],
                [33.13309509257139, 5.633634740210575],
                [33.23298188286572, 5.52318326826269],
                [33.33283143792892, 5.412715119831424],
                [33.43264451500603, 5.302230636503792],
                [33.53242187069342, 5.191730159424894],
                [33.632164260951804, 5.081214029307188],
                [33.7318724411194, 4.9706825864397555],
                [33.831547165925, 4.860136170697547],
                [33.93118918950116, 4.749575121550628],
                [34.030799265397256, 4.638999778073386],
                [34.13037814659271, 4.528410478953748],
                [34.229926585510114, 4.417807562502373],
                [34.329445334028364, 4.307191366661835],
                [34.42893514349591, 4.196562229015785],
                [34.52839676474391, 4.085920486798122],
                [34.62783094809942, 3.9752664769021275],
                [34.72723844339862, 3.864600535889606],
                [34.82662, 3.753923]
            ]
        },
        "properties": {
            "eventID": 18,
            "name": "Paulo Lokoro",
            "year": 2006,
            "event": "fled to Kakuma refugee camp at the age of 14.",
            "eventShort": "left home",
            "lineID": "SS5",
            "id": "paulo",
            "start": "Bentiu",
            "end": "Kakuma refugee camp",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [37.18409, 36.201446],
                [37.03022716744309, 36.30294553785126],
                [36.87596371841417, 36.4042474168913],
                [36.72129790693791, 36.50535038672074],
                [36.566227988743684, 36.60625319039071],
                [36.41075222142884, 36.70695456438496],
                [36.25486886462504, 36.80745323860251],
                [36.09857618016759, 36.90774793634086],
                [35.94187243226778, 37.007837374279504],
                [35.784755887688355, 37.10772026246426],
                [35.627224815922034, 37.20739530429193],
                [35.46927748937319, 37.30686119649554],
                [35.31091218354272, 37.4061166291302],
                [35.15212717721605, 37.50516028555958],
                [34.992920752654385, 37.60399084244285],
                [34.83329119578923, 37.70260696972232],
                [34.673236796420134, 37.80100733061174],
                [34.51275584841581, 37.89919058158515],
                [34.35184664991847, 37.997155372366464],
                [34.19050750355171, 38.094900345919626],
                [34.02873671663151, 38.192424138439605],
                [33.866532601380904, 38.28972537934396],
                [33.70389347514793, 38.38680269126521],
                [33.5408176606271, 38.48365469004385],
                [33.377303486084294, 38.580279984722196],
                [33.21334928558527, 38.676677177539034],
                [33.04895339922758, 38.77284486392492],
                [32.884114173376155, 38.86878163249845],
                [32.71882996090237, 38.964486065063156],
                [32.55309912142677, 39.059956736605486],
                [32.38692002156542, 39.15519221529342],
                [32.22029103517982, 39.250191062476055],
                [32.053210543630584, 39.344951832684146],
                [31.885676936034688, 39.43947307363141],
                [31.71768860952651, 39.533753326216896],
                [31.549243969522543, 39.62779112452823],
                [31.380341429989787, 39.72158499584587],
                [31.210979413717975, 39.815133460648305],
                [31.041156352595497, 39.90843503261831],
                [30.870870687889113, 40.00148821865016],
                [30.700120870527435, 40.09429151885804],
                [30.52890536138824, 40.186843426585256],
                [30.357222631589533, 40.279142428414815],
                [30.18507116278447, 40.37118700418095],
                [30.0124494474601, 40.462975626981816],
                [29.839355989239877, 40.55450676319329],
                [29.6657893031901, 40.64577887248402],
                [29.49174791613009, 40.73679040783162],
                [29.3172303669463, 40.82753981554004],
                [29.142235206910197, 40.918025535258224],
                [28.966761, 41.008246]
            ]
        },
        "properties": {
            "eventID": 19,
            "name": "Rami Anis",
            "year": 2011,
            "event": "left Syria to live in Istanbul at the age of 20.",
            "eventShort": "left home",
            "lineID": "S1",
            "id": "rami",
            "start": "Aleppo",
            "end": "Istanbul",
            "zoom": "mediterranean",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [38.759098, 9.017082],
                [38.298984215670714, 9.881595676926409],
                [37.83644606538601, 10.745481373128614],
                [37.371254240528124, 11.608679167255193],
                [36.903175092125736, 12.471127867989974],
                [36.43197022775638, 13.33276489204966],
                [35.957396095698996, 14.193526137332638],
                [35.47920355524851, 15.053345850746137],
                [34.99713743208112, 15.912156490212736],
                [34.51093605753475, 16.769888580329866],
                [34.02033079064787, 17.626470561124705],
                [33.52504552177956, 18.481828629314435],
                [33.02479615661788, 19.335886571445304],
                [32.51929007937152, 20.188565588245897],
                [32.008225593934206, 21.039784109488316],
                [31.491291341813643, 21.889457598606548],
                [30.968165695629015, 22.737498346273643],
                [30.438516127006075, 23.583815252089025],
                [29.901998547738827, 24.42831359347331],
                [29.358256623146815, 25.270894780811247],
                [28.806921056638963, 26.11145609782373],
                [28.247608844606027, 26.949890426087077],
                [27.679922500907605, 27.7860859525526],
                [27.10344925040471, 28.61992585885176],
                [26.517760191221655, 29.451287991103218],
                [25.9224094257111, 30.28004450886723],
                [25.316933160454404, 31.106061511822443],
                [24.70084877606731, 31.929198642669764],
                [24.07365386811353, 32.74930866470068],
                [23.43482526107173, 33.566237012403306],
                [22.78381799807398, 34.3798213134222],
                [22.120064310056918, 35.189890880138975],
                [21.442972569065645, 35.99626616910532],
                [20.751926231752623, 36.79875820653949],
                [20.046282780650216, 37.5971679781001],
                [19.32537267260224, 38.39128578118003],
                [18.588498305855264, 39.18089053802845],
                [17.834933019777832, 39.96574906811713],
                [17.063920144042182, 40.7456153183304],
                [16.274672117418866, 41.52022954978732],
                [15.46636970015258, 42.289317480415896],
                [14.638161308262749, 43.05258938280786],
                [13.789162503098533, 43.809739137410126],
                [12.918455675127264, 44.560443241776305],
                [12.025089967291379, 45.30435977743687],
                [11.108081490366592, 46.04112733697609],
                [10.16641389060646, 46.77036391516296],
                [9.199039338556316, 47.49166576950542],
                [8.204880017210664, 48.204606257422164],
                [7.182830197574595, 48.90873465939309],
                [6.131759, 49.603575]
            ]
        },
        "properties": {
            "eventID": 20,
            "name": "Yonas Kinde",
            "year": 2012,
            "event": "left Ethiopia at the age of 32 and migrated to Luxembourg.",
            "eventShort": "left home",
            "lineID": "E1",
            "id": "yonas",
            "start": "Ethiopia",
            "end": "Luxembourg",
            "zoom": "overview",
            "homeCountry": "Ethiopia"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [15.312037, -4.325354],
                [14.223591484927132, -4.810392488411216],
                [13.133596839185255, -5.293700718215673],
                [12.04190044341849, -5.77510105702008],
                [10.948351210951179, -6.254415480397117],
                [9.852799747685198, -6.7314655472687495],
                [8.75509851659453, -7.206072378422565],
                [7.655102007100821, -7.678056638446976],
                [6.552666909585207, -8.147238521375272],
                [5.447652295260676, -8.613437740331973],
                [4.339919801594377, -9.076473521478308],
                [3.229333823431236, -9.53616460255662],
                [2.1157617099284702, -9.992329236335836],
                [0.9990739673653184, -10.444785199261576],
                [-0.1208555321575744, -10.893349805615575],
                [-1.244149336167651, -11.337839927488261],
                [-2.3709261915151307, -11.77807202086738],
                [-3.5013008184709706, -12.21386215814214],
                [-4.635383679451717, -12.645026067318149],
                [-5.7732807426652775, -13.071379178232007],
                [-6.91509324104529, -13.49273667604616],
                [-8.060917426919927, -13.908913562294233],
                [-9.210844322942362, -14.319724723734247],
                [-10.364959469895354, -14.724985009251752],
                [-11.523342672069903, -15.124509315036853],
                [-12.686067741009047, -15.518112678238037],
                [-13.85320223849968, -15.905610379271643],
                [-15.02480721978962, -16.286818052938415],
                [-16.20093697810116, -16.661551808467998],
                [-17.381638791606594, -17.029628358577884],
                [-18.566952674123836, -17.39086515759583],
                [-19.75691113088088, -17.745080548653338],
                [-20.951538920784532, -18.092093919913104],
                [-22.150852826711237, -18.431725869744977],
                [-23.35486143541355, -18.763798380713226],
                [-24.56356492870438, -19.088135002182966],
                [-25.776954887640287, -19.404561041295707],
                [-26.99501411147407, -19.712903762002938],
                [-28.217716453183233, -20.01299259178391],
                [-29.445026673404005, -20.304659335608243],
                [-30.676900314608186, -20.587738396637462],
                [-31.913283597351352, -20.8620670030919],
                [-33.15411334039382, -21.12748544064115],
                [-34.399316906450316, -21.383837289608767],
                [-35.6488121752572, -21.630969666214927],
                [-36.902507545560134, -21.86873346701579],
                [-38.16030196751499, -22.096983615636248],
                [-39.42208500686545, -22.31557931083351],
                [-40.68773694210732, -22.52438427487479],
                [-41.95712889567613, -22.72326700116282],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 23,
            "name": "Popole Misenga",
            "year": 2013,
            "event": "escaped mistreatment at the 2013 World Judo Championship in Rio.",
            "eventShort": "escaped",
            "lineID": "DRC2",
            "id": "popole",
            "start": "Kinshasa",
            "end": "Rio",
            "zoom": "rio",
            "homeCountry": "DR Congo"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [15.312037, -4.325354],
                [14.223591484927132, -4.810392488411216],
                [13.133596839185255, -5.293700718215673],
                [12.04190044341849, -5.77510105702008],
                [10.948351210951179, -6.254415480397117],
                [9.852799747685198, -6.7314655472687495],
                [8.75509851659453, -7.206072378422565],
                [7.655102007100821, -7.678056638446976],
                [6.552666909585207, -8.147238521375272],
                [5.447652295260676, -8.613437740331973],
                [4.339919801594377, -9.076473521478308],
                [3.229333823431236, -9.53616460255662],
                [2.1157617099284702, -9.992329236335836],
                [0.9990739673653184, -10.444785199261576],
                [-0.1208555321575744, -10.893349805615575],
                [-1.244149336167651, -11.337839927488261],
                [-2.3709261915151307, -11.77807202086738],
                [-3.5013008184709706, -12.21386215814214],
                [-4.635383679451717, -12.645026067318149],
                [-5.7732807426652775, -13.071379178232007],
                [-6.91509324104529, -13.49273667604616],
                [-8.060917426919927, -13.908913562294233],
                [-9.210844322942362, -14.319724723734247],
                [-10.364959469895354, -14.724985009251752],
                [-11.523342672069903, -15.124509315036853],
                [-12.686067741009047, -15.518112678238037],
                [-13.85320223849968, -15.905610379271643],
                [-15.02480721978962, -16.286818052938415],
                [-16.20093697810116, -16.661551808467998],
                [-17.381638791606594, -17.029628358577884],
                [-18.566952674123836, -17.39086515759583],
                [-19.75691113088088, -17.745080548653338],
                [-20.951538920784532, -18.092093919913104],
                [-22.150852826711237, -18.431725869744977],
                [-23.35486143541355, -18.763798380713226],
                [-24.56356492870438, -19.088135002182966],
                [-25.776954887640287, -19.404561041295707],
                [-26.99501411147407, -19.712903762002938],
                [-28.217716453183233, -20.01299259178391],
                [-29.445026673404005, -20.304659335608243],
                [-30.676900314608186, -20.587738396637462],
                [-31.913283597351352, -20.8620670030919],
                [-33.15411334039382, -21.12748544064115],
                [-34.399316906450316, -21.383837289608767],
                [-35.6488121752572, -21.630969666214927],
                [-36.902507545560134, -21.86873346701579],
                [-38.16030196751499, -22.096983615636248],
                [-39.42208500686545, -22.31557931083351],
                [-40.68773694210732, -22.52438427487479],
                [-41.95712889567613, -22.72326700116282],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 24,
            "name": "Yolande Mabika",
            "year": 2013,
            "event": "escaped mistreatment at the 2013 World Judo Championship in Rio.",
            "eventShort": "escaped",
            "lineID": "DRC2",
            "id": "yolande",
            "start": "Kinshasa",
            "end": "Rio",
            "zoom": "rio",
            "homeCountry": "DR Congo"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [34.82662, 3.753923],
                [34.86660924945893, 3.6532750724495604],
                [34.90658952959134, 3.552625370511737],
                [34.946561089928146, 3.4519739435808163],
                [34.986524179800824, 3.3513208410090884],
                [35.02647904834722, 3.2506661121080813],
                [35.066425944517256, 3.1500098061497543],
                [35.10636511707867, 3.049351972367713],
                [35.146296814622715, 2.948692659958416],
                [35.18622128556993, 2.8480319180823788],
                [35.226138778175795, 2.7473697958653798],
                [35.26604954053645, 2.6467063423996557],
                [35.305953820594404, 2.546041606745106],
                [35.34585186614421, 2.445375637930492],
                [35.38574392483812, 2.3447084849546354],
                [35.425630244191815, 2.244040196787604],
                [35.46551107159004, 2.143370822371916],
                [35.505386654292266, 2.0427004106237288],
                [35.54525723943836, 1.9420290104340314],
                [35.58512307405421, 1.841356670669834],
                [35.624984405057425, 1.7406834401753557],
                [35.66484147926294, 1.6400093677732137],
                [35.70469454338864, 1.5393345022656117],
                [35.74454384406105, 1.4386588924355241],
                [35.78438962782089, 1.3379825870478808],
                [35.82423214112879, 1.237305634850752],
                [35.864071630370816, 1.1366280845765324],
                [35.90390834186419, 1.0359499849431222],
                [35.9437425218628, 0.93527138465511],
                [35.983574416562924, 0.834592332404953],
                [36.023404272108756, 0.7339128768741585],
                [36.063232334598055, 0.6332330667344652],
                [36.10305885008774, 0.5325529506490189],
                [36.142884064599514, 0.4318725772735574],
                [36.182708224125435, 0.3311919952575832],
                [36.22253157463354, 0.23051125324554922],
                [36.262354362073474, 0.1298303998780296],
                [36.302176832382, 0.029149483792903077],
                [36.34199923148872, -0.07153144637347103],
                [36.38182180532159, -0.17221234198507382],
                [36.42164479981253, -0.27289315440505035],
                [36.46146846090307, -0.3735738349945302],
                [36.501293034549896, -0.4742543351114507],
                [36.54111876673048, -0.5749346061093765],
                [36.580945903448665, -0.6756145993363237],
                [36.62077469074031, -0.7762942661335812],
                [36.66060537467884, -0.8769735578345282],
                [36.70043820138087, -0.9776524257634585],
                [36.74027341701184, -1.078330821234398],
                [36.7801112677916, -1.179008695549928],
                [36.819952, -1.279686]
            ]
        },
        "properties": {
            "eventID": 22,
            "name": "James Chiengjiek",
            "year": 2013,
            "event": "was selected by Tegla Loroupe Foundation.",
            "eventShort": "became athlete",
            "lineID": "SS2",
            "id": "james",
            "start": "Kakuma refugee camp",
            "end": "Nairobi",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [40.257134, 35.307897],
                [40.160393064012595, 35.384993694141805],
                [40.06346712720649, 35.46201312670227],
                [39.96635549401503, 35.53895492917215],
                [39.8690574677125, 35.61581873144039],
                [39.77157235042681, 35.69260416178755],
                [39.67389944315257, 35.76931084687936],
                [39.57603804576447, 35.84593841176026],
                [39.47798745703078, 35.92248647984685],
                [39.37974697462737, 35.99895467292155],
                [39.28131589515185, 36.07534261112599],
                [39.182693514138066, 36.15164991295473],
                [39.08387912607094, 36.227876195248655],
                [38.98487202440152, 36.30402107318871],
                [38.88567150156241, 36.380084160289385],
                [38.786276848983555, 36.45606506839238],
                [38.686687357108156, 36.531963407660164],
                [38.58690231540915, 36.60777878656967],
                [38.4869210124058, 36.683510811905876],
                [38.38674273568077, 36.75915908875555],
                [38.2863667718974, 36.83472322050086],
                [38.185792406817434, 36.91020280881309],
                [38.085018925318984, 36.98559745364637],
                [37.98404561141489, 37.06090675323142],
                [37.88287174827143, 37.136130304069276],
                [37.781496618227315, 37.2112677009251],
                [37.67991950281317, 37.28631853682194],
                [37.5781396827712, 37.3612824030346],
                [37.47615643807532, 37.43615888908347],
                [37.37396904795167, 37.51094758272836],
                [37.2715767908994, 37.58564806996249],
                [37.16897894471196, 37.66025993500626],
                [37.06617478649858, 37.734782760301385],
                [36.96316359270636, 37.809216126504744],
                [36.85994463914254, 37.88355961248242],
                [36.75651720099728, 37.9578127953038],
                [36.65288055286678, 38.03197525023554],
                [36.54903396877684, 38.10604655073575],
                [36.444976722206704, 38.18002626844812],
                [36.34070808611351, 38.2539139731961],
                [36.23622733295693, 38.32770923297705],
                [36.13153373472439, 38.401411613956554],
                [36.02662656295662, 38.47502068046269],
                [35.92150508877362, 38.54853599498031],
                [35.81616858290109, 38.62195711814548],
                [35.7106163156973, 38.69528360873981],
                [35.604847557180314, 38.76851502368493],
                [35.49886157705574, 38.84165091803702],
                [35.392657644744894, 38.91469084498128],
                [35.286235029413334, 38.987634355826586],
                [35.179593, 39.060481]
            ]
        },
        "properties": {
            "eventID": 21,
            "name": "Ibrahim Al Hussein",
            "year": 2013,
            "event": "lost one leg to a bombing and fled Syria at 25.",
            "eventShort": "left home",
            "lineID": "S8",
            "id": "ibrahim",
            "start": "Deir ez-Zor",
            "end": "Turkey",
            "zoom": "mediterranean",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [35.179593, 39.060481],
                [35.01304274019571, 39.03909300420671],
                [34.84659383921772, 39.01746830529413],
                [34.68024727020454, 38.99560723049537],
                [34.51400400033969, 38.97351011007701],
                [34.34786499081071, 38.95117727731762],
                [34.18183119676899, 38.928609068486146],
                [34.0159035672902, 38.90580582282013],
                [33.85008304533567, 38.88276788250388],
                [33.684370567714424, 38.85949559264641],
                [33.518767065045985, 38.83598930125943],
                [33.353273461724044, 38.81224935923503],
                [33.187890675880766, 38.78827612032343],
                [33.02261961935195, 38.76406994111049],
                [32.85746119764298, 38.739631180995204],
                [32.69241630989545, 38.71496020216705],
                [32.52748584885468, 38.69005736958322],
                [32.3626707008379, 38.6649230509459],
                [32.1979717457033, 38.63955761667922],
                [32.03338985681976, 38.61396143990636],
                [31.868925901037446, 38.58813489642637],
                [31.704580738659086, 38.56207836469103],
                [31.5403552234121, 38.535792225781684],
                [31.376250202421435, 38.509276863385786],
                [31.21226651618322, 38.482532663773576],
                [31.04840499853915, 38.45556001577466],
                [30.884666476651653, 38.42835931075435],
                [30.721051770979837, 38.40093094259025],
                [30.557561695256183, 38.373275307648434],
                [30.39419705646399, 38.3453928047599],
                [30.23095865481563, 38.317283835196676],
                [30.0678472837315, 38.288948802648136],
                [29.904863729819766, 38.26038811319703],
                [29.74200877285687, 38.231602175295706],
                [29.57928318576875, 38.20259139974206],
                [29.41668773461286, 38.17335619965565],
                [29.254223178560906, 38.143896990453634],
                [29.091890269882317, 38.11421418982673],
                [28.929689753928503, 38.08430821771522],
                [28.767622369117788, 38.05417949628474],
                [28.605688846921154, 38.02382844990223],
                [28.44388991184863, 37.9932555051118],
                [28.282226281436504, 37.96246109061052],
                [28.12069866623519, 37.93144563722433],
                [27.959307769797828, 37.900209577883814],
                [27.79805428866965, 37.86875334759997],
                [27.636938912378003, 37.837077383440096],
                [27.475962323423108, 37.80518212450354],
                [27.31512519726953, 37.7730680118975],
                [27.154428202338348, 37.74073548871287],
                [26.993872, 37.708185]
            ]
        },
        "properties": {
            "eventID": 25,
            "name": "Ibrahim Al Hussein",
            "year": 2014,
            "event": "lived in Athens, Greece ever since.",
            "eventShort": "settled down",
            "lineID": "S10",
            "id": "ibrahim",
            "start": "Turkey",
            "end": "Samos Island",
            "zoom": "mediterranean",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [26.993872, 37.708185],
                [26.928807981040368, 37.714587981068455],
                [26.86373274710548, 37.72095520140031],
                [26.798646356540342, 37.727286646633786],
                [26.733548867788564, 37.7335823024811],
                [26.668440339391914, 37.73984215472869],
                [26.603320829989865, 37.746066189237304],
                [26.53819039831915, 37.75225439194215],
                [26.473049103213288, 37.758406748853034],
                [26.40789700360217, 37.76452324605452],
                [26.342734158511554, 37.77060386970605],
                [26.27756062706264, 37.776648606042066],
                [26.212376468471607, 37.78265744137218],
                [26.147181742049124, 37.78863036208126],
                [26.08197650719992, 37.79456735462964],
                [26.016760823422292, 37.80046840555318],
                [25.951534750307648, 37.806333501463435],
                [25.88629834754004, 37.81216262904779],
                [25.82105167489569, 37.817955775069585],
                [25.755794792242494, 37.82371292636825],
                [25.69052775953959, 37.829434069859424],
                [25.625250636836853, 37.8351191925351],
                [25.5599634842744, 37.84076828146375],
                [25.49466636208215, 37.84638132379046],
                [25.429359330579313, 37.85195830673706],
                [25.3640424501739, 37.857499217602225],
                [25.298715781362276, 37.86300404376162],
                [25.23337938472861, 37.868472772668056],
                [25.168033320944442, 37.87390539185157],
                [25.102677650768165, 37.87930188891957],
                [25.037312435044527, 37.88466225155694],
                [24.971937734704145, 37.88998646752623],
                [24.906553610763016, 37.89527452466769],
                [24.841160124321995, 37.90052641089944],
                [24.77575733656632, 37.905742114217574],
                [24.710345308765085, 37.91092162269632],
                [24.64492410227076, 37.91606492448814],
                [24.579493778518668, 37.921172007823785],
                [24.514054399026485, 37.926242861012526],
                [24.44860602539373, 37.93127747244218],
                [24.383148719301246, 37.93627583057931],
                [24.317682542510713, 37.94123792396923],
                [24.252207556864093, 37.94616374123625],
                [24.186723824283163, 37.95105327108368],
                [24.12123140676895, 37.95590650229401],
                [24.05573036640125, 37.96072342372906],
                [23.990220765338076, 37.96550402432993],
                [23.92470266581517, 37.97024829311731],
                [23.859176130145446, 37.97495621919148],
                [23.79364122071848, 37.97962779173243],
                [23.728098, 37.984263]
            ]
        },
        "properties": {
            "eventID": 26,
            "name": "Ibrahim Al Hussein",
            "year": 2014,
            "event": "reached Samos Island of Greece from Turkey on a dinghy boat.",
            "eventShort": "dinghy boat",
            "lineID": "S9",
            "id": "ibrahim",
            "start": "Samos Island",
            "end": "Athens",
            "zoom": "mediterranean",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [34.82662, 3.753923],
                [34.86660924945893, 3.6532750724495604],
                [34.90658952959134, 3.552625370511737],
                [34.946561089928146, 3.4519739435808163],
                [34.986524179800824, 3.3513208410090884],
                [35.02647904834722, 3.2506661121080813],
                [35.066425944517256, 3.1500098061497543],
                [35.10636511707867, 3.049351972367713],
                [35.146296814622715, 2.948692659958416],
                [35.18622128556993, 2.8480319180823788],
                [35.226138778175795, 2.7473697958653798],
                [35.26604954053645, 2.6467063423996557],
                [35.305953820594404, 2.546041606745106],
                [35.34585186614421, 2.445375637930492],
                [35.38574392483812, 2.3447084849546354],
                [35.425630244191815, 2.244040196787604],
                [35.46551107159004, 2.143370822371916],
                [35.505386654292266, 2.0427004106237288],
                [35.54525723943836, 1.9420290104340314],
                [35.58512307405421, 1.841356670669834],
                [35.624984405057425, 1.7406834401753557],
                [35.66484147926294, 1.6400093677732137],
                [35.70469454338864, 1.5393345022656117],
                [35.74454384406105, 1.4386588924355241],
                [35.78438962782089, 1.3379825870478808],
                [35.82423214112879, 1.237305634850752],
                [35.864071630370816, 1.1366280845765324],
                [35.90390834186419, 1.0359499849431222],
                [35.9437425218628, 0.93527138465511],
                [35.983574416562924, 0.834592332404953],
                [36.023404272108756, 0.7339128768741585],
                [36.063232334598055, 0.6332330667344652],
                [36.10305885008774, 0.5325529506490189],
                [36.142884064599514, 0.4318725772735574],
                [36.182708224125435, 0.3311919952575832],
                [36.22253157463354, 0.23051125324554922],
                [36.262354362073474, 0.1298303998780296],
                [36.302176832382, 0.029149483792903077],
                [36.34199923148872, -0.07153144637347103],
                [36.38182180532159, -0.17221234198507382],
                [36.42164479981253, -0.27289315440505035],
                [36.46146846090307, -0.3735738349945302],
                [36.501293034549896, -0.4742543351114507],
                [36.54111876673048, -0.5749346061093765],
                [36.580945903448665, -0.6756145993363237],
                [36.62077469074031, -0.7762942661335812],
                [36.66060537467884, -0.8769735578345282],
                [36.70043820138087, -0.9776524257634585],
                [36.74027341701184, -1.078330821234398],
                [36.7801112677916, -1.179008695549928],
                [36.819952, -1.279686]
            ]
        },
        "properties": {
            "eventID": 27,
            "name": "Anjelina Lohalith",
            "year": 2015,
            "event": "was selected by Tegla Loroupe Foundation.",
            "eventShort": "became athlete",
            "lineID": "SS2",
            "id": "anjelina",
            "start": "Kakuma refugee camp",
            "end": "Nairobi",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [34.82662, 3.753923],
                [34.86660924945893, 3.6532750724495604],
                [34.90658952959134, 3.552625370511737],
                [34.946561089928146, 3.4519739435808163],
                [34.986524179800824, 3.3513208410090884],
                [35.02647904834722, 3.2506661121080813],
                [35.066425944517256, 3.1500098061497543],
                [35.10636511707867, 3.049351972367713],
                [35.146296814622715, 2.948692659958416],
                [35.18622128556993, 2.8480319180823788],
                [35.226138778175795, 2.7473697958653798],
                [35.26604954053645, 2.6467063423996557],
                [35.305953820594404, 2.546041606745106],
                [35.34585186614421, 2.445375637930492],
                [35.38574392483812, 2.3447084849546354],
                [35.425630244191815, 2.244040196787604],
                [35.46551107159004, 2.143370822371916],
                [35.505386654292266, 2.0427004106237288],
                [35.54525723943836, 1.9420290104340314],
                [35.58512307405421, 1.841356670669834],
                [35.624984405057425, 1.7406834401753557],
                [35.66484147926294, 1.6400093677732137],
                [35.70469454338864, 1.5393345022656117],
                [35.74454384406105, 1.4386588924355241],
                [35.78438962782089, 1.3379825870478808],
                [35.82423214112879, 1.237305634850752],
                [35.864071630370816, 1.1366280845765324],
                [35.90390834186419, 1.0359499849431222],
                [35.9437425218628, 0.93527138465511],
                [35.983574416562924, 0.834592332404953],
                [36.023404272108756, 0.7339128768741585],
                [36.063232334598055, 0.6332330667344652],
                [36.10305885008774, 0.5325529506490189],
                [36.142884064599514, 0.4318725772735574],
                [36.182708224125435, 0.3311919952575832],
                [36.22253157463354, 0.23051125324554922],
                [36.262354362073474, 0.1298303998780296],
                [36.302176832382, 0.029149483792903077],
                [36.34199923148872, -0.07153144637347103],
                [36.38182180532159, -0.17221234198507382],
                [36.42164479981253, -0.27289315440505035],
                [36.46146846090307, -0.3735738349945302],
                [36.501293034549896, -0.4742543351114507],
                [36.54111876673048, -0.5749346061093765],
                [36.580945903448665, -0.6756145993363237],
                [36.62077469074031, -0.7762942661335812],
                [36.66060537467884, -0.8769735578345282],
                [36.70043820138087, -0.9776524257634585],
                [36.74027341701184, -1.078330821234398],
                [36.7801112677916, -1.179008695549928],
                [36.819952, -1.279686]
            ]
        },
        "properties": {
            "eventID": 28,
            "name": "Paulo Lokoro",
            "year": 2015,
            "event": "was selected by Tegla Loroupe Foundation.",
            "eventShort": "became athlete",
            "lineID": "SS2",
            "id": "paulo",
            "start": "Kakuma refugee camp",
            "end": "Nairobi",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [34.82662, 3.753923],
                [34.86660924945893, 3.6532750724495604],
                [34.90658952959134, 3.552625370511737],
                [34.946561089928146, 3.4519739435808163],
                [34.986524179800824, 3.3513208410090884],
                [35.02647904834722, 3.2506661121080813],
                [35.066425944517256, 3.1500098061497543],
                [35.10636511707867, 3.049351972367713],
                [35.146296814622715, 2.948692659958416],
                [35.18622128556993, 2.8480319180823788],
                [35.226138778175795, 2.7473697958653798],
                [35.26604954053645, 2.6467063423996557],
                [35.305953820594404, 2.546041606745106],
                [35.34585186614421, 2.445375637930492],
                [35.38574392483812, 2.3447084849546354],
                [35.425630244191815, 2.244040196787604],
                [35.46551107159004, 2.143370822371916],
                [35.505386654292266, 2.0427004106237288],
                [35.54525723943836, 1.9420290104340314],
                [35.58512307405421, 1.841356670669834],
                [35.624984405057425, 1.7406834401753557],
                [35.66484147926294, 1.6400093677732137],
                [35.70469454338864, 1.5393345022656117],
                [35.74454384406105, 1.4386588924355241],
                [35.78438962782089, 1.3379825870478808],
                [35.82423214112879, 1.237305634850752],
                [35.864071630370816, 1.1366280845765324],
                [35.90390834186419, 1.0359499849431222],
                [35.9437425218628, 0.93527138465511],
                [35.983574416562924, 0.834592332404953],
                [36.023404272108756, 0.7339128768741585],
                [36.063232334598055, 0.6332330667344652],
                [36.10305885008774, 0.5325529506490189],
                [36.142884064599514, 0.4318725772735574],
                [36.182708224125435, 0.3311919952575832],
                [36.22253157463354, 0.23051125324554922],
                [36.262354362073474, 0.1298303998780296],
                [36.302176832382, 0.029149483792903077],
                [36.34199923148872, -0.07153144637347103],
                [36.38182180532159, -0.17221234198507382],
                [36.42164479981253, -0.27289315440505035],
                [36.46146846090307, -0.3735738349945302],
                [36.501293034549896, -0.4742543351114507],
                [36.54111876673048, -0.5749346061093765],
                [36.580945903448665, -0.6756145993363237],
                [36.62077469074031, -0.7762942661335812],
                [36.66060537467884, -0.8769735578345282],
                [36.70043820138087, -0.9776524257634585],
                [36.74027341701184, -1.078330821234398],
                [36.7801112677916, -1.179008695549928],
                [36.819952, -1.279686]
            ]
        },
        "properties": {
            "eventID": 31,
            "name": "Rose Lokonyen",
            "year": 2015,
            "event": "was selected by Tegla Loroupe Foundation.",
            "eventShort": "became athlete",
            "lineID": "SS2",
            "id": "rose",
            "start": "Kakuma refugee camp",
            "end": "Nairobi",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [34.82662, 3.753923],
                [34.86660924945893, 3.6532750724495604],
                [34.90658952959134, 3.552625370511737],
                [34.946561089928146, 3.4519739435808163],
                [34.986524179800824, 3.3513208410090884],
                [35.02647904834722, 3.2506661121080813],
                [35.066425944517256, 3.1500098061497543],
                [35.10636511707867, 3.049351972367713],
                [35.146296814622715, 2.948692659958416],
                [35.18622128556993, 2.8480319180823788],
                [35.226138778175795, 2.7473697958653798],
                [35.26604954053645, 2.6467063423996557],
                [35.305953820594404, 2.546041606745106],
                [35.34585186614421, 2.445375637930492],
                [35.38574392483812, 2.3447084849546354],
                [35.425630244191815, 2.244040196787604],
                [35.46551107159004, 2.143370822371916],
                [35.505386654292266, 2.0427004106237288],
                [35.54525723943836, 1.9420290104340314],
                [35.58512307405421, 1.841356670669834],
                [35.624984405057425, 1.7406834401753557],
                [35.66484147926294, 1.6400093677732137],
                [35.70469454338864, 1.5393345022656117],
                [35.74454384406105, 1.4386588924355241],
                [35.78438962782089, 1.3379825870478808],
                [35.82423214112879, 1.237305634850752],
                [35.864071630370816, 1.1366280845765324],
                [35.90390834186419, 1.0359499849431222],
                [35.9437425218628, 0.93527138465511],
                [35.983574416562924, 0.834592332404953],
                [36.023404272108756, 0.7339128768741585],
                [36.063232334598055, 0.6332330667344652],
                [36.10305885008774, 0.5325529506490189],
                [36.142884064599514, 0.4318725772735574],
                [36.182708224125435, 0.3311919952575832],
                [36.22253157463354, 0.23051125324554922],
                [36.262354362073474, 0.1298303998780296],
                [36.302176832382, 0.029149483792903077],
                [36.34199923148872, -0.07153144637347103],
                [36.38182180532159, -0.17221234198507382],
                [36.42164479981253, -0.27289315440505035],
                [36.46146846090307, -0.3735738349945302],
                [36.501293034549896, -0.4742543351114507],
                [36.54111876673048, -0.5749346061093765],
                [36.580945903448665, -0.6756145993363237],
                [36.62077469074031, -0.7762942661335812],
                [36.66060537467884, -0.8769735578345282],
                [36.70043820138087, -0.9776524257634585],
                [36.74027341701184, -1.078330821234398],
                [36.7801112677916, -1.179008695549928],
                [36.819952, -1.279686]
            ]
        },
        "properties": {
            "eventID": 32,
            "name": "Yiech Biel",
            "year": 2015,
            "event": "was selected by Tegla Loroupe Foundation.",
            "eventShort": "became athlete",
            "lineID": "SS2",
            "id": "yiech",
            "start": "Kakuma refugee camp",
            "end": "Nairobi",
            "zoom": "sudan",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [28.966761, 41.008246],
                [28.92541518136358, 40.94258245217844],
                [28.884151504583564, 40.87690416506992],
                [28.842969635298758, 40.81121120195806],
                [28.801869240660245, 40.745503625812844],
                [28.76084998932316, 40.6797814992926],
                [28.719911551438546, 40.614044884745894],
                [28.679053598645325, 40.54829384421339],
                [28.63827580406221, 40.482528439429814],
                [28.597577842279733, 40.41674873182576],
                [28.55695938935228, 40.350954782529634],
                [28.51642012279018, 40.28514665236937],
                [28.475959721551842, 40.2193244018744],
                [28.435577866035935, 40.15348809127742],
                [28.395274238073604, 40.08763778051618],
                [28.355048520920732, 40.02177352923533],
                [28.314900399250245, 39.95589539678819],
                [28.274829559144457, 39.89000344223849],
                [28.234835688087458, 39.82409772436218],
                [28.194918474957557, 39.75817830164918],
                [28.15507761001974, 39.69224523230508],
                [28.115312784918192, 39.62629857425293],
                [28.07562369266885, 39.560338385134855],
                [28.03601002765199, 39.49436472231387],
                [27.996471485604893, 39.428377642875525],
                [27.957007763614484, 39.362377203629556],
                [27.917618560110082, 39.29636346111161],
                [27.878303574856147, 39.230336471584856],
                [27.839062508945073, 39.1642962910417],
                [27.799895064790032, 39.098242975205345],
                [27.76080094611786, 39.032176579531445],
                [27.72177985796196, 38.96609715920973],
                [27.68283150665526, 38.900004769165626],
                [27.64395559982323, 38.8338994640618],
                [27.605151846376884, 38.767781298299795],
                [27.566419956505882, 38.701650326021536],
                [27.527759641671636, 38.63550660111098],
                [27.48917061460043, 38.5693501771956],
                [27.450652589276654, 38.50318110764795],
                [27.412205280936, 38.43699944558716],
                [27.373828406058735, 38.37080524388054],
                [27.33552168236299, 38.30459855514499],
                [27.297284828798126, 38.238379431748584],
                [27.25911756553808, 38.17214792581201],
                [27.22101961397479, 38.10590408921005],
                [27.182990696711638, 38.03964797357308],
                [27.145030537556945, 37.973379630288534],
                [27.107138861517484, 37.90709911050228],
                [27.069315394792042, 37.84080646512019],
                [27.031559864765004, 37.77450174480942],
                [26.993872, 37.708185]
            ]
        },
        "properties": {
            "eventID": 29,
            "name": "Rami Anis",
            "year": 2015,
            "event": "reached Samos Island of Greece from Turkey on a dinghy boat.",
            "eventShort": "dinghy boat",
            "lineID": "S2",
            "id": "rami",
            "start": "Istanbul",
            "end": "Samos Island",
            "zoom": "mediterranean",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [26.993872, 37.708185],
                [26.62433560898118, 38.014884059550454],
                [26.251699575108113, 38.32041697643608],
                [25.875915465684475, 38.62476095571789],
                [25.496934416575048, 38.92789277031673],
                [25.114707143864255, 39.22978875322472],
                [24.729183956800288, 39.53042478970884],
                [24.340314772094686, 39.829776309517854],
                [23.948049129650034, 40.127818279104076],
                [23.552336209790454, 40.42452519387283],
                [23.15312485207254, 40.7198710704733],
                [22.75036357575645, 41.01382943914519],
                [22.34400060201931, 41.306373336137376],
                [21.933983877995644, 41.597475296215066],
                [21.520261102731347, 41.887107345273705],
                [21.10277975514019, 42.17524099307873],
                [20.681487124053618, 42.46184722615199],
                [20.25633034045641, 42.74689650082632],
                [19.82725641200249, 43.03035873649182],
                [19.39421225990648, 43.31220330905825],
                [18.95714475830783, 43.59239904465986],
                [18.516000776205072, 43.87091421363014],
                [18.07072722205849, 44.14771652477571],
                [17.62127109115947, 44.422773119980214],
                [17.167579515864738, 44.69605056917064],
                [16.709599818792807, 44.9675148656801],
                [16.24727956907908, 45.23713142204302],
                [15.780566641783917, 45.50486506626015],
                [15.309409280546014, 45.77068003857279],
                [14.833756163570188, 46.03453998878739],
                [14.353556473035091, 46.29640797419307],
                [13.86875996800176, 46.55624645811701],
                [13.379317060898726, 46.81401730916374],
                [12.885178897652978, 47.06968180118667],
                [12.386297441529095, 47.32320061404142],
                [11.882625560730412, 47.57453383517239],
                [11.374117119806918, 47.8236409620856],
                [10.860727074903963, 48.070480905762146],
                [10.342411572874354, 48.31501199506814],
                [9.819128054263048, 48.55719198221841],
                [9.29083536015979, 48.79697804935173],
                [8.75749384289895, 49.03432681627744],
                [8.219065480568823, 49.269194349453024],
                [7.6755139952739455, 49.50153617225328],
                [7.126804975073949, 49.731307276592446],
                [6.572905999500598, 49.95846213595981],
                [6.013786768531537, 50.182954719930216],
                [5.449419234874538, 50.40473851020952],
                [4.8797777393895, 50.623766518274905],
                [4.304839149447913, 50.83999130466836],
                [3.724583, 51.053365]
            ]
        },
        "properties": {
            "eventID": 30,
            "name": "Rami Anis",
            "year": 2015,
            "event": "eventually reached Gent, Belgium.",
            "eventShort": "settled down",
            "lineID": "S3",
            "id": "rami",
            "start": "Samos Island",
            "end": "Gent",
            "zoom": "overview",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [36.285234, 33.509224],
                [36.103800532177935, 33.62835598185408],
                [35.92186511065377, 33.747222301825204],
                [35.73942521034208, 33.86582102391385],
                [35.55647831021928, 33.98415020114775],
                [35.373021893634224, 34.10220787555142],
                [35.189053448625, 34.21999207811679],
                [35.00457046824199, 34.33750082877508],
                [34.8195704508773, 34.45473213636987],
                [34.63405090060064, 34.5716839986314],
                [34.44800932750157, 34.688354402152164],
                [34.26144324803843, 34.8047413223639],
                [34.074350185393754, 34.92084272351582],
                [33.8867276698364, 35.03665655865435],
                [33.69857323909037, 35.1521807696042],
                [33.509884438710486, 35.267413286951054],
                [33.32065882246481, 35.382352030025565],
                [33.130893952724, 35.49699490688908],
                [32.94058740085762, 35.61133981432085],
                [32.74973674763749, 35.725384637806954],
                [32.55833958364798, 35.83912725153078],
                [32.366393509703556, 35.952565518365255],
                [32.17389613727338, 36.065697289866954],
                [31.980845088913174, 36.17852040627175],
                [31.787237998704263, 36.29103269649256],
                [31.59307251270003, 36.40323197811877],
                [31.398346289379607, 36.51511605741768],
                [31.20305700010899, 36.62668272933791],
                [31.007202329609573, 36.7379297775148],
                [30.810779976434116, 36.84885497427782],
                [30.613787653450217, 36.9594560806602],
                [30.416223088331304, 37.06973084641057],
                [30.218084024055173, 37.17967701000688],
                [30.019368219410104, 37.289292298672514],
                [29.820073449508534, 37.398574428394745],
                [29.620197506308465, 37.50752110394547],
                [29.41973819914233, 37.61613001890434],
                [29.21869335525371, 37.72439885568435],
                [29.017060820341545, 37.83232528555989],
                [28.81483845911215, 37.939906968697265],
                [28.612024155838803, 38.047141554187974],
                [28.408615814929096, 38.15402668008443],
                [28.20461136149991, 38.26055997343838],
                [28.000008741960094, 38.366739050342254],
                [27.794805924600798, 38.472561515972984],
                [27.589000900193433, 38.57802496463894],
                [27.382591682595304, 38.683126979829616],
                [27.17557630936283, 38.787865134268245],
                [26.967952842372355, 38.892236989967415],
                [26.759719368448486, 38.996240098287835],
                [26.550874, 39.099872]
            ]
        },
        "properties": {
            "eventID": 33,
            "name": "Yusra Mardini",
            "year": 2015,
            "event": "reached Lesbos Island of Greece from Turkey on a dinghy boat.",
            "eventShort": "dinghy boat",
            "lineID": "S5",
            "id": "yusra",
            "start": "Damascus",
            "end": "Lesbos Island",
            "zoom": "mediterranean",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [26.550874, 39.099872],
                [26.342693320459258, 39.380869112231174],
                [26.13283082785193, 39.66149227326318],
                [25.921258176204827, 39.941734668670655],
                [25.707946521750998, 40.221589345150065],
                [25.492866513229522, 40.50104920706961],
                [25.275988282050065, 40.780107012928866],
                [25.057281432324693, 41.058755371726186],
                [24.836715030769962, 41.3369867392314],
                [24.614257596482652, 41.614793414161404],
                [24.389877090593156, 41.892167534256316],
                [24.163540905801007, 42.16910107225373],
                [23.935215855797686, 42.445585831758585],
                [23.7048681645824, 42.721613443006135],
                [23.47246345567731, 42.99717535851553],
                [23.237966741249398, 43.27226284863132],
                [23.00134241114684, 43.54686699695061],
                [22.762554221858892, 43.82097869563288],
                [22.52156528540877, 44.09458864059005],
                [22.278338058190432, 44.36768732655426],
                [22.032834329760917, 44.64026504202061],
                [21.78501521160105, 44.91231186406215],
                [21.534841125858645, 45.18381765301479],
                [21.282271794089468, 45.454772047029245],
                [21.02726622601262, 45.72516445648759],
                [20.769782708298454, 45.994984058281744],
                [20.50977879340873, 46.264219789951674],
                [20.24721128851014, 46.532860343680355],
                [19.98203624448443, 46.80089416014367],
                [19.71420894505984, 47.06830942221241],
                [19.443683896090747, 47.335094048504516],
                [19.170414815014535, 47.60123568678516],
                [18.894354620516687, 47.86672170721283],
                [18.615455422437755, 48.13153919542941],
                [18.333668511958134, 48.39567494549253],
                [18.048944352099273, 48.6591154526487],
                [17.76123256858278, 48.92184690594574],
                [17.470481941091816, 49.183855180683395],
                [17.17664039498221, 49.44512583070121],
                [16.879654993494167, 49.70564408050301],
                [16.579471930518764, 49.96539481721765],
                [16.276036523977176, 50.22436258239578],
                [15.96929320987436, 50.48253156364335],
                [15.659185537093045, 50.7398855860922],
                [15.345656162997996, 50.996408103709015],
                [15.028646849925114, 51.252082190444376],
                [14.708098462634467, 51.50689053122366],
                [14.383950966811321, 51.76081541278314],
                [14.056143428704319, 52.01383871435383],
                [13.724614015995181, 52.265941898197575],
                [13.3893, 52.517106]
            ]
        },
        "properties": {
            "eventID": 34,
            "name": "Yusra Mardini",
            "year": 2015,
            "event": "finally reached Berlin, Germany.",
            "eventShort": "settled down",
            "lineID": "S6",
            "id": "yusra",
            "start": "Lesbos Island",
            "end": "Berlin",
            "zoom": "overview",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 38,
            "name": "Popole Misenga",
            "year": 2016,
            "event": "competed in judo in Rio.",
            "eventShort": "Olympics",
            "lineID": "DRC3",
            "id": "popole",
            "start": "Rio",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "DR Congo"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 42,
            "name": "Yolande Mabika",
            "year": 2016,
            "event": "competed in judo in Rio.",
            "eventShort": "Olympics",
            "lineID": "DRC3",
            "id": "yolande",
            "start": "Rio",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "DR Congo"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [6.131759, 49.603575],
                [4.341165686417094, 48.382943554076554],
                [2.6353292672020165, 47.13583771849427],
                [1.0084128308821703, 45.86457671946993],
                [-0.5451402878343636, 44.571266196032795],
                [-2.0305846396460856, 43.25781699178115],
                [-3.452863609900646, 41.92596314638479],
                [-4.816609743610434, 40.577278819506425],
                [-6.126151729726992, 39.21319400346351],
                [-7.38552593992731, 37.83500896856089],
                [-8.59849091895663, 36.443907445064845],
                [-9.768543626360538, 35.04096858524325],
                [-10.898936547140046, 33.62717777331091],
                [-11.992695035763175, 32.203436364785986],
                [-13.05263444733259, 30.770570442930822],
                [-14.081376753175581, 29.32933868103375],
                [-15.081366445504159, 27.880439397046256],
                [-16.054885615151896, 26.42451688279037],
                [-17.004068144222583, 24.962167084483312],
                [-17.930912996932424, 23.49394270530869],
                [-18.83729662102573, 22.020357794611108],
                [-19.724984492023943, 20.541891882275223],
                [-20.59564184563664, 19.05899371114086],
                [-21.45084365175885, 17.572084615000346],
                [-22.292083887996746, 16.08156158487194],
                [-23.12078417265549, 14.587800061860404],
                [-23.938301817375184, 13.091156490997415],
                [-24.74593735870168, 11.591970666983366],
                [-25.54494162626093, 10.09056789970311],
                [-26.336522403188514, 8.587261024732078],
                [-27.121850732280862, 7.082352281758528],
                [-27.902066919150723, 5.576135081892472],
                [-28.678286281605086, 4.06889568318759],
                [-29.451604692604707, 2.5609147923450974],
                [-30.223103962569777, 1.052469109477828],
                [-30.993857105505516, -0.4561671680266046],
                [-31.764933532462745, -1.9647208671074585],
                [-32.53740421523796, -3.472918371036119],
                [-33.31234686296503, -4.980484146916634],
                [-34.09085115436, -6.487139253706885],
                [-34.87402406885062, -7.9925998154992834],
                [-35.6629953606445, -9.496575444288354],
                [-36.45892322095218, -10.998767595707607],
                [-37.263000175059794, -12.49886784022881],
                [-38.07645926270643, -13.996556031067156],
                [-38.90058055221303, -15.491498348507127],
                [-39.7366980409585, -16.983345198535197],
                [-40.586206997000296, -18.47172894150985],
                [-41.45057179874426, -19.95626142409209],
                [-42.331334331376745, -21.436531284768755],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 43,
            "name": "Yonas Kinde",
            "year": 2016,
            "event": "competed in track and field in Rio.",
            "eventShort": "Olympics",
            "lineID": "E2",
            "id": "yonas",
            "start": "Luxembourg",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "Ethiopia"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [36.819952, -1.279686],
                [35.34043361138992, -1.9077896026176289],
                [33.85983549340087, -2.534621174124046],
                [32.377804654022256, -3.159760857763103],
                [30.893990576214847, -3.782788312578983],
                [29.40804585174011, -4.403282608268768],
                [27.919626828108342, -5.0208221299278],
                [26.428394270943777, -5.634984494693952],
                [24.934014043893786, -6.245346482315265],
                [23.436157808002804, -6.851483981684504],
                [21.934503742231787, -7.4529719554019795],
                [20.42873728652698, -8.049384424443078],
                [18.91855190852573, -8.64029447501791],
                [17.403649894630746, -9.225274289715218],
                [15.883743165785951, -9.803895205018769],
                [14.358554117844696, -10.375727797270407],
                [12.82781648593522, -10.940341999126481],
                [11.291276231697307, -11.497307248511328],
                [9.74869245168899, -12.046192672010408],
                [8.199838304644748, -12.586567304563138],
                [6.644501954608615, -13.118000347209366],
                [5.08248752627113, -13.640061464510687],
                [3.513616068113419, -14.152321123105578],
                [1.9377265182105448, -14.654350972663716],
                [0.354676666779582, -15.145724270276975],
                [-1.235655891215798, -15.626016349061095],
                [-2.8333728208601427, -16.094805131441298],
                [-4.438554137684563, -16.551671687256352],
                [-6.051257332585465, -16.996200836438714],
                [-7.671516540841399, -17.42798179561425],
                [-9.299341765394068, -17.846608867514753],
                [-10.93471816505746, -18.251682171613417],
                [-12.577605418704104, -18.642808413880857],
                [-14.227937176728993, -19.019601693022096],
                [-15.885620611189585, -19.381684339999666],
                [-17.550536075943267, -19.728687787081864],
                [-19.22253688783516, -20.06025346208657],
                [-20.90144923951257, -20.376033702930016],
                [-22.58707225374575, -20.675692687046887],
                [-24.2791781882109, -20.95890736973481],
                [-25.977512798536345, -21.225368425004465],
                [-27.681795866030324, -21.474781182098834],
                [-29.391721894908603, -21.706866550493817],
                [-31.106960982036526, -21.921361925919058],
                [-32.82715986021822, -22.118022069753998],
                [-34.55194311393353, -22.296619954069378],
                [-36.280914564178374, -22.45694756460677],
                [-38.01365881674837, -22.598816654125155],
                [-39.74974296596584, -22.722059438796677],
                [-41.48871844353782, -22.826529230706456],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 35,
            "name": "Anjelina Lohalith",
            "year": 2016,
            "event": "competed in track and field in Rio.",
            "eventShort": "Olympics",
            "lineID": "SS3",
            "id": "anjelina",
            "start": "Nairobi",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [36.819952, -1.279686],
                [35.34043361138992, -1.9077896026176289],
                [33.85983549340087, -2.534621174124046],
                [32.377804654022256, -3.159760857763103],
                [30.893990576214847, -3.782788312578983],
                [29.40804585174011, -4.403282608268768],
                [27.919626828108342, -5.0208221299278],
                [26.428394270943777, -5.634984494693952],
                [24.934014043893786, -6.245346482315265],
                [23.436157808002804, -6.851483981684504],
                [21.934503742231787, -7.4529719554019795],
                [20.42873728652698, -8.049384424443078],
                [18.91855190852573, -8.64029447501791],
                [17.403649894630746, -9.225274289715218],
                [15.883743165785951, -9.803895205018769],
                [14.358554117844696, -10.375727797270407],
                [12.82781648593522, -10.940341999126481],
                [11.291276231697307, -11.497307248511328],
                [9.74869245168899, -12.046192672010408],
                [8.199838304644748, -12.586567304563138],
                [6.644501954608615, -13.118000347209366],
                [5.08248752627113, -13.640061464510687],
                [3.513616068113419, -14.152321123105578],
                [1.9377265182105448, -14.654350972663716],
                [0.354676666779582, -15.145724270276975],
                [-1.235655891215798, -15.626016349061095],
                [-2.8333728208601427, -16.094805131441298],
                [-4.438554137684563, -16.551671687256352],
                [-6.051257332585465, -16.996200836438714],
                [-7.671516540841399, -17.42798179561425],
                [-9.299341765394068, -17.846608867514753],
                [-10.93471816505746, -18.251682171613417],
                [-12.577605418704104, -18.642808413880857],
                [-14.227937176728993, -19.019601693022096],
                [-15.885620611189585, -19.381684339999666],
                [-17.550536075943267, -19.728687787081864],
                [-19.22253688783516, -20.06025346208657],
                [-20.90144923951257, -20.376033702930016],
                [-22.58707225374575, -20.675692687046887],
                [-24.2791781882109, -20.95890736973481],
                [-25.977512798536345, -21.225368425004465],
                [-27.681795866030324, -21.474781182098834],
                [-29.391721894908603, -21.706866550493817],
                [-31.106960982036526, -21.921361925919058],
                [-32.82715986021822, -22.118022069753998],
                [-34.55194311393353, -22.296619954069378],
                [-36.280914564178374, -22.45694756460677],
                [-38.01365881674837, -22.598816654125155],
                [-39.74974296596584, -22.722059438796677],
                [-41.48871844353782, -22.826529230706456],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 36,
            "name": "James Chiengjiek",
            "year": 2016,
            "event": "competed in track and field in Rio.",
            "eventShort": "Olympics",
            "lineID": "SS3",
            "id": "james",
            "start": "Nairobi",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [36.819952, -1.279686],
                [35.34043361138992, -1.9077896026176289],
                [33.85983549340087, -2.534621174124046],
                [32.377804654022256, -3.159760857763103],
                [30.893990576214847, -3.782788312578983],
                [29.40804585174011, -4.403282608268768],
                [27.919626828108342, -5.0208221299278],
                [26.428394270943777, -5.634984494693952],
                [24.934014043893786, -6.245346482315265],
                [23.436157808002804, -6.851483981684504],
                [21.934503742231787, -7.4529719554019795],
                [20.42873728652698, -8.049384424443078],
                [18.91855190852573, -8.64029447501791],
                [17.403649894630746, -9.225274289715218],
                [15.883743165785951, -9.803895205018769],
                [14.358554117844696, -10.375727797270407],
                [12.82781648593522, -10.940341999126481],
                [11.291276231697307, -11.497307248511328],
                [9.74869245168899, -12.046192672010408],
                [8.199838304644748, -12.586567304563138],
                [6.644501954608615, -13.118000347209366],
                [5.08248752627113, -13.640061464510687],
                [3.513616068113419, -14.152321123105578],
                [1.9377265182105448, -14.654350972663716],
                [0.354676666779582, -15.145724270276975],
                [-1.235655891215798, -15.626016349061095],
                [-2.8333728208601427, -16.094805131441298],
                [-4.438554137684563, -16.551671687256352],
                [-6.051257332585465, -16.996200836438714],
                [-7.671516540841399, -17.42798179561425],
                [-9.299341765394068, -17.846608867514753],
                [-10.93471816505746, -18.251682171613417],
                [-12.577605418704104, -18.642808413880857],
                [-14.227937176728993, -19.019601693022096],
                [-15.885620611189585, -19.381684339999666],
                [-17.550536075943267, -19.728687787081864],
                [-19.22253688783516, -20.06025346208657],
                [-20.90144923951257, -20.376033702930016],
                [-22.58707225374575, -20.675692687046887],
                [-24.2791781882109, -20.95890736973481],
                [-25.977512798536345, -21.225368425004465],
                [-27.681795866030324, -21.474781182098834],
                [-29.391721894908603, -21.706866550493817],
                [-31.106960982036526, -21.921361925919058],
                [-32.82715986021822, -22.118022069753998],
                [-34.55194311393353, -22.296619954069378],
                [-36.280914564178374, -22.45694756460677],
                [-38.01365881674837, -22.598816654125155],
                [-39.74974296596584, -22.722059438796677],
                [-41.48871844353782, -22.826529230706456],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 37,
            "name": "Paulo Lokoro",
            "year": 2016,
            "event": "competed in track and field in Rio.",
            "eventShort": "Olympics",
            "lineID": "SS3",
            "id": "paulo",
            "start": "Nairobi",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [36.819952, -1.279686],
                [35.34043361138992, -1.9077896026176289],
                [33.85983549340087, -2.534621174124046],
                [32.377804654022256, -3.159760857763103],
                [30.893990576214847, -3.782788312578983],
                [29.40804585174011, -4.403282608268768],
                [27.919626828108342, -5.0208221299278],
                [26.428394270943777, -5.634984494693952],
                [24.934014043893786, -6.245346482315265],
                [23.436157808002804, -6.851483981684504],
                [21.934503742231787, -7.4529719554019795],
                [20.42873728652698, -8.049384424443078],
                [18.91855190852573, -8.64029447501791],
                [17.403649894630746, -9.225274289715218],
                [15.883743165785951, -9.803895205018769],
                [14.358554117844696, -10.375727797270407],
                [12.82781648593522, -10.940341999126481],
                [11.291276231697307, -11.497307248511328],
                [9.74869245168899, -12.046192672010408],
                [8.199838304644748, -12.586567304563138],
                [6.644501954608615, -13.118000347209366],
                [5.08248752627113, -13.640061464510687],
                [3.513616068113419, -14.152321123105578],
                [1.9377265182105448, -14.654350972663716],
                [0.354676666779582, -15.145724270276975],
                [-1.235655891215798, -15.626016349061095],
                [-2.8333728208601427, -16.094805131441298],
                [-4.438554137684563, -16.551671687256352],
                [-6.051257332585465, -16.996200836438714],
                [-7.671516540841399, -17.42798179561425],
                [-9.299341765394068, -17.846608867514753],
                [-10.93471816505746, -18.251682171613417],
                [-12.577605418704104, -18.642808413880857],
                [-14.227937176728993, -19.019601693022096],
                [-15.885620611189585, -19.381684339999666],
                [-17.550536075943267, -19.728687787081864],
                [-19.22253688783516, -20.06025346208657],
                [-20.90144923951257, -20.376033702930016],
                [-22.58707225374575, -20.675692687046887],
                [-24.2791781882109, -20.95890736973481],
                [-25.977512798536345, -21.225368425004465],
                [-27.681795866030324, -21.474781182098834],
                [-29.391721894908603, -21.706866550493817],
                [-31.106960982036526, -21.921361925919058],
                [-32.82715986021822, -22.118022069753998],
                [-34.55194311393353, -22.296619954069378],
                [-36.280914564178374, -22.45694756460677],
                [-38.01365881674837, -22.598816654125155],
                [-39.74974296596584, -22.722059438796677],
                [-41.48871844353782, -22.826529230706456],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 40,
            "name": "Rose Lokonyen",
            "year": 2016,
            "event": "competed in track and field at the Rio 2016 games.",
            "eventShort": "Olympics",
            "lineID": "SS3",
            "id": "rose",
            "start": "Nairobi",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [-97.922211, 39.381266],
                [-96.35759967598034, 38.32778161770402],
                [-94.83824449519479, 37.25411076677923],
                [-93.36195745944991, 36.16157586576551],
                [-91.92657610131647, 35.05142098082077],
                [-90.529976207174, 33.92481567257642],
                [-89.17008150714246, 32.78285901751933],
                [-87.84487079153375, 31.626583706317327],
                [-86.55238286744778, 30.45696014289111],
                [-85.29071972160615, 29.274900486074323],
                [-84.05804820895378, 28.081262590697023],
                [-82.85260054258033, 26.87685381722119],
                [-81.67267382006467, 25.662434689006766],
                [-80.51662878489817, 24.438722384235962],
                [-79.38288798932206, 23.206394055789644],
                [-78.26993349663151, 21.966089977239736],
                [-77.1763042365148, 20.718416516843618],
                [-76.10059310599478, 19.46394894421959],
                [-75.04144389067186, 18.203234076427762],
                [-73.99754806586674, 16.93679277163347],
                [-72.96764152458016, 15.665122279518336],
                [-71.95050126859711, 14.388698458232382],
                [-70.94494209026524, 13.107977868034961],
                [-69.94981326520485, 11.8233997519231],
                [-68.96399527022308, 10.535387913547908],
                [-67.98639653580798, 9.24435250261882],
                [-67.01595023858633, 7.950691717826512],
                [-66.05161113589827, 6.654793437106602],
                [-65.09235244204217, 5.357036784839383],
                [-64.13716274366958, 4.0577936453534],
                [-63.18504295017738, 2.7574301318850583],
                [-62.235003273678714, 1.45630801995356],
                [-61.2860602321821, 0.15478615394669684],
                [-60.33723366892499, -1.1467781644150157],
                [-59.38754378036142, -2.4480277971577498],
                [-58.43600814507471, -3.7486043921470635],
                [-57.48163874586101, -5.048146997668569],
                [-56.523438977410315, -6.346290660933788],
                [-55.56040063240433, -7.64266500186846],
                [-54.5915008594751, -8.936892753421786],
                [-53.61569908735306, -10.228588259478958],
                [-52.63193391071936, -11.517355921273223],
                [-51.63911993481739, -12.802788582982314],
                [-50.63614457783924, -14.08446584696868],
                [-49.621864832568974, -15.36195230889424],
                [-48.595103991834726, -16.634795702726144],
                [-47.554648346119095, -17.902524945468482],
                [-46.499243866344905, -19.164648071335794],
                [-45.427592890561556, -20.42065004505745],
                [-44.33835084020291, -21.669990444113154],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 46,
            "name": "Shahrad Nasajpour",
            "year": 2016,
            "event": "competed in track and field in the 2016 Rio Paralympics.",
            "eventShort": "Paralympics",
            "lineID": "I2",
            "id": "shahrad",
            "start": "USA",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "Iran"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [36.819952, -1.279686],
                [35.34043361138992, -1.9077896026176289],
                [33.85983549340087, -2.534621174124046],
                [32.377804654022256, -3.159760857763103],
                [30.893990576214847, -3.782788312578983],
                [29.40804585174011, -4.403282608268768],
                [27.919626828108342, -5.0208221299278],
                [26.428394270943777, -5.634984494693952],
                [24.934014043893786, -6.245346482315265],
                [23.436157808002804, -6.851483981684504],
                [21.934503742231787, -7.4529719554019795],
                [20.42873728652698, -8.049384424443078],
                [18.91855190852573, -8.64029447501791],
                [17.403649894630746, -9.225274289715218],
                [15.883743165785951, -9.803895205018769],
                [14.358554117844696, -10.375727797270407],
                [12.82781648593522, -10.940341999126481],
                [11.291276231697307, -11.497307248511328],
                [9.74869245168899, -12.046192672010408],
                [8.199838304644748, -12.586567304563138],
                [6.644501954608615, -13.118000347209366],
                [5.08248752627113, -13.640061464510687],
                [3.513616068113419, -14.152321123105578],
                [1.9377265182105448, -14.654350972663716],
                [0.354676666779582, -15.145724270276975],
                [-1.235655891215798, -15.626016349061095],
                [-2.8333728208601427, -16.094805131441298],
                [-4.438554137684563, -16.551671687256352],
                [-6.051257332585465, -16.996200836438714],
                [-7.671516540841399, -17.42798179561425],
                [-9.299341765394068, -17.846608867514753],
                [-10.93471816505746, -18.251682171613417],
                [-12.577605418704104, -18.642808413880857],
                [-14.227937176728993, -19.019601693022096],
                [-15.885620611189585, -19.381684339999666],
                [-17.550536075943267, -19.728687787081864],
                [-19.22253688783516, -20.06025346208657],
                [-20.90144923951257, -20.376033702930016],
                [-22.58707225374575, -20.675692687046887],
                [-24.2791781882109, -20.95890736973481],
                [-25.977512798536345, -21.225368425004465],
                [-27.681795866030324, -21.474781182098834],
                [-29.391721894908603, -21.706866550493817],
                [-31.106960982036526, -21.921361925919058],
                [-32.82715986021822, -22.118022069753998],
                [-34.55194311393353, -22.296619954069378],
                [-36.280914564178374, -22.45694756460677],
                [-38.01365881674837, -22.598816654125155],
                [-39.74974296596584, -22.722059438796677],
                [-41.48871844353782, -22.826529230706456],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 41,
            "name": "Yiech Biel",
            "year": 2016,
            "event": "competed in track and field in Rio.",
            "eventShort": "Olympics",
            "lineID": "SS3",
            "id": "yiech",
            "start": "Nairobi",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "South Sudan"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [23.728098, 37.984263],
                [21.868945869788085, 37.04391002068165],
                [20.055962022784882, 36.07526710524461],
                [18.287691602612405, 35.07999220090417],
                [16.562572216316678, 34.0596750369174],
                [14.878960493420452, 33.015836265776414],
                [13.235155202356246, 31.949927587425282],
                [11.629417098262422, 30.863332676772735],
                [10.059985731208206, 29.757368754125043],
                [8.525093476068799, 28.633288658046624],
                [7.022977059548048, 27.49228329960966],
                [5.551886860719005, 26.335484395368805],
                [4.110094252725852, 25.163967393288424],
                [2.695897238078043, 23.978754521046227],
                [1.3076246107335023, 22.78081789956596],
                [-0.05636114319177424, 21.57108267632089],
                [-1.3976620163385352, 20.350430142989342],
                [-2.717843554704427, 19.119700810567505],
                [-4.01843468884706, 17.879697422203336],
                [-5.300928194075532, 16.631187889969432],
                [-6.566781669852174, 15.374908146696933],
                [-7.817418944720784, 14.111564907997776],
                [-9.05423182742007, 12.841838342841825],
                [-10.278582137483733, 11.566384653654147],
                [-11.491803959666267, 10.285838568961474],
                [-12.69520607608365, 9.000815753242067],
                [-13.890074538149147, 7.711915139898289],
                [-15.077675347344368, 6.419721194247487],
                [-16.259257219719927, 5.124806114169547],
                [-17.43605441388073, 3.827731976608605],
                [-18.609289606182426, 2.529052838539905],
                [-19.78017680003413, 1.229316801313465],
                [-20.949924258644018, -0.07093195250221455],
                [-22.1197374523161, -1.3711511405103332],
                [-23.29082201255324, -2.6707983707565077],
                [-24.464386685772265, -3.9693291314868926],
                [-25.641646279404963, -5.266194771002353],
                [-26.823824592544703, -6.560840458262895],
                [-28.012157322084366, -7.852703114988628],
                [-29.20789493344948, -9.14120931015364],
                [-30.412305482512597, -10.425773107989155],
                [-31.62667737202234, -11.705793860924057],
                [-32.85232202181719, -12.980653939318755],
                [-34.090576427129605, -14.249716390425004],
                [-35.342805573317314, -15.512322519770802],
                [-36.61040466827042, -16.767789389173284],
                [-37.89480114541011, -18.015407226884545],
                [-39.197456380488276, -19.254436747042945],
                [-40.51986705419011, -20.484106377720884],
                [-41.86356607971755, -21.703609399522218],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 45,
            "name": "Ibrahim Al Hussein",
            "year": 2016,
            "event": "competed in swimming in Rio Paralympics 2016.",
            "eventShort": "Paralympics",
            "lineID": "S11",
            "id": "ibrahim",
            "start": "Athens",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [3.724583, 51.053365],
                [1.9506517352434798, 49.791471859655424],
                [0.2677049773652506, 48.50388458993439],
                [-1.3311137032627367, 47.192987941437906],
                [-2.852238771939948, 45.860927297875016],
                [-4.30167553806471, 44.509632801547546],
                [-5.685005834657854, 43.14084177107774],
                [-7.007402416894586, 41.756119256015296],
                [-8.273648959575908, 40.35687669806883],
                [-9.488163355013503, 38.944388749829336],
                [-10.655022652410366, 37.51980835135608],
                [-11.777988468757517, 36.084180192342025],
                [-12.86053206914571, 34.638452699814366],
                [-13.905858587171757, 33.183488693585936],
                [-14.916930055497561, 31.720074847612562],
                [-15.896487060159803, 30.24893008758744],
                [-16.84706893380666, 28.770713045266568],
                [-17.7710324734411, 27.286028679337768],
                [-18.670569215736037, 25.795434161880458],
                [-19.547721333815833, 24.299444119081915],
                [-20.40439623826545, 22.798535305156065],
                [-21.242379975530064, 21.293150779491096],
                [-22.063349521382538, 19.783703648990908],
                [-22.86888406765634, 18.27058043036843],
                [-23.660475398339972, 16.75414408076429],
                [-24.439537447396994, 15.234736739448502],
                [-25.20741512602004, 13.712682218452876],
                [-25.965392501945303, 12.188288275714866],
                [-26.714700408293574, 10.661848700623741],
                [-27.456523554401087, 9.133645238690873],
                [-28.192007206416726, 7.603949379361117],
                [-28.922263501174047, 6.073024028693909],
                [-29.648377453060334, 4.5411250867303785],
                [-30.37141271033914, 3.0085029477870138],
                [-31.092417114655234, 1.475403940651019],
                [-31.81242811527295, -0.05792827533116907],
                [-32.53247808797128, -1.591251342998755],
                [-33.25359960744214, -3.12432285414943],
                [-33.97683072151127, -4.656898995763142],
                [-34.70322027552087, -6.188733181089682],
                [-35.43383333578336, -7.719574650768464],
                [-36.16975676213293, -9.249167028661576],
                [-36.91210498127126, -10.777246816343533],
                [-37.662026014823475, -12.3035418091874],
                [-38.42070781878868, -13.827769415698693],
                [-39.18938499437561, -15.349634860148502],
                [-39.96934593403826, -16.86882924661797],
                [-40.76194047082834, -18.38502746024769],
                [-41.56858810389653, -19.89788587874811],
                [-42.39078687799524, -21.40703986401952],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 39,
            "name": "Rami Anis",
            "year": 2016,
            "event": "competed in swimming in Rio.",
            "eventShort": "Olympics",
            "lineID": "S4",
            "id": "rami",
            "start": "Gent",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "Syria"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [13.3893, 52.517106],
                [11.171857486770834, 51.34523266624683],
                [9.066809299493642, 50.13360745072464],
                [7.067240550236686, 48.88582851929479],
                [5.166276768708208, 47.605175706835745],
                [3.357203939141423, 46.294630184224125],
                [1.633551691504541, 44.95689630579753],
                [-0.010852597453281968, 43.594424258438906],
                [-1.5818520934535814, 42.209432547188115],
                [-3.084945609454909, 40.803929674265255],
                [-4.525285019712078, 39.37973461083483],
                [-5.907681425579346, 37.938495837964176],
                [-7.23661732085135, 36.48170885877993],
                [-8.516262666470897, 35.01073216989837],
                [-9.750493315531285, 33.526801736833846],
                [-10.942910647353548, 32.03104405327747],
                [-12.096861592888683, 30.52448788406476],
                [-13.215458480580269, 29.008074800985206],
                [-14.301598317813724, 27.482668622775545],
                [-15.357981261425516, 25.94906386818702],
                [-16.387128132305094, 24.4079933257086],
                [-17.391396902605113, 22.860134836612705],
                [-18.372998136348023, 21.30611738032451],
                [-19.334009400631686, 19.746526543271223],
                [-20.276388689311855, 18.181909444715554],
                [-21.20198691712637, 16.612779185844218],
                [-22.112559552108724, 15.039618881699946],
                [-23.00977745961525, 13.462885329474622],
                [-23.89523703370325, 11.883012361245783],
                [-24.7704696919465, 10.300413924427586],
                [-25.636950808796946, 8.715486928999292],
                [-26.496108160838624, 7.1286138969350485],
                [-27.34932995512627, 5.54016544615306],
                [-28.197972509542094, 3.9505026386937585],
                [-29.043367651943182, 2.3599792206910695],
                [-29.886829902953856, 0.7689437799898873],
                [-30.729663505682037, -0.8222581540407029],
                [-31.573169364473927, -2.413282044863622],
                [-32.41865195410972, -4.003782294204933],
                [-33.26742626060909, -5.593410175641003],
                [-34.12082481506565, -7.181811733235353],
                [-34.98020488265619, -8.768625621565409],
                [-35.84695587015042, -10.353480862552676],
                [-36.7225070168346, -11.9359944931924],
                [-37.60833543569086, -13.515769076554076],
                [-38.5059745738405, -15.092390046263372],
                [-39.417023163518955, -16.665422852051563],
                [-40.34315473699602, -18.234409870835623],
                [-41.28612778059783, -19.798867044134536],
                [-42.24779660393049, -21.358280198398816],
                [-43.230123, -22.912101]
            ]
        },
        "properties": {
            "eventID": 44,
            "name": "Yusra Mardini",
            "year": 2016,
            "event": "competed in swimming in Rio.",
            "eventShort": "Olympics",
            "lineID": "S7",
            "id": "yusra",
            "start": "Berlin",
            "end": "Rio",
            "zoom": "stadium",
            "homeCountry": "Syria"
        }
    }]
};
// active arcs ready to be animated
var arcsActive = {
    "type": "FeatureCollection",
    "features": []

};
// head points of the animating arcs
var arcsHead = {
    "type": "FeatureCollection",
    "features": []
};
// dynamic geojson to show as background arcs in animation
var arcsStatic = {
    "type": "FeatureCollection",
    "features": []
};
// dynamic geojson to show as background points in animation
var pointsStatic = {
    "type": "FeatureCollection",
    "features": []
};
var animationID;

// for auto play of slideshow
var timer;

var empty = {
    "type": "FeatureCollection",
    "features": []
};

window.onload = function() {

    var html = "";
    // load years
    $('#slideshow').html("");

    for (year in years) {
        // add slides to html
        html = "<div class='slide' id='" + year 
            + "'><div class='heading' style='background-image: linear-gradient(rgba(57,65,66, 0.4), rgba(57,65,66, 0.4)), url(./img/slide_" 
            + year + ".jpg)'> <h1 class='center'>" + years[year]["heading"][1] + "</h1><h1 class='center'>" + years[year]["heading"][0] 
            + "</h1><p><small><a class='caption' href='" + years[year]["url"] + "'><i>Photo: " + years[year]["caption"] 
            + "</i></a></small></p> </div> <div class='text pad2 hide-mobile'> <p>" + years[year]["text"] + "</p> </div> </div>";
        $('#slideshow').append(html);
    }
    // add footer
   html = "<div id='footer' class='fill-gray pad1' style='background-color: #ddd;'><p>Information about the athletes is from <a href='https://en.wikipedia.org/wiki/Refugee_Olympic_Team_at_the_2016_Summer_Olympics'>Wikipedia</a>, <a href='https://www.olympic.org/news/refugee-olympic-team-to-shine-spotlight-on-worldwide-refugee-crisis'>olympic.org</a>, <a href='https://www.rio2016.com/en/search-news?q=olympic+refugee+team'>rio2016.com</a>, and <a href='http://www.unhcr.org/uk/news/latest/2016/6/575154624/10-refugees-compete-2016-olympics-rio.html'>UNHCR</a>. You can also read about how this map was made in <a href='http://mapbox.com/blog/team-refugee-rio2016/'>our blog</a>. <p class='show-mobile'>And view the desktop version to see more!</p></div>";
    $('#slideshow').append(html)                

    // on mobile, set #intro differently
    if( isMobile ){
        html = "<div id='intro'><div class='heading'><p>According to <a class='non-caption' href='http://www.unhcr.org/uk/figures-at-a-glance.html'>UNHCR</a>, we are now witnessing the highest levels of displacement on record. There are currently more than 21 million refugees</strong> scattered across the world. Meet twelve of them here:</p><h2> The Team Refugee</h2><h2>Rio 2016 Olympics & Paralympics</h2></div></div>";
        $('#intro').html(html);
    };

    $('#intro').addClass('active');

    createArcs();
    // console.log(JSON.stringify(arcs));
};

map.on('load', function() {

    var nav = new mapboxgl.Navigation({
        position: 'top-left'
    }); // position is optional
    map.addControl(nav);

    addLayers();

    // if no scrolling or map mouse event for 15 sec
    var timer = setTimeout(function() {
        animateJourney( years["intro"]["paths"] );
    }, 10000);
    // clear timer on map move
    map.on('movestart', function(){
        clearTimeout(timer);
    });

    // Create a popup
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    // event info for arcs on hover
    map.on('mousemove', function(e) {

        var features = map.queryRenderedFeatures(e.point, { layers: ['arcs'] });
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

        if (!features.length) {
            popup.remove();
        } else {
            var html = "";
            var eventIDList = [];
            features.forEach( function(event){
                if (eventIDList.indexOf (event.properties.eventID) == -1) {
                    html = html + "<div class='event col12'><p>In " + event.properties.year + ", <strong>" + event.properties.name + "</strong> " 
                        + event.properties.event + "</p></div>";
                    eventIDList.push(event.properties.eventID);
                };
            });

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup.setLngLat(e.lngLat)
                .setHTML(html)
                .addTo(map);
        };
    });


    // scroll to view the story
    $("#sidebar").scroll(function() {
        for (slide in years) {
            if (isElementOnScreen(slide)) {
                var idNew = slide;
                break;
            };
        };

        function isElementOnScreen(id) {
            var element = document.getElementById(id);
            var bounds = element.getBoundingClientRect();
            var buffer = window.innerHeight - $('#y2016').height() - $('#z2016').height() - $('#footer').height();
            // return bounds.top < window.innerHeight && bounds.bottom > 0;
            if (isMobile){
                return bounds.right > 40;
            } else if (isBlog) {
                return bounds.bottom > 0;
            } else {
                return bounds.top > buffer;
            }
        }

        // if it's in the same slide, don't do anything
        if (idNew !== idActive) {

            idActive = idNew;
            slideSlideshow();

        };
    });
});

function slideSlideshow() {

    $('.slide').removeClass('active');
    $('#' + idActive).addClass('active');

    // update layer
    updateStops(idActive);

    // fly map
    map.fitBounds(years[idActive]["bounds"]);

    // once fly map is done
    map.once("moveend", function(e) {
        if (idActive !== "intro"){
            animateJourney(years[idActive]["paths"]);
        } else {
            cancelAnimationFrame( animationID );
        };
    });
};

function createArcs() {
    // start over drawing all arcs
    arcs = {
        "type": "FeatureCollection",
        "features": []
    };

    timeline2.forEach(function(event) {
        if (event.start && event.end) {
            // A simple line from origin to destination.
            var route = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            locations[event.start],
                            locations[event.end]
                        ]
                    }
                }]
            };

            // Calculate the distance in kilometers between route start/end point.
            var lineDistance = turf.lineDistance(route.features[0], 'kilometers');

            var arc = [];

            // Draw an arc between the `origin` & `destination` of the two points
            for (var i = 0; i <= segmentNumber; i++) {
                var segment = turf.along(route.features[0], i * lineDistance / segmentNumber, 'kilometers');
                arc.push(segment.geometry.coordinates);
            }

            // Update the route with calculated arc coordinates
            route.features[0].geometry.coordinates = arc;
            route.features[0].properties = event;

            // Add the route to paths 
            arcs.features.push(route.features[0]);
        }
    });
};

function addLayers() {

    var colorByCountry = {
        property: 'homeCountry',
        type: 'categorical',
        stops: [
            ['DR Congo', colors['DR Congo']],
            ['Iran', colors['Iran']],
            ['Syria', colors['Syria']],
            ['Ethiopia', colors['Ethiopia']],
            ['South Sudan', colors['South Sudan']]
        ]
    };
    var textLayout = {
        "text-field": "{name}",
        "text-font": ["Open Sans Semibold"],
        "text-size": 12,
        "text-max-width": 6,
        "text-anchor": "left",
        "text-justify": "left",
        "text-offset": [0.4, 0],
        "text-letter-spacing":0
    };
    var textMinZoom = 2;
    var textColor = "#fff";
    var textHaloColor = "#fff";
    var textHaloWidth = 2;

    map.setPaintProperty('home-countries', 'fill-color', colorByCountry);

    // Add a source and layer displaying all (static) paths
    map.addSource('arcs', {
        "type": "geojson",
        "data": arcs
    });
    map.addLayer({
        "id": "arcs",
        "source": "arcs",
        "type": "line",
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-width": 3,
            "line-color": colorByCountry,
            "line-opacity": .6
        }
    }, "home-countries");

    // Add a source and layer displaying a point which will be animated in a round.
    map.addSource('arcs-active', {
        "type": "geojson",
        "data": arcsActive
    });
    map.addLayer({
        "id": "arcs-active",
        "source": "arcs-active",
        "type": "line",
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-width": 3,
            "line-color": colorByCountry,
            "line-opacity": .6
        }
    }, "home-countries");
    // arc(s) to be animated
    map.addSource('arcs-head', {
        "type": "geojson",
        "data": arcsHead
    });
    map.addLayer({
        "id": "arcs-head",
        "source": "arcs-head",
        "type": "circle",
        "paint": {
            "circle-radius": 6,
            "circle-color": colorByCountry,
            "circle-blur": 2
        }
    }, 'Rio2016-2');

    // Add a source and layer displaying all (static) points
    map.addSource('points', {
        "type": "geojson",
        "data": points
    }, 'Rio2016-2');
    map.addLayer({
        "id": "points",
        "source": "points",
        "type": "circle",
        "paint": {
            "circle-radius": 4,
            "circle-color": colorByCountry,
            "circle-opacity": .6
        },
        "filter": ["has", "location"]
    }, 'Rio2016-2');
    map.addLayer({
        "id": "birthplaces",
        "source": "points",
        "type": "circle",
        "paint": {
            "circle-radius": 4,
            "circle-color": colorByCountry,
        },
        "filter": ["has", "birthplace"]
    }, 'Rio2016-2');

    // label for all locations
    map.addLayer({
        "id": "points-label1",
        "source": "points",
        "type": "symbol",
        "minzoom": textMinZoom ,
        "layout": textLayout,
        "paint": {
            "text-color": textColor,
            "text-halo-color": colors["South Sudan"],
            "text-halo-width": textHaloWidth,
        },
        "filter": ["==", "homeCountry", "South Sudan" ]
    }), 'arcs-active';
    map.addLayer({
        "id": "points-label2",
        "source": "points",
        "type": "symbol",
        "minzoom": textMinZoom ,
        "layout": textLayout,
        "paint": {
            "text-color": textColor,
            "text-halo-color": colors["Iran"],
            "text-halo-width": textHaloWidth,
        },
        "filter": ["==", "homeCountry", "Iran" ]
    }), 'arcs-active';
    map.addLayer({
        "id": "points-label3",
        "source": "points",
        "type": "symbol",
        "minzoom": textMinZoom ,
        "layout": textLayout,
        "paint": {
            "text-color": textColor,
            "text-halo-color": colors["DR Congo"],
            "text-halo-width": textHaloWidth,
        },
        "filter": ["==", "homeCountry", "DR Congo" ]
    }), 'arcs-active';
    map.addLayer({
        "id": "points-label4",
        "source": "points",
        "type": "symbol",
        "minzoom": textMinZoom ,
        "layout": textLayout,
        "paint": {
            "text-color": textColor,
            "text-halo-color": colors["Syria"],
            "text-halo-width": textHaloWidth,
        },
        "filter": ["==", "homeCountry", "Syria" ]
    }), 'arcs-active';
    map.addLayer({
        "id": "points-label5",
        "source": "points",
        "type": "symbol",
        "minzoom": textMinZoom ,
        "layout": textLayout,
        "paint": {
            "text-color": textColor,
            "text-halo-color": colors["Ethiopia"],
            "text-halo-width": textHaloWidth,
        },
        "filter": ["==", "homeCountry", "Ethiopia" ]
    }), 'arcs-active';
};

function updateStops() {
    var filterStops;

    map.getSource('arcs-active').setData(empty);
    map.getSource('arcs-head').setData(empty);

    if (idActive === "intro") {

        map.getSource('points').setData(points);
        map.getSource('arcs').setData(arcs);

    } else {

        // empty arcsStatic, pointsStatic
        arcsStatic = {
            "type": "FeatureCollection",
            "features": []
        };
        pointsStatic = {
            "type": "FeatureCollection",
            "features": []
        };
        var arcsList = [];
        var pointsList = [];

        // include all stops/arcs that debut in this or earlier slides but skip intro
        for (year in years) {
            if (year !== "intro" && years[year]["i"] < years[idActive]["i"]) {

                years[year]["locations"].forEach(function(round) {
                    pointsList = pointsList.concat(round);
                })

                years[year]["paths"].forEach(function(round) {
                    arcsList = arcsList.concat(round);
                });
            };
        };
        points.features.forEach(function(point) {
            var index = pointsList.indexOf(point.properties.name);
            if (index !== -1) {
                pointsStatic.features.push(point);
            };
        });
        arcs.features.forEach(function(arc) {
            var index = arcsList.indexOf(arc.properties.eventID);
            if (index !== -1) {
                arcsStatic.features.push(arc);
            };
        })

        map.getSource('points').setData(pointsStatic);
        map.getSource('arcs').setData(arcsStatic);

        $(".marker").hide();
    };

    if (["y2016", "intro", "z2016"].indexOf(idActive) !== -1) {
        map.setLayoutProperty('Rio2016-1', 'visibility', 'visible');
        map.setLayoutProperty('Rio2016-2', 'visibility', 'visible');
    } else {
        map.setLayoutProperty('Rio2016-1', 'visibility', 'none');
        map.setLayoutProperty('Rio2016-2', 'visibility', 'none');
    }
};

function animateJourney(paths) {

    // cancel the current animation if any
    cancelAnimationFrame(animationID);

    arcsActive = {
        "type": "FeatureCollection",
        "features": []
    };
    arcsHead = {
        "type": "FeatureCollection",
        "features": []
    };

    // iterate each round of arcs to animate
    var counter = 0;
    var j = 0;
    var lastRound = false;
    // initiate the first round setup
    updateArcs();
    // recursively animate each round of animations
    // animate();

    function updateArcs() {

        var arcActive;
        var arcHead;
        var markerList = [];

        arcsActive = {
            "type": "FeatureCollection",
            "features": []
        };
        arcsHead = {
            "type": "FeatureCollection",
            "features": []
        };

        // clear all icons shown on screen
        $(".athlete").hide()

        arcs.features.forEach(function(event, i) {

            // check if an arc is listed in the slide['paths']
            var ifAnimate = paths[j].indexOf(event.properties.eventID);
            if (ifAnimate !== -1) {
                arcActive = {
                    "type": "feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": []
                    },
                    "properties": {
                        "homeCountry": event.properties.homeCountry,
                        "index": i
                    }
                };
                arcsActive.features.push(arcActive);

                arcHead = {
                    "type": "Feature",
                    "properties": {
                        "homeCountry": event.properties.homeCountry
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": []
                    }
                }
                arcsHead.features.push(arcHead);

                // show this person in the floating window
                $('#' + event.properties.id).show();
            };

        });

        // starting from the second round, add first round content to the static layers
        updateStatic();

        j++;

        animate();
    };

    // update static points/arcs
    function updateStatic() {
        map.getSource('arcs-head').setData(empty);
        map.getSource('arcs-active').setData(empty);

        // skip the first round. check if point/arc is in the array of the previous round
        if (j > 0) {
            points.features.forEach(function(point) {
                var index = years[idActive]["locations"][j - 1].indexOf(point.properties.name);
                if (index !== -1) {
                    pointsStatic.features.push(point);
                };
            });
            arcs.features.forEach(function(arc) {
                var index = years[idActive]["paths"][j - 1].indexOf(arc.properties.eventID);
                if (index !== -1) {
                    arcsStatic.features.push(arc);
                };
            });
            map.getSource('points').setData(pointsStatic);
            map.getSource('arcs').setData(arcsStatic);
        };
    };

    function animate() {

        if (counter === segmentNumber + 1) {

            // console.log('round ends', j, counter );
            counter = 0;

            // move on to the next round, unless last round is reached
            if (j === paths.length) {
                lastRound = true;
            } else {
                updateArcs();
            };

            if (lastRound) {
                // stop for good
                cancelAnimationFrame(animationID);
                updateStatic();
                $('.athlete').hide();
                // console.log('animation ends', j, counter );

            }

        } else {
            // for all every events of this year, do the animation
            arcsActive.features.forEach(function(arcActive, i) {
                var arcStatic = arcs.features[arcActive.properties.index];

                // Add one pair of coordinates from its corresponding arc in arcs
                arcActive.geometry.coordinates.push(arcStatic.geometry.coordinates[counter]);

                // update arc head circle position
                arcsHead.features[i].geometry.coordinates = arcStatic.geometry.coordinates[counter];
            });

            // Update the source with this new data.
            map.getSource('arcs-active').setData(arcsActive);
            map.getSource('arcs-head').setData(arcsHead);

            animationID = requestAnimationFrame(animate);
            counter++;
        };
    };
};

function getCamera() {
    var bounds = map.getBounds();
    console.log("[["+bounds._sw.lng+","+bounds._sw.lat+"],["+bounds._ne.lng+","+bounds._ne.lat+"]]");
}