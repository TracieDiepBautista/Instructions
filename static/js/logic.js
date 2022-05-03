// call data via API:

console.log("working");

// create variable /create tile layer that will be the background 
// of our map. Holding a specific map

let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    accessToken: API_KEY
});

// / Create the map object with center, zoom level and default layer. 
// Random choose Lat Long to have a very base layer as starting point
let map = L.map('mapid', {
    center: [40.7, -94.5],
    zoom: 8,
    layers: [streets]
});

//  Create a base layer that holds all  maps.
let baseMaps = {
    "Streets": streets
};

// 1. Add a 3rd layer group for the  data:

let allEarthquakes = new L.LayerGroup();

// 2. Add a reference to the major earthquake group to the overlays object.
let overlays = {
    "Earthquakes": allEarthquakes
};

//    Then we add a control to the map that will allow the user to change which
// layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// / Retrieve the earthquake GeoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: "#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }
    function getColor(magnitude) {
        if (magnitude > 5) {
            return "#EA2C2C";
        }
        if (magnitude > 4) {
            return "#EA822C";
        }
        if (magnitude > 3) {
            return "#EE9C00";
        }
        if (magnitude > 2) {
            return "#EECC00";
        }
        if (magnitude > 1) {
            return "#D4EE00";
        }
        return "#98EE00";
    }
    // define the size of the radious of the point on the map:
    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    // Here we create a legend control object.
    let legend = L.control({
        position: "bottomright"
    });

    // Then add all the details for the legend
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
            "#98EE00",
            "#D4EE00",
            "#EECC00",
            "#EE9C00",
            "#EA822C",
            "#EA2C2C"
        ];

        //  Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
                "<li style='background: " + colors[i] + "'></i> " +
                magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
        }
        return div;
    };


    // Finally, we our legend to the map.
    legend.addTo(map);

    // Creating a GeoJSON layer with the retrieved data.

    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function (feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
        },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // We create a popup for each circleMarker to display the magnitude and location of the earthquake
        //  after the marker has been created and styled.
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
    }).addTo(allEarthquakes);
    // Then we add the earthquake layer to our map.
    allEarthquakes.addTo(map);

});